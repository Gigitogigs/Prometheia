from django.urls import path
from .views import github_webhook, RepositoryWebhookCreateView

urlpatterns = [
    # Endpoint to RECEIVE webhook events from GitHub
    path('webhooks/github/', github_webhook, name='github_webhook'),
    # Endpoint to CREATE a webhook for a repository
    path('repositories/webhook/', RepositoryWebhookCreateView.as_view(), name='create_repository_webhook'),
]