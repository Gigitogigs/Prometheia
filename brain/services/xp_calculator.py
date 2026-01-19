from datetime import datetime, timedelta
from django.db import transaction
from django.utils import timezone
from typing import Dict, Tuple
from decimal import Decimal

# Adapted imports for Prometheia
from brain.models import UserProfile, CommitLog

class XPCalculator:
    """
    Handles XP calculation, aggregation, and user progression for Prometheia.
    """
    
    # Configuration constants
    ARCHITECT_WEIGHT = 1.0
    PALADIN_WEIGHT = 1.0
    SCRIBE_WEIGHT = 1.2  # Documentation is emphasized
    
    BONUS_EXCEPTIONAL = 5
    BONUS_ITERATION = 5
    PENALTY_CRITICAL = -10
    
    MIN_XP = 0
    MAX_XP = 500
    
    # Level progression
    XP_PER_LEVEL = 500
    INITIAL_LEVEL = 1
    
    # Streak tracking
    STREAK_RESET_DAYS = 2
    
    @staticmethod
    def calculate_total_xp(
        architect_score: int,
        paladin_score: int,
        scribe_score: int,
        bonuses: Dict[str, bool] = None,
        penalties: Dict[str, bool] = None
    ) -> int:
        """
        Calculate total XP using a summation approach.
        """
        bonuses = bonuses or {}
        penalties = penalties or {}
        
        # Apply weights
        weighted_total = (
            architect_score * XPCalculator.ARCHITECT_WEIGHT +
            paladin_score * XPCalculator.PALADIN_WEIGHT +
            scribe_score * XPCalculator.SCRIBE_WEIGHT
        )
        
        # Summation model: Use the weighted total directly
        current_xp = weighted_total
        
        # Apply bonuses
        if bonuses.get('exceptional', False):
            current_xp += XPCalculator.BONUS_EXCEPTIONAL
        if bonuses.get('iteration', False):
            current_xp += XPCalculator.BONUS_ITERATION
        
        # Apply penalties
        if penalties.get('critical', False):
            current_xp += XPCalculator.PENALTY_CRITICAL
        
        # Cap between MIN_XP and MAX_XP
        total_xp = max(
            XPCalculator.MIN_XP,
            min(int(round(current_xp)), XPCalculator.MAX_XP)
        )
        
        return total_xp
    
    @staticmethod
    def calculate_level_and_xp(total_xp_earned: int) -> Tuple[int, int]:
        level = XPCalculator.INITIAL_LEVEL + (total_xp_earned // XPCalculator.XP_PER_LEVEL)
        xp_in_level = total_xp_earned % XPCalculator.XP_PER_LEVEL
        return level, xp_in_level
    
    @staticmethod
    def calculate_xp_to_next_level(total_xp_earned: int) -> int:
        _, xp_in_level = XPCalculator.calculate_level_and_xp(total_xp_earned)
        return XPCalculator.XP_PER_LEVEL - xp_in_level
    
    @staticmethod
    def update_streak(user_profile: UserProfile, current_date: datetime = None) -> int:
        if current_date is None:
            current_date = timezone.now()
        
        last_commit = user_profile.last_commit_date
        
        # Adapted field name: current_streak
        if last_commit is None:
            user_profile.current_streak = 1
        else:
            days_since_last = (current_date.date() - last_commit.date()).days
            
            if days_since_last <= XPCalculator.STREAK_RESET_DAYS:
                user_profile.current_streak += 1
            else:
                user_profile.current_streak = 1
        
        user_profile.last_commit_date = current_date
        return user_profile.current_streak
    
    @staticmethod
    @transaction.atomic
    def update_user_xp(
        user_profile: UserProfile,
        commit_log: CommitLog, # Adapted type hint
        architect_score: int,
        paladin_score: int,
        scribe_score: int,
        bonuses: Dict[str, bool] = None,
        penalties: Dict[str, bool] = None
    ) -> Dict:
        """
        Atomically update user profile and commit log.
        """
        # Validate scores
        for score, name in [
            (architect_score, "architect_score"),
            (paladin_score, "paladin_score"),
            (scribe_score, "scribe_score"),
        ]:
            if not (0 <= score <= 100):
                raise ValueError(f"{name} must be between 0 and 100, got {score}")
        
        # Calculate XP
        xp_awarded = XPCalculator.calculate_total_xp(
            architect_score=architect_score,
            paladin_score=paladin_score,
            scribe_score=scribe_score,
            bonuses=bonuses,
            penalties=penalties
        )
        
        previous_level, _ = XPCalculator.calculate_level_and_xp(user_profile.total_xp)
        
        # Update User Profile
        user_profile.total_xp += xp_awarded
        streak = XPCalculator.update_streak(user_profile)
        
        new_level, xp_in_level = XPCalculator.calculate_level_and_xp(user_profile.total_xp)
        xp_to_next = XPCalculator.calculate_xp_to_next_level(user_profile.total_xp)
        level_up = new_level > previous_level
        
        # Adapted field name: current_level
        user_profile.current_level = new_level
        
        user_profile.save(update_fields=[
            'total_xp',
            'last_commit_date',
            'current_streak', # Adapted from commit_streak
            'current_level'   # Adapted
        ])
        
        # Update CommitLog
        # Adapted: commit_log.author instead of commit.user
        commit_log.author = user_profile 
        commit_log.total_xp_awarded = xp_awarded # Adapted from xp_awarded
        commit_log.is_processed = True
        commit_log.save(update_fields=['author', 'total_xp_awarded', 'is_processed'])
        
        return {
            'xp_awarded': xp_awarded,
            'total_xp': user_profile.total_xp,
            'level': new_level,
            'xp_in_level': xp_in_level,
            'xp_to_next_level': xp_to_next,
            'streak': streak,
            'level_up': level_up,
        }
