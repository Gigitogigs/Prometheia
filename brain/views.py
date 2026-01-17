from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
import json
import logging
import secrets

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from allauth.socialaccount.models import SocialToken, SocialAccount

from .models import Repository, UserProfile, CommitLog
from .services.github_webhook_handler import verify_github_webhook
from .services.github_client import create_repository_webhook, GitHubAPIError
from .serializers import RepositoryCreateSerializer
from .tasks import evaluate_commit_with_ai


logger = logging.getLogger(__name__)

# Note: The csrf_exempt is for the webhook receiver from GitHub.
# The new APIView for creating webhooks will use DRF's default CSRF protection with sessions or tokens.

@csrf_exempt
def github_webhook(request):
    """
    Handles incoming GitHub webhook events (e.g., push).
    This view is the entry point for the AI evaluation process. It verifies
    the request signature before queueing any tasks.
    """
    if request.method != 'POST':
        return HttpResponse("This endpoint is for GitHub webhooks (POST requests only).", status=405)

    # It's good practice to get the IP address for logging purposes.
    # Note: In a production environment behind a proxy, you might need to check
    # request.META.get('HTTP_X_FORWARDED_FOR').
    ip_address = request.META.get('REMOTE_ADDR')

    # 1. Verify the signature from GitHub for security.
    signature = request.headers.get('X-Hub-Signature-256')
    if not signature:
        logger.warning("Webhook received without X-Hub-Signature-256 header from IP: %s", ip_address)
        return JsonResponse({'status': 'error', 'message': 'Missing X-Hub-Signature-256 header.'}, status=400)

    # Add a check for an empty body to provide a clearer error.
    if not request.body:
        return JsonResponse({'status': 'error', 'message': 'Request body is empty. Ensure webhook is configured to send a JSON payload.'}, status=400)

    try:
        payload = json.loads(request.body)
        repo_full_name = payload.get('repository', {}).get('full_name')
        if not repo_full_name:
            logger.warning("Webhook payload from IP %s is missing repository.full_name.", ip_address)
            return JsonResponse({'status': 'error', 'message': 'Invalid payload: repository.full_name missing.'}, status=400)
    except json.JSONDecodeError:
        logger.warning("Invalid JSON payload received from IP: %s", ip_address)
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    try:
        repository = Repository.objects.get(full_name=repo_full_name, is_active=True)
    except Repository.DoesNotExist:
        logger.warning(
            "Webhook received for untracked or inactive repository '%s' from IP: %s",
            repo_full_name,
            ip_address
        )
        return JsonResponse({'status': 'error', 'message': f'Repository "{repo_full_name}" not configured or is inactive.'}, status=404)

    if not verify_github_webhook(request.body, signature, repository.webhook_secret):
        logger.warning(
            "GitHub webhook signature verification failed for repo '%s' from IP: %s",
            repo_full_name,
            ip_address
        )
        return JsonResponse({'status': 'error', 'message': 'Signature verification failed.'}, status=403)

    # 2. Handle different event types from GitHub.
    event_type = request.headers.get('X-GitHub-Event')

    if event_type == 'ping':
        # The 'ping' event is sent when the webhook is first created.
        return JsonResponse({'status': 'success', 'message': 'Webhook ping successful.'})

    if event_type == 'push':
        # This is the main event we care about.
        # TODO: Parse the payload to extract commit information.
        commits = payload.get('commits', [])
        if not commits:
            return JsonResponse({'status': 'ignored', 'message': 'Push event contains no commits.'})        
        
        for commit_data in commits:
            commit_hash = commit_data.get('id')
            # Avoid processing the same commit twice
            if CommitLog.objects.filter(commit_hash=commit_hash).exists():
                logger.info(f"Skipping already processed commit: {commit_hash}")
                continue

            # Get the author of the specific commit, not the pusher of the event
            author_username = commit_data.get('author', {}).get('username')
            if not author_username:
                logger.warning(f"Commit {commit_hash} is missing an author username. Skipping.")
                continue
            
            try:
                author_profile = UserProfile.objects.get(github_username=author_username)
            except UserProfile.DoesNotExist:
                logger.warning(f"Received commit from user '{author_username}' who is not registered. Skipping commit {commit_hash}.")
                continue

            # Create the CommitLog entry and trigger the background task
            new_commit_log = CommitLog.objects.create(
                repository=repository,
                author=author_profile,
                commit_hash=commit_hash,
                message=commit_data.get('message'),
                timestamp=commit_data.get('timestamp'),
                url=commit_data.get('url')
            )
            print(f"New Commit Found: {commit_hash}")
            print(f"  - Queuing for AI evaluation (CommitLog ID: {new_commit_log.id})")
            evaluate_commit_with_ai.delay(new_commit_log.id)

        return JsonResponse({'status': 'accepted', 'message': 'Push event received and verified. Processing will occur asynchronously.'}, status=202)

    # Acknowledge other events but do nothing with them.
    return JsonResponse({'status': 'ignored', 'message': f"Webhook for event '{event_type}' received but not processed."})


class RepositoryWebhookCreateView(APIView):
    """
    An endpoint for authenticated users to register one of their repositories.
    This view will:
    1. Validate the repository name.
    2. Use the user's OAuth token to call the GitHub API.
    3. Create a new webhook on the specified repository.
    4. Store the repository details and the webhook secret in the database.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = RepositoryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        repo_name = serializer.validated_data['repo_name']
        user = request.user

        try:
            # Get user's GitHub social account to find the owner's username
            github_account = SocialAccount.objects.get(user=user, provider='github')
            owner = github_account.extra_data.get('login')
            if not owner:
                return Response(
                    {'error': 'Could not determine GitHub username from your social account.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get user's GitHub OAuth token
            social_token = SocialToken.objects.get(account=github_account)
            user_github_token = social_token.token
        except SocialAccount.DoesNotExist:
            return Response(
                {'error': 'GitHub social account not linked. Please connect your GitHub account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except SocialToken.DoesNotExist:
            return Response(
                {'error': 'GitHub token not found. Please try reconnecting your GitHub account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        repo_full_name = f"{owner}/{repo_name}"
        if Repository.objects.filter(full_name=repo_full_name).exists():
            return Response(
                {'error': f'Repository "{repo_full_name}" is already being tracked.'},
                status=status.HTTP_409_CONFLICT
            )

        webhook_secret = secrets.token_hex(32)
        webhook_url = request.build_absolute_uri(reverse('github_webhook'))

        try:
            webhook_id = create_repository_webhook(
                owner=owner,
                repo_name=repo_name,
                user_github_token=user_github_token,
                webhook_url=webhook_url,
                webhook_secret=webhook_secret,
            )
        except GitHubAPIError as e:
            return Response({'error': 'Failed to create GitHub webhook.', 'details': e.message}, status=e.status_code)

        # Ensure a UserProfile exists before creating the Repository
        user_profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'github_username': owner})

        Repository.objects.create(
            owner=user_profile,
            name=repo_name,
            full_name=repo_full_name,
            webhook_secret=webhook_secret,
        )

        return Response(
            {'status': 'success', 'message': f'Webhook created successfully for {repo_full_name}.', 'webhook_id': webhook_id},
            status=status.HTTP_201_CREATED
        )
