from rest_framework import serializers
from brain.models import UserProfile, Repository, CommitLog, JudgeEvaluation
from brain.services.xp_calculator import XPCalculator


class RepositoryCreateSerializer(serializers.Serializer):
    """
    Serializer for validating the input for creating a repository webhook.
    """
    repo_name = serializers.CharField(
        max_length=100,
        help_text="The name of the GitHub repository (e.g., 'my-awesome-project')."
    )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile with leaderboard ranking fields.
    
    Includes:
    - Core stats (XP, level, streak)
    - Leaderboard position (calculated in view)
    - Computed fields (XP to next level, streak status)
    - Avatar for UI display
    """
    xp_to_next_level = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()  # Will be set by view's context
    
    class Meta:
        model = UserProfile
        fields = [
            'github_username',
            'total_xp',
            'current_level',
            'xp_to_next_level',
            'current_streak',
            'last_commit_date',
            'avatar_url',
            'title',
            'rank',
        ]
        read_only_fields = [
            'github_username',
            'total_xp',
            'current_level',
            'xp_to_next_level',
            'current_streak',
            'last_commit_date',
            'avatar_url',
            'title',
        ]
    
    def get_xp_to_next_level(self, obj) -> int:
        """Calculate XP remaining to reach next level."""
        return XPCalculator.calculate_xp_to_next_level(obj.total_xp)
    
    def get_rank(self, obj) -> int:
        """
        Get the user's rank in the leaderboard.
        Will be overridden by view if context contains rank data.
        """
        return self.context.get('rank', None)


class JudgeEvaluationSerializer(serializers.ModelSerializer):
    """
    Serializer for JudgeEvaluation with proof_url link to Opik dashboard.
    
    Includes:
    - Judge type and XP awarded
    - Detailed reasoning (markdown)
    - Proof URL (direct link to Opik trace for transparency)
    - Timestamps
    """
    judge_display = serializers.CharField(
        source='get_judge_type_display',
        read_only=True,
        help_text="Human-readable judge name"
    )
    proof_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JudgeEvaluation
        fields = [
            'id',
            'judge_type',
            'judge_display',
            'xp_awarded',
            'reasoning',
            'opik_trace_id',
            'proof_url',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'judge_type',
            'xp_awarded',
            'reasoning',
            'opik_trace_id',
            'created_at',
        ]
    
    def get_proof_url(self, obj) -> str:
        """
        Generate the Opik dashboard URL for this evaluation's trace.
        
        Returns None if no trace ID (e.g., evaluation failed or Opik disabled).
        URL format: https://www.comet.com/opik/traces/{trace_id}
        """
        if not obj.opik_trace_id:
            return None
        # You can configure workspace via settings if needed
        workspace = "default"
        return f"https://www.comet.com/opik/traces/{obj.opik_trace_id}?workspace={workspace}"


class CommitLogSerializer(serializers.ModelSerializer):
    """
    Serializer for CommitLog with evaluations and computed XP totals.
    
    Nested structure includes:
    - Commit metadata (hash, message, timestamp)
    - Repository and author info
    - All AI judge evaluations (nested)
    - Processing status and total XP awarded
    """
    author_username = serializers.CharField(
        source='author.github_username',
        read_only=True,
        help_text="GitHub username of commit author"
    )
    repository_name = serializers.CharField(
        source='repository.full_name',
        read_only=True,
        help_text="Full repository name (owner/repo)"
    )
    evaluations = JudgeEvaluationSerializer(
        many=True,
        read_only=True,
        source='evaluations.all',
        help_text="All AI judge evaluations for this commit"
    )
    evaluation_count = serializers.SerializerMethodField()
    total_xp_awarded = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CommitLog
        fields = [
            'id',
            'commit_hash',
            'message',
            'timestamp',
            'url',
            'author_username',
            'repository_name',
            'total_xp_awarded',
            'is_processed',
            'evaluation_count',
            'evaluations',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'commit_hash',
            'message',
            'timestamp',
            'url',
            'author_username',
            'repository_name',
            'total_xp_awarded',
            'is_processed',
            'created_at',
        ]
    
    def get_evaluation_count(self, obj) -> int:
        """Return count of evaluations (for quick status check)."""
        return obj.evaluations.count()


class CommitLogDetailSerializer(serializers.ModelSerializer):
    """
    Extended version of CommitLogSerializer with raw_diff for detailed view.
    
    Use this for detailed commit view endpoints; use CommitLogSerializer for lists.
    """
    author_username = serializers.CharField(
        source='author.github_username',
        read_only=True
    )
    repository_name = serializers.CharField(
        source='repository.full_name',
        read_only=True
    )
    evaluations = JudgeEvaluationSerializer(
        many=True,
        read_only=True,
        source='evaluations.all'
    )
    
    class Meta:
        model = CommitLog
        fields = [
            'id',
            'commit_hash',
            'message',
            'timestamp',
            'url',
            'author_username',
            'repository_name',
            'total_xp_awarded',
            'is_processed',
            'raw_diff',  # ✅ Only in detail view
            'evaluations',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'commit_hash',
            'message',
            'timestamp',
            'url',
            'author_username',
            'repository_name',
            'total_xp_awarded',
            'is_processed',
            'raw_diff',
            'created_at',
        ]