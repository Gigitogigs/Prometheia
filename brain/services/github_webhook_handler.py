import hmac
import hashlib
from datetime import datetime

from ..models import CommitLog, Repository


def verify_github_webhook(payload_raw: bytes, signature: str, secret: str) -> bool:
    """
    Verify HMAC-SHA256 signature from a GitHub webhook.

    GitHub sends the signature in the format: X-Hub-Signature-256 = sha256=<hex_digest>
    This function computes the expected signature and compares it to the received one
    in a timing-safe manner.
    """
    if not signature or not secret:
        return False

    expected_signature = 'sha256=' + hmac.new(
        secret.encode('utf-8'), payload_raw, hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)


def process_push_event(repository: Repository, payload: dict) -> int:
    """
    Parses a GitHub 'push' event payload, creating CommitLog entries for new commits.

    This function is idempotent and will not create duplicate entries if a
    webhook is redelivered. It only processes distinct commits.

    Args:
        repository: The Repository instance this push belongs to.
        payload: The deserialized JSON payload from the GitHub webhook.

    Returns:
        The number of new, distinct commits processed.
    """
    processed_count = 0
    for commit_data in payload.get('commits', []):
        # Only process new commits, not force-pushes of old ones
        if not commit_data.get('distinct', False):
            continue

        # The timestamp from GitHub is ISO 8601 format with a 'Z' for UTC.
        commit_timestamp = datetime.fromisoformat(commit_data['timestamp'].replace('Z', '+00:00'))

        _, created = CommitLog.objects.update_or_create(
            commit_hash=commit_data['id'],
            defaults={
                'repository': repository,
                'message': commit_data['message'],
                'timestamp': commit_timestamp,
                'url': commit_data['url'],
            }
        )
        if created:
            processed_count += 1
    
    return processed_count