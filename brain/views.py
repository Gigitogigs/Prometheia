from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
import json
import logging
from django.utils.dateparse import parse_datetime
import secrets

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import AnonRateThrottle
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db import IntegrityError
from django.db.models import F
from allauth.socialaccount.models import SocialToken, SocialAccount

from .models import Repository, UserProfile, CommitLog, JudgeEvaluation
from .services.github_webhook_handler import verify_github_webhook, generate_deterministic_webhook_secret
from .services.github_client import create_repository_webhook, GitHubAPIError
from .serializers import (
    RepositoryCreateSerializer,
    UserProfileSerializer,
    CommitLogSerializer,
    CommitLogDetailSerializer,
    JudgeEvaluationSerializer,
)
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

    ip_address = request.META.get('REMOTE_ADDR')
    signature = request.headers.get('X-Hub-Signature-256')
    event_type = request.headers.get('X-GitHub-Event')

    log_extra = {
        'ip_address': ip_address,
        'event_type': event_type,
    }

    if not signature:
        logger.warning("Webhook received without X-Hub-Signature-256 header", extra=log_extra)
        return JsonResponse({'status': 'error', 'message': 'Missing X-Hub-Signature-256 header.'}, status=400)

    if not request.body:
        logger.warning("Webhook received with empty body", extra=log_extra)
        return JsonResponse({'status': 'error', 'message': 'Request body is empty. Ensure webhook is configured to send a JSON payload.'}, status=400)

    try:
        payload = json.loads(request.body)
        repo_full_name = payload.get('repository', {}).get('full_name')
        log_extra['repo_full_name'] = repo_full_name
        if not repo_full_name:
            logger.warning("Webhook payload missing repository.full_name", extra=log_extra)
            return JsonResponse({'status': 'error', 'message': 'Invalid payload: repository.full_name missing.'}, status=400)
    except json.JSONDecodeError:
        logger.warning("Invalid JSON payload received", extra=log_extra)
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    try:
        repository = Repository.objects.get(full_name=repo_full_name, is_active=True)
    except Repository.DoesNotExist:
        logger.warning("Webhook received for untracked or inactive repository", extra=log_extra)
        return JsonResponse({'status': 'error', 'message': f'Repository "{repo_full_name}" not configured or is inactive.'}, status=404)

    expected_secret = generate_deterministic_webhook_secret(repo_full_name)

    if not verify_github_webhook(request.body, signature, expected_secret):
        logger.warning("GitHub webhook signature verification failed", extra=log_extra)
        return JsonResponse({'status': 'error', 'message': 'Signature verification failed.'}, status=403)

    if event_type == 'ping':
        logger.info("Webhook ping successful", extra=log_extra)
        return JsonResponse({'status': 'success', 'message': 'Webhook ping successful.'})

    if event_type == 'push':
        commits = payload.get('commits', [])
        if not commits:
            logger.info("Push event contains no commits", extra=log_extra)
            return JsonResponse({'status': 'ignored', 'message': 'Push event contains no commits.'})        
        
        for commit_data in commits:
            commit_hash = commit_data.get('id')
            author_username = commit_data.get('author', {}).get('username')

            commit_log_extra = log_extra.copy()
            commit_log_extra.update({
                'commit_hash': commit_hash,
                'author_username': author_username,
            })

            if CommitLog.objects.filter(commit_hash=commit_hash).exists():
                logger.info("Skipping already processed commit", extra=commit_log_extra)
                continue

            if not author_username:
                logger.warning("Commit is missing an author username. Skipping.", extra=commit_log_extra)
                continue
            
            try:
                author_profile = UserProfile.objects.get(github_username=author_username)
            except UserProfile.DoesNotExist:
                logger.warning("Received commit from user who is not registered. Skipping commit.", extra=commit_log_extra)
                continue

            try:
                new_commit_log = CommitLog.objects.create(
                    repository=repository,
                    author=author_profile,
                    commit_hash=commit_hash,
                    message=commit_data.get('message'),
                    timestamp=parse_datetime(commit_data.get('timestamp')),
                    url=commit_data.get('url')
                )
                commit_log_extra['commit_log_id'] = new_commit_log.id
                logger.info("New commit found. Queuing for AI evaluation", extra=commit_log_extra)
                evaluate_commit_with_ai.delay(new_commit_log.id)
            except IntegrityError:
                # Catch race condition where duplicate webhook arrives concurrently and passes the exists() check
                logger.warning("Ignored IntegrityError on commit creation. Likely duplicate webhook.", extra=commit_log_extra)
                continue

        return JsonResponse({'status': 'accepted', 'message': 'Push event received and verified. Processing will occur asynchronously.'}, status=202)

    logger.info("Webhook for unhandled event received", extra=log_extra)
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
    # The permission class is now set globally in settings.py under REST_FRAMEWORK.
    # This keeps views cleaner and ensures consistent policy.
    # permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = RepositoryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # --- Step 1: Get the Social Account, which is the source of truth. ---
        try:
            user = request.user
            github_account = user.socialaccount_set.get(provider='github')
        except SocialAccount.DoesNotExist:
            return Response(
                {'error': f"The authenticated user '{user.username}' does not have a GitHub social account linked. Please log in with GitHub first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Step 2: Ensure UserProfile exists, creating it lazily if needed. ---
        # This is more robust than relying only on the signup signal.
        github_username = github_account.extra_data.get('login')
        avatar_url = github_account.extra_data.get('avatar_url')
        user_profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'github_username': github_username, 'avatar_url': avatar_url}
        )
        if created:
            logger.info(f"Lazily created UserProfile for user '{user.username}'.")

        # --- Step 3: Get the GitHub OAuth token. ---
        try:
            social_token = SocialToken.objects.get(account=github_account)
            user_github_token = social_token.token
        except SocialToken.DoesNotExist:
            return Response(
                {'error': f"A GitHub OAuth token was not found for user '{user.username}'. Please try revoking app access on GitHub and logging in again to grant the correct permissions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        repo_name = serializer.validated_data['repo_name']
        owner = user_profile.github_username
        repo_full_name = f"{owner}/{repo_name}"
        if Repository.objects.filter(full_name=repo_full_name).exists():
            return Response(
                {'error': f'Repository "{repo_full_name}" is already being tracked.'},
                status=status.HTTP_409_CONFLICT
            )

        webhook_secret = generate_deterministic_webhook_secret(repo_full_name)
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

        Repository.objects.create(
            owner=user_profile,
            name=repo_name,
            full_name=repo_full_name,
        )

        return Response(
            {'status': 'success', 'message': f'Webhook created successfully for {repo_full_name}.', 'webhook_id': webhook_id},
            status=status.HTTP_201_CREATED
        )


# ============================================================================
# PHASE 3: LEADERBOARD & DETAIL ENDPOINTS
# ============================================================================

class LeaderboardPagination(PageNumberPagination):
    """Custom pagination for leaderboard endpoint."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class LeaderboardListView(ListAPIView):
    """
    GET /api/leaderboard/
    
    Returns top users ranked by total XP.
    
    Query parameters:
    - page: Page number (default 1)
    - page_size: Results per page (default 20, max 100)
    - min_level: Filter by minimum level
    
    Response includes:
    - Rank (calculated position)
    - XP, Level, Streak
    - Avatar and GitHub username
    - XP to next level
    
    Example:
    GET /api/leaderboard/?page=1&min_level=5
    """
    queryset = UserProfile.objects.all().order_by('-total_xp', '-current_level')
    serializer_class = UserProfileSerializer
    pagination_class = LeaderboardPagination
    permission_classes = []  # Public endpoint
    throttle_classes = [AnonRateThrottle]
    
    @method_decorator(cache_page(60 * 5))  # Cache leaderboard for 5 minutes
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    def get_queryset(self):
        """
        Filter by minimum level if provided.
        Optimize with select_related to avoid N+1 queries.
        """
        queryset = UserProfile.objects.all().order_by('-total_xp', '-current_level')
        
        min_level = self.request.query_params.get('min_level')
        if min_level:
            try:
                queryset = queryset.filter(current_level__gte=int(min_level))
            except ValueError:
                pass  # Ignore invalid min_level values
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to inject rank into each user."""
        response = super().list(request, *args, **kwargs)
        
        # Calculate rank for each user
        offset = (int(request.query_params.get('page', 1)) - 1) * self.pagination_class.page_size
        for idx, user_data in enumerate(response.data['results'], start=offset + 1):
            user_data['rank'] = idx
        
        return response


class UserProfileDetailView(RetrieveAPIView):
    """
    GET /api/users/{github_username}/

    Returns a public profile for a specific user — aggregate stats only.
    Commit details are NEVER included here to protect private/work repo data.

    If the requesting user is viewing their OWN profile while authenticated,
    a summary of their recent commit activity (count and XP only, no messages
    or repo names) is appended for their dashboard convenience.

    Includes (public):
    - XP, level, streak, avatar, title, rank

    Includes (own profile + authenticated only):
    - total_commits count
    - recent_xp_events: list of {xp_awarded, timestamp} (no messages/repos)

    Example:
    GET /api/users/john_doe/
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = []  # Public endpoint — aggregate stats only
    throttle_classes = [AnonRateThrottle]
    lookup_field = 'github_username'

    def get_serializer_context(self):
        """Inject leaderboard rank into serializer context."""
        context = super().get_serializer_context()
        user = self.get_object()
        rank = UserProfile.objects.filter(
            total_xp__gt=user.total_xp
        ).count() + 1
        context['rank'] = rank
        return context

    def retrieve(self, request, *args, **kwargs):
        """Return public aggregate profile with XP activity history.

        XP events (timestamps + amounts only) are public for all viewers —
        like GitHub's contribution graph, they show activity cadence without
        revealing any private repo names or commit messages.
        """
        response = super().retrieve(request, *args, **kwargs)
        user = self.get_object()

        # Total commit count — public, reveals nothing sensitive
        response.data['total_commits'] = CommitLog.objects.filter(author=user).count()

        # XP activity history — timestamps and XP only, NO repo names or commit messages.
        # Public by design: lets other devs see how someone has been progressing,
        # similar to GitHub's green contribution map.
        xp_history = (
            CommitLog.objects
            .filter(author=user, is_processed=True)
            .order_by('-timestamp')
            .values('timestamp', 'total_xp_awarded')[:90]  # Last 90 events (~3 months)
        )
        response.data['xp_history'] = list(xp_history)

        return response


class CommitFeedListView(ListAPIView):
    """
    GET /api/commits/

    Returns the authenticated user's own commits only.
    Commit messages, diffs, and repository names are private — never exposed
    publicly, even to other authenticated users, to protect private/work repos.

    Query parameters:
    - page: Page number (default 1)
    - page_size: Results per page (default 20)
    - is_processed: Filter by processing status (true/false)
    - repo: Filter by repository name (within own repos only)

    Example:
    GET /api/commits/?page=1&is_processed=true
    """
    serializer_class = CommitLogSerializer
    pagination_class = LeaderboardPagination
    permission_classes = [IsAuthenticated]  # 🔒 Auth required — owner-only data
    throttle_classes = [AnonRateThrottle]

    def get_queryset(self):
        """Return only commits authored by the requesting user."""
        queryset = CommitLog.objects.select_related(
            'author', 'repository'
        ).prefetch_related('evaluations').filter(
            author__user=self.request.user  # 🔒 Strict owner filter
        ).order_by('-timestamp')

        # Filter by processing status
        is_processed = self.request.query_params.get('is_processed')
        if is_processed is not None:
            queryset = queryset.filter(is_processed=is_processed.lower() == 'true')

        # Filter by repository (within own repos only)
        repo = self.request.query_params.get('repo')
        if repo:
            queryset = queryset.filter(repository__full_name__icontains=repo)

        return queryset


class CommitDetailView(RetrieveAPIView):
    """
    GET /api/commits/{commit_hash}/

    Returns detailed information about a specific commit.
    Only accessible by the commit's author — raw diffs and commit messages
    from private/work repos must never be exposed to other users.

    Includes:
    - Full commit metadata
    - Raw diff (for code review)
    - All AI judge evaluations with Opik trace links
    - Processing status

    Example:
    GET /api/commits/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/
    """
    serializer_class = CommitLogDetailSerializer
    permission_classes = [IsAuthenticated]  # 🔒 Auth required — owner-only data
    throttle_classes = [AnonRateThrottle]
    lookup_field = 'commit_hash'

    def get_queryset(self):
        """Scope queryset to the requesting user's commits only."""
        return CommitLog.objects.select_related(
            'author', 'repository'
        ).prefetch_related('evaluations').filter(
            author__user=self.request.user  # 🔒 Strict owner filter
        )


class JudgeEvaluationListView(ListAPIView):
    """
    GET /api/evaluations/

    Returns AI judge evaluations for the authenticated user's commits only.
    Evaluation reasoning may contain details from private/work repo diffs,
    so access is strictly limited to the commit's author.

    Query parameters:
    - judge: Filter by judge type (ARCHITECT, PALADIN, SCRIBE)
    - min_xp: Minimum XP awarded
    - max_xp: Maximum XP awarded
    - commit: Filter by commit hash (within own commits)

    Example:
    GET /api/evaluations/?judge=ARCHITECT&min_xp=70
    """
    serializer_class = JudgeEvaluationSerializer
    pagination_class = LeaderboardPagination
    permission_classes = [IsAuthenticated]  # 🔒 Auth required — owner-only data
    throttle_classes = [AnonRateThrottle]

    def get_queryset(self):
        """Return evaluations only for commits owned by the requesting user."""
        queryset = JudgeEvaluation.objects.select_related(
            'commit', 'commit__author', 'commit__repository'
        ).filter(
            commit__author__user=self.request.user  # 🔒 Strict owner filter
        ).order_by('-created_at')

        # Filter by judge type
        judge = self.request.query_params.get('judge')
        if judge in ['ARCHITECT', 'PALADIN', 'SCRIBE']:
            queryset = queryset.filter(judge_type=judge)

        # Filter by XP range
        min_xp = self.request.query_params.get('min_xp')
        if min_xp:
            try:
                queryset = queryset.filter(xp_awarded__gte=int(min_xp))
            except ValueError:
                pass

        max_xp = self.request.query_params.get('max_xp')
        if max_xp:
            try:
                queryset = queryset.filter(xp_awarded__lte=int(max_xp))
            except ValueError:
                pass

        # Filter by commit hash (within own commits only)
        commit = self.request.query_params.get('commit')
        if commit:
            queryset = queryset.filter(commit__commit_hash__istartswith=commit)

        return queryset


class JudgeEvaluationDetailView(RetrieveAPIView):
    """
    GET /api/evaluations/{id}/

    Returns detailed information about a specific judge evaluation.
    Only accessible by the commit's author — reasoning contains AI analysis
    of the raw diff which may expose private/work code context.

    Includes:
    - Judge type and full reasoning
    - Related commit and author
    - Opik trace proof_url (link to AI's reasoning dashboard)

    Example:
    GET /api/evaluations/42/
    """
    serializer_class = JudgeEvaluationSerializer
    permission_classes = [IsAuthenticated]  # 🔒 Auth required — owner-only data
    throttle_classes = [AnonRateThrottle]

    def get_queryset(self):
        """Scope queryset to evaluations on the requesting user's commits only."""
        return JudgeEvaluation.objects.select_related(
            'commit', 'commit__author', 'commit__repository'
        ).filter(
            commit__author__user=self.request.user  # 🔒 Strict owner filter
        )

