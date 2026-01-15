import hmac
import hashlib

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