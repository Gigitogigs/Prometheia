import httpx
from django.conf import settings


class GitHubAPIError(Exception):
    """Custom exception for GitHub API-related errors."""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"GitHub API Error {status_code}: {message}")


def fetch_github_diff(owner: str, repo_name: str, commit_hash: str) -> str:
    """
    Fetches the raw diff for a specific commit from the GitHub API.

    The diff format is essential for the AI Council to analyze the code changes.

    Args:
        owner: The owner of the repository (user or organization).
        repo_name: The name of the repository.
        commit_hash: The full SHA-1 hash of the commit.

    Returns:
        The raw diff content as a string.

    Raises:
        GitHubAPIError: If the API call fails (e.g., 404 Not Found, 403 Forbidden, network issues).
    """
    api_url = f"https://api.github.com/repos/{owner}/{repo_name}/commits/{commit_hash}"
    
    headers = {
        "Accept": "application/vnd.github.v3.diff",
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    try:
        # Using a context manager ensures the client is properly closed.
        with httpx.Client(timeout=30.0) as client:
            response = client.get(api_url, headers=headers)
            response.raise_for_status()  # Raises HTTPStatusError for 4xx/5xx responses
            return response.text
            
    except httpx.RequestError as e:
        # This catches network errors, timeouts, etc., and wraps them in our custom exception.
        error_message = f"A network error occurred while fetching diff for {commit_hash}: {str(e)}"
        raise GitHubAPIError(status_code=503, message=error_message) from e


def create_repository_webhook(
    owner: str,
    repo_name: str,
    user_github_token: str,
    webhook_url: str,
    webhook_secret: str,
) -> int:
    """
    Creates a webhook for a given repository using the GitHub API.

    This requires the user to have granted our app permission via OAuth with the
    'admin:repo_hook' scope.

    Args:
        owner: The owner of the repository.
        repo_name: The name of the repository.
        user_github_token: The user's OAuth token.
        webhook_url: The public URL for our webhook receiver endpoint.
        webhook_secret: The secret used to secure the webhook payloads.

    Returns:
        The ID of the created webhook from GitHub.

    Raises:
        GitHubAPIError: If the API call fails.
    """
    api_url = f"https://api.github.com/repos/{owner}/{repo_name}/hooks"
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {user_github_token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    payload = {
        "name": "web",
        "active": True,
        "events": ["push"],
        "config": {
            "url": webhook_url,
            "content_type": "json",
            "secret": webhook_secret,
        },
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(api_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["id"]
    except httpx.RequestError as e:
        error_message = f"A network error occurred while creating webhook for {owner}/{repo_name}: {str(e)}"
        raise GitHubAPIError(status_code=503, message=error_message) from e
    except httpx.HTTPStatusError as e:
        error_message = f"Failed to create webhook for {owner}/{repo_name}. Response: {e.response.text}"
        raise GitHubAPIError(status_code=e.response.status_code, message=error_message) from e