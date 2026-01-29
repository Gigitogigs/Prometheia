from django.urls import path
from .views import (
    github_webhook,
    RepositoryWebhookCreateView,
    LeaderboardListView,
    UserProfileDetailView,
    CommitFeedListView,
    CommitDetailView,
    JudgeEvaluationListView,
    JudgeEvaluationDetailView,
    SessionView, ConnectedReposView,
)

urlpatterns = [
    # Webhook endpoint (GitHub push events)
    path('webhooks/github/', github_webhook, name='github_webhook'),
    
    # Repository management
    path('repositories/webhook/', RepositoryWebhookCreateView.as_view(), name='create_repository_webhook'),
    
    # ========== PHASE 3: LEADERBOARD & DATA ENDPOINTS ==========
    
    # Leaderboard: Top users by XP
    # GET /api/leaderboard/?page=1&page_size=20&min_level=5
    path('leaderboard/', LeaderboardListView.as_view(), name='leaderboard'),
    
    # User Profile: Individual user stats and recent commits
    # GET /api/users/{github_username}/
    path('users/<str:github_username>/', UserProfileDetailView.as_view(), name='user_profile'),
    
    # Commit Feed: Recent commits from all users
    # GET /api/commits/?page=1&is_processed=true&username=john_doe
    path('commits/', CommitFeedListView.as_view(), name='commit_feed'),
    
    # Commit Detail: Full commit info with evaluations and raw diff
    # GET /api/commits/{commit_hash}/
    path('commits/<str:commit_hash>/', CommitDetailView.as_view(), name='commit_detail'),
    
    # Judge Evaluations: All AI evaluations
    # GET /api/evaluations/?judge=ARCHITECT&min_xp=70
    path('evaluations/', JudgeEvaluationListView.as_view(), name='evaluation_list'),
    
    # Judge Evaluation Detail: Full evaluation with Opik proof URL
    # GET /api/evaluations/{id}/
    path('evaluations/<int:pk>/', JudgeEvaluationDetailView.as_view(), name='evaluation_detail'),
    
    path("session/", SessionView.as_view(), name="api-session"),
    # get logged in user's repos
    path("user/repos/", ConnectedReposView.as_view(), name='users_repo'),
]