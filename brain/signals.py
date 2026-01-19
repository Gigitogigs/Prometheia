from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from allauth.socialaccount.signals import social_account_added

from .models import UserProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


@receiver(social_account_added)
def create_user_profile_on_social_login(request, sociallogin, **kwargs):
    """
    When a user signs up or logs in via a social account, ensure their
    associated UserProfile exists. This is idempotent and safe.
    """
    user = sociallogin.user
    github_username = sociallogin.account.extra_data.get('login')
    avatar_url = sociallogin.account.extra_data.get('avatar_url')

    # Use get_or_create to robustly handle all cases:
    # 1. New user signup.
    # 2. Existing user linking a social account for the first time.
    # 3. A user logging in whose profile was somehow deleted.
    # The `defaults` are only used if a new UserProfile is created.
    UserProfile.objects.get_or_create(
        user=user, defaults={'github_username': github_username, 'avatar_url': avatar_url}
    )