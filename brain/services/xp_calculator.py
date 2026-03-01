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
        current_streak: int = 1,
        bonuses: Dict[str, bool] = None,
        penalties: Dict[str, bool] = None
    ) -> int:
        """
        Calculate total XP using the Multiplier approach outlined in GEMINI.md.
        - Architect: Determines the Base XP (0-100).
        - Paladin: Modifies the Base XP by functioning as a [-50 to +50] penalty or bonus.
        - Scribe: Multiplies the resulting XP by [0.8x to 1.2x] based on clarity.
        - Streak: Multiplies the resulting XP by +10% per day continuous streak (max 2.0x).
        """
        bonuses = bonuses or {}
        penalties = penalties or {}
        
        # 1. Base XP from Architect
        base_xp = float(architect_score)
        
        # 2. Paladin Modifier: Map 0-100 score to -50 to +50 modifier
        # Score 0 = -50 penalty. Score 100 = +50 bonus. Score 50 = 0 change.
        paladin_modifier = float(paladin_score) - 50.0
        
        modified_xp = base_xp + paladin_modifier
        
        # 3. Scribe Multiplier: Map 0-100 score to 0.8x to 1.2x multiplier
        # Score 0 = 0.8x (-20%). Score 100 = 1.2x (+20%). Score 50 = 1.0x (no change).
        scribe_multiplier = 0.8 + (float(scribe_score) / 100.0) * 0.4
        
        # 4. Streak Multiplier: +10% per day, capped at 10 days (2.0x max)
        # Assuming current_streak has already been incremented if applicable
        streak_bonus = min(current_streak, 10) * 0.1
        streak_multiplier = 1.0 + streak_bonus
        
        # Combine
        current_xp = modified_xp * scribe_multiplier * streak_multiplier
        
        # Apply strict bonuses/penalties
        if bonuses.get('exceptional', False):
            current_xp += XPCalculator.BONUS_EXCEPTIONAL
        if bonuses.get('iteration', False):
            current_xp += XPCalculator.BONUS_ITERATION
        if penalties.get('critical', False):
            current_xp += XPCalculator.PENALTY_CRITICAL
            
        # Ensure it doesn't go below 0 (Paladin penalty shouldn't cause negative XP) 
        # Ensure it doesn't exceed MAX_XP
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
        
        # Use select_for_update to lock the row and prevent race conditions 
        # when a user makes multiple rapid commits.
        locked_profile = UserProfile.objects.select_for_update().get(id=user_profile.id)
        
        # Calculate streak FIRST so we can use its multiplier in calculate_total_xp
        streak = XPCalculator.update_streak(locked_profile)
        
        # Calculate XP
        xp_awarded = XPCalculator.calculate_total_xp(
            architect_score=architect_score,
            paladin_score=paladin_score,
            scribe_score=scribe_score,
            current_streak=streak,
            bonuses=bonuses,
            penalties=penalties
        )
        
        previous_level, _ = XPCalculator.calculate_level_and_xp(locked_profile.total_xp)
        
        # Update User Profile
        locked_profile.total_xp += xp_awarded
        
        new_level, xp_in_level = XPCalculator.calculate_level_and_xp(locked_profile.total_xp)
        xp_to_next = XPCalculator.calculate_xp_to_next_level(locked_profile.total_xp)
        level_up = new_level > previous_level
        
        # Adapted field name: current_level
        locked_profile.current_level = new_level
        
        locked_profile.save(update_fields=[
            'total_xp',
            'last_commit_date',
            'current_streak', # Adapted from commit_streak
            'current_level'   # Adapted
        ])
        
        # Update CommitLog
        # Adapted: commit_log.author instead of commit.user
        commit_log.author = locked_profile 
        commit_log.total_xp_awarded = xp_awarded # Adapted from xp_awarded
        commit_log.is_processed = True
        commit_log.save(update_fields=['author', 'total_xp_awarded', 'is_processed'])
        
        return {
            'xp_awarded': xp_awarded,
            'total_xp': locked_profile.total_xp,
            'level': new_level,
            'xp_in_level': xp_in_level,
            'xp_to_next_level': xp_to_next,
            'streak': streak,
            'level_up': level_up,
        }
