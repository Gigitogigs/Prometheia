from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Repository
from .services.github_webhook_handler import verify_github_webhook
from .services.github_webhook_handler import verify_github_webhook, process_push_event


@csrf_exempt
def github_webhook(request):
    """
    Handles incoming GitHub webhook events (e.g., push).
    This view is the entry point for the AI evaluation process. It verifies
    the request signature before queueing any tasks.
    """
    if request.method != 'POST':
        return HttpResponse("This endpoint is for GitHub webhooks (POST requests only).", status=405)

    # 1. Verify the signature from GitHub for security.
    signature = request.headers.get('X-Hub-Signature-256')
    if not signature:
        return JsonResponse({'status': 'error', 'message': 'Missing X-Hub-Signature-256 header.'}, status=401)

    # Add a check for an empty body to provide a clearer error.
    if not request.body:
        return JsonResponse({'status': 'error', 'message': 'Request body is empty. Ensure webhook is configured to send a JSON payload.'}, status=400)

    try:
        payload = json.loads(request.body)
        repo_full_name = payload.get('repository', {}).get('full_name')
        if not repo_full_name:
            return JsonResponse({'status': 'error', 'message': 'Invalid payload: repository.full_name missing.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload.'}, status=400)

    try:
        repository = Repository.objects.get(full_name=repo_full_name, is_active=True)
    except Repository.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': f'Repository "{repo_full_name}" not configured or is inactive.'}, status=404)

    if not verify_github_webhook(request.body, signature, repository.webhook_secret):
        return JsonResponse({'status': 'error', 'message': 'Signature verification failed.'}, status=403)

    # 2. Handle different event types from GitHub.
    event_type = request.headers.get('X-GitHub-Event')

    if event_type == 'ping':
        # The 'ping' event is sent when the webhook is first created.
        return JsonResponse({'status': 'success', 'message': 'Webhook ping successful.'})

    if event_type == 'push':
        # This is the main event we care about.
        # TODO: Parse the payload to extract commit information.
        # This is the main event we care about. We parse the payload to create CommitLog entries.
        processed_count = process_push_event(repository, payload)
        
        # TODO: Trigger the AI council evaluation for the new commit(s) via Celery.
        return JsonResponse({'status': 'accepted', 'message': 'Push event received and verified. Processing will occur asynchronously.'}, status=202)
        message = f"Push event received and verified. Found {processed_count} new commit(s). Processing will occur asynchronously."
        return JsonResponse({'status': 'accepted', 'message': message}, status=202)

    # Acknowledge other events but do nothing with them.
    return JsonResponse({'status': 'ignored', 'message': f'Webhook for event "{event_type}" received but not processed.'})
