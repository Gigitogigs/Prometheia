from django.db import transaction
from django.db.models import F
from Prometheia.celery import app
from .logic.ai_council import judge_architect, judge_paladin, judge_scribe # Placeholder judges
from .models import CommitLog


@app.task
def evaluate_commit_with_ai(commit_id: int):
    """
    Celery task that runs the AI Council evaluations on a specific commit,
    updates the user's XP, and marks the commit as processed.
    """
    try:
        commit_log = CommitLog.objects.get(id=commit_id)
    except CommitLog.DoesNotExist:
        return f"Commit with ID {commit_id} does not exist."

    if commit_log.is_processed:
        return f"Commit {commit_log.commit_hash} has already been processed."

    print(f"Starting AI evaluation for commit: {commit_log.commit_hash}")

    # --- AI Council Evaluation ---
    # For now, they use the placeholder logic which creates JudgeEvaluation objects.
    architect_eval = judge_architect(commit_log)
    paladin_eval = judge_paladin(commit_log)
    scribe_eval = judge_scribe(commit_log)

    total_xp = architect_eval.xp_awarded + paladin_eval.xp_awarded + scribe_eval.xp_awarded

    # --- Database Updates in a Transaction ---
    # Use a transaction to ensure that if any part of the update fails, all changes are rolled back.
    try:
        with transaction.atomic():
            # 1. Update the CommitLog
            commit_log.total_xp_awarded = total_xp
            commit_log.is_processed = True
            commit_log.save(update_fields=['total_xp_awarded', 'is_processed'])

            # 2. Update the UserProfile's total XP using an F() expression to prevent race conditions
            author_profile = commit_log.author
            if author_profile:
                author_profile.total_xp = F('total_xp') + total_xp
                author_profile.save(update_fields=['total_xp'])

    except Exception as e:
        print(f"Error during database update for commit {commit_log.id}: {e}")
        raise

    print(f"Finished AI evaluation for commit: {commit_log.commit_hash}. Awarded {total_xp} XP.")
    return f"Evaluation completed for {commit_log.commit_hash}. User '{author_profile.github_username}' awarded {total_xp} XP."