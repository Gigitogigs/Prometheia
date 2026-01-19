from django.contrib import admin
from .models import UserProfile, Repository, CommitLog, JudgeEvaluation

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('github_username', 'current_level', 'total_xp', 'current_streak')

@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'owner', 'is_active')

class JudgeInline(admin.TabularInline):
    model = JudgeEvaluation
    extra = 0
    readonly_fields = ('proof_url',)

@admin.register(CommitLog)
class CommitLogAdmin(admin.ModelAdmin):
    list_display = ('commit_hash', 'repository', 'total_xp_awarded', 'is_processed', 'timestamp')
    list_filter = ('is_processed', 'repository')
    inlines = [JudgeInline] # Shows the AI scores directly inside the Commit view

@admin.register(JudgeEvaluation)
class JudgeEvaluationAdmin(admin.ModelAdmin):
    list_display = ('judge_type', 'xp_awarded', 'commit', 'proof_url')
    list_filter = ('judge_type',)
