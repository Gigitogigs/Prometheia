from rest_framework import serializers


class RepositoryCreateSerializer(serializers.Serializer):
    """
    Serializer for validating the input for creating a repository webhook.
    """
    repo_name = serializers.CharField(
        max_length=100,  # GitHub repo names are max 100 chars
        help_text="The name of the GitHub repository (e.g., 'my-awesome-project')."
    )