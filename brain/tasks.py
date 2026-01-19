from Prometheia.celery import app
from .logic.ai_council import judge_architect, judge_paladin, judge_scribe # Placeholder judges
from .models import CommitLog
from .services.github_client import fetch_github_diff, GitHubAPIError
from .services.xp_calculator import XPCalculator
import opik
import time
import logging

logger = logging.getLogger(__name__)

@app.task
@opik.track(name="evaluate_commit_with_ai")
def evaluate_commit_with_ai(commit_id: int):
    """
    Celery task that runs the AI Council evaluations on a specific commit,
    updates the user's XP, and marks the commit as processed.
    """
    start_time = time.time()
    log_extra = {'commit_id': commit_id}

    try:
        commit_log = CommitLog.objects.select_related('author', 'repository').get(id=commit_id)
        log_extra.update({
            'commit_hash': commit_log.commit_hash,
            'repo_full_name': commit_log.repository.full_name,
            'author_username': commit_log.author.github_username if commit_log.author else None,
        })
    except CommitLog.DoesNotExist:
        logger.warning("Commit with ID does not exist.", extra=log_extra)
        return f"Commit with ID {commit_id} does not exist."

    if commit_log.is_processed:
        logger.info("Commit has already been processed.", extra=log_extra)
        return f"Commit {commit_log.commit_hash} has already been processed."

    logger.info("Starting AI evaluation for commit.", extra=log_extra)

    try:
        raw_diff = fetch_github_diff(
            owner=commit_log.repository.owner,
            repo_name=commit_log.repository.name,
            commit_hash=commit_log.commit_hash
        )
        commit_log.raw_diff = raw_diff
        commit_log.save(update_fields=['raw_diff'])
    except GitHubAPIError as e:
        log_extra['error'] = str(e)
        logger.error("Failed to fetch diff from GitHub.", extra=log_extra)
        commit_log.is_processed = True
        commit_log.save(update_fields=['is_processed'])
        return f"Failed to fetch diff for commit {commit_log.commit_hash}. Reason: {e}"

    # AI Council Evaluation
    council_start_time = time.time()
    architect_eval = judge_architect(commit_log)
    paladin_eval = judge_paladin(commit_log)
    scribe_eval = judge_scribe(commit_log)
    council_latency = time.time() - council_start_time
    log_extra['council_latency'] = council_latency
    logger.info("AI council evaluation finished.", extra=log_extra)


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
            log_extra['total_xp_awarded'] = total_xp
            logger.info("User XP updated.", extra=log_extra)
        except Exception as e:
            log_extra['error'] = str(e)
            logger.exception("Error updating user XP.", extra=log_extra)
            raise e
    else:
        total_xp = architect_eval.xp_awarded + paladin_eval.xp_awarded + scribe_eval.xp_awarded
        commit_log.total_xp_awarded = total_xp
        commit_log.is_processed = True
        commit_log.save(update_fields=['total_xp_awarded', 'is_processed'])
        log_extra['total_xp_awarded'] = total_xp
        logger.info("Commit processed without a linked user.", extra=log_extra)

    total_latency = time.time() - start_time
    log_extra['total_latency'] = total_latency
    logger.info("Finished AI evaluation for commit.", extra=log_extra)
    return f"Evaluation completed for {commit_log.commit_hash}."