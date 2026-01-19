from Prometheia.celery import app
from .logic.ai_council import judge_architect, judge_paladin, judge_scribe # Placeholder judges
from .models import CommitLog
from .services.github_client import fetch_github_diff, GitHubAPIError
from .services.xp_calculator import XPCalculator
import opik

@app.task
@opik.track(name="evaluate_commit_with_ai")
def evaluate_commit_with_ai(commit_id: int):
    """
    Celery task that runs the AI Council evaluations on a specific commit,
    updates the user's XP, and marks the commit as processed.
    """
    try:
        # Pre-fetch related author and repository to avoid N+1 queries later.
        commit_log = CommitLog.objects.select_related('author', 'repository').get(id=commit_id)
    except CommitLog.DoesNotExist:
        return f"Commit with ID {commit_id} does not exist."

    if commit_log.is_processed:
        return f"Commit {commit_log.commit_hash} has already been processed."

    print(f"Starting AI evaluation for commit: {commit_log.commit_hash}")

    # --- Step 1: Fetch the raw diff from GitHub ---
    # This is a network-bound operation, perfect for a Celery task.
    try:
        raw_diff = fetch_github_diff(
            owner=commit_log.repository.owner,
            repo_name=commit_log.repository.name,
            commit_hash=commit_log.commit_hash
        )
        # Save the fetched diff to the log for auditability and so judges can access it.
        commit_log.raw_diff = raw_diff
        commit_log.save(update_fields=['raw_diff'])
    except GitHubAPIError as e:
        # If we can't fetch the diff (e.g., commit was deleted, repo is private),
        # we can't proceed. Mark as processed to avoid retries.
        error_message = f"Failed to fetch diff for commit {commit_log.commit_hash}. Reason: {e}"
        print(error_message)
        commit_log.is_processed = True
        commit_log.save(update_fields=['is_processed'])
        return error_message

    # --- AI Council Evaluation ---
    # The judges can now access the `raw_diff` via the `commit_log` object.
    architect_eval = judge_architect(commit_log)
    paladin_eval = judge_paladin(commit_log)
    scribe_eval = judge_scribe(commit_log)

    # --- Database Updates via Service ---
    if commit_log.author:
        try:
            result = XPCalculator.update_user_xp(
                user_profile=commit_log.author,
                commit_log=commit_log,
                architect_score=architect_eval.xp_awarded,
                paladin_score=paladin_eval.xp_awarded,
                scribe_score=scribe_eval.xp_awarded
            )
            total_xp = result['xp_awarded']
            print(f"Finished AI evaluation for commit: {commit_log.commit_hash}. Awarded {total_xp} XP.")
            return f"Evaluation completed for {commit_log.commit_hash}. User '{commit_log.author.github_username}' awarded {total_xp} XP."
        except Exception as e:
            print(f"Error updating XP: {e}")
            raise e
    else:
        # Fallback if no author is linked (e.g. user deleted account but commit remains)
        total_xp = architect_eval.xp_awarded + paladin_eval.xp_awarded + scribe_eval.xp_awarded
        commit_log.total_xp_awarded = total_xp
        commit_log.is_processed = True
        commit_log.save(update_fields=['total_xp_awarded', 'is_processed'])
        return f"Evaluation completed for {commit_log.commit_hash}. No linked user profile."