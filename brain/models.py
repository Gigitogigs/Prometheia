from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    """
    Extends the default Django User to hold game stats.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    github_username = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Game Stats
    total_xp = models.IntegerField(default=0)
    current_level = models.IntegerField(default=1)
    
    # Streak Logic
    current_streak = models.IntegerField(default=0)
    last_commit_date = models.DateTimeField(null=True, blank=True)
    
    # Vanity (Displayed on Frontend)
    avatar_url = models.URLField(blank=True, null=True)
    title = models.CharField(max_length=50, default="Novice Coder")

    def __str__(self):
        return f"@{self.github_username} (Lvl {self.current_level})"


class Repository(models.Model):
    """
    Tracks which GitHub repos we are listening to.
    """
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='repositories')
    
    name = models.CharField(max_length=255) 
    full_name = models.CharField(max_length=255, unique=True)
    
    # Security
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class CommitLog(models.Model):
    """
    Stores the raw event data. 
    Critically, it saves the 'raw_diff' so you can re-run AI judging if the demo crashes.
    """
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='commits')
    author = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='commits')
    
    # GitHub Data
    commit_hash = models.CharField(max_length=40, unique=True, db_index=True)
    message = models.TextField()
    timestamp = models.DateTimeField() # When it happened on GitHub
    url = models.URLField()
    
    # The Raw Code (The "Evidence")
    # To store this to pass to Gemini/Opik
    raw_diff = models.TextField(blank=True, null=True)
    
    # Processing Status
    is_processed = models.BooleanField(default=False)
    total_xp_awarded = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp'] # Newest commits first

    def __str__(self):
        return f"[{self.repository.name}] {self.commit_hash[:7]}: {self.message[:30]}..."


class JudgeEvaluation(models.Model):
    """
    The 'Council of Wizards'. 
    Each row is ONE AI agent's opinion on ONE commit.
    """
    JUDGE_CHOICES = [
        ('ARCHITECT', 'The Architect (Complexity)'), # High XP, rare
        ('PALADIN', 'The Paladin (Security)'),       # Bonus/Penalty
        ('SCRIBE', 'The Scribe (Syntax/Style)'),     # Low XP, frequent
    ]

    commit = models.ForeignKey(CommitLog, on_delete=models.CASCADE, related_name='evaluations')
    
    judge_type = models.CharField(max_length=20, choices=JUDGE_CHOICES)
    xp_awarded = models.IntegerField()
    reasoning = models.TextField() # The "Why" from Gemini
    
    # OPIK INTEGRATION
    opik_trace_id = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def proof_url(self):
        """
        Direct link to the Opik Dashboard for transparency.
        """
        if not self.opik_trace_id:
            return None
        return f"https://www.comet.com/opik/dashboard/traces/{self.opik_trace_id}"

    def __str__(self):
        return f"{self.get_judge_type_display()} -> {self.xp_awarded} XP"