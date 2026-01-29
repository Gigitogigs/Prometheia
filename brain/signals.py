from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from allauth.account.signals import user_signed_up, user_logged_in
from allauth.socialaccount.signals import social_account_added, social_account_updated
from allauth.socialaccount.models import SocialToken

from .models import UserProfile


# Keep this — auto-create DRF token for new local users
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


# 1. New social signup (most common initial case)
@receiver(user_signed_up)
def create_profile_on_signup(request, user, **kwargs):
    """
    Fires when a brand new user is created via social login (or regular signup).
    """
    if not UserProfile.objects.filter(user=user).exists():
        # For social signups, sociallogin is not directly passed here,
        # but we can safely pull from the user's socialaccount (it exists at this point)
        try:
            social_account = user.socialaccount_set.first()  # usually only one at signup
            if social_account and social_account.provider == 'github':
                github_username = social_account.extra_data.get('login')
                avatar_url = social_account.extra_data.get('avatar_url')
            else:
                github_username = None
                avatar_url = None
        except:
            github_username = None
            avatar_url = None

        UserProfile.objects.create(
            user=user,
            github_username=github_username,
            avatar_url=avatar_url
        )


# 2. When user connects additional social account later (your original case)
@receiver(social_account_added)
def create_profile_on_connect(request, sociallogin, **kwargs):
    user = sociallogin.user
    if sociallogin.account.provider == 'github':
        github_username = sociallogin.account.extra_data.get('login')
        avatar_url = sociallogin.account.extra_data.get('avatar_url')
        UserProfile.objects.get_or_create(
            user=user,
            defaults={'github_username': github_username, 'avatar_url': avatar_url}
        )


# 3. Optional — refresh profile data on every login (useful if avatar/login changes)
@receiver(user_logged_in)
def refresh_profile_on_login(request, user, **kwargs):
    """
    Optional safety net: update avatar/username if changed.
    Cheap & idempotent.
    """
    profile, __ = UserProfile.objects.get_or_create(user=user)
    try:
        social_account = user.socialaccount_set.filter(provider='github').first()
        if social_account:
            new_username = social_account.extra_data.get('login')
            new_avatar = social_account.extra_data.get('avatar_url')
            updated = False
            if new_username and new_username != profile.github_username:
                profile.github_username = new_username
                updated = True
            if new_avatar and new_avatar != profile.avatar_url:
                profile.avatar_url = new_avatar
                updated = True
            if updated:
                profile.save()
    except:
        pass  # silent fail — no github account yet


# Keep this one — it only runs on explicit connect, but good to have
@receiver(social_account_added)
def save_github_token_on_connect(request, sociallogin, **kwargs):
    if sociallogin.account.provider == 'github':
        token = sociallogin.token
        if token:
            SocialToken.objects.update_or_create(
                account=sociallogin.account,
                defaults={
                    'token': token.token,
                    'token_secret': token.token_secret or '',
                    'expires_at': token.expires_at,
                }
            )
