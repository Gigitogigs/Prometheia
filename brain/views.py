from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Repository
from .services.github_webhook_handler import verify_github_webhook


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

    # TODO: Parse the payload to extract commit information.
    # TODO: Trigger the AI council evaluation for the new commit(s) via Celery.
    return JsonResponse({'status': 'accepted', 'message': 'Webhook received and verified. Processing will occur asynchronously.'}, status=202)
