# Contributing to Prometheia

Thank you for your interest in contributing to Prometheia! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Welcome newcomers and help them get started
- Focus on what's best for the community

## Getting Started

### 1. Set Up Development Environment

```bash
# Clone the repository
git clone git@github.com:Gigitogigs/Prometheia.git
cd Prometheia

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# or: source venv/bin/activate  # Unix

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### 2. Understand the Project Structure

- **Phase 1-2**: Webhook handling, AI evaluation, task queue ✅
- **Phase 3**: REST API endpoints & serializers ✅
- **Phase 4**: Testing & observability (in progress)
- **Phase 5**: Next.js frontend (pending)
- **Phase 6**: Production hardening (pending)

See [PHASE_3_INDEX.md](PHASE_3_INDEX.md) for detailed documentation.

## How to Contribute

### Bug Reports

1. **Check existing issues** - Avoid duplicates
2. **Use the bug template** - Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Python version, OS, and relevant dependencies
   - Error messages and traceback

### Feature Requests

1. **Discuss first** - Open an issue to discuss
2. **Describe the feature**:
   - What problem does it solve?
   - How should it work?
   - Any design considerations?

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone git@github.com:your-username/Prometheia.git
   cd Prometheia
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
   Branch naming conventions:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation updates
   - `test/` - Test additions
   - `perf/` - Performance improvements

3. **Make your changes**
   ```bash
   # Make changes to files
   git add .
   git commit -m "Descriptive commit message"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Reference any related issues: `Fixes #123`
   - Provide clear description of changes
   - Link to relevant documentation

## Code Standards

### Python Code Style

- **Follow PEP 8** - Use Black for formatting:
  ```bash
  black brain/
  ```

- **Use type hints**:
  ```python
  # ✅ Good
  def evaluate_commit(commit_id: int) -> bool:
      """Evaluate a commit and return success status."""
      pass
  
  # ❌ Bad
  def evaluate_commit(commit_id):
      pass
  ```

- **Write docstrings** (Google style):
  ```python
  def fetch_github_diff(owner: str, repo: str, commit: str) -> str:
      """Fetch raw diff from GitHub API.
      
      Args:
          owner: Repository owner username
          repo: Repository name
          commit: Commit hash
      
      Returns:
          Raw diff text or empty string if not found
      
      Raises:
          GitHubAPIError: If API call fails
      """
      pass
  ```

- **No hardcoded values**:
  ```python
  # ✅ Good
  TIMEOUT_SECONDS = 30
  response = client.get(url, timeout=TIMEOUT_SECONDS)
  
  # ❌ Bad
  response = client.get(url, timeout=30)
  ```

### Django Best Practices

- Use **select_related()** and **prefetch_related()** to avoid N+1 queries
- Use **@transaction.atomic** for critical updates
- Validate input in serializers
- Use class-based views for consistency
- Add indexes on frequently queried fields

### Testing

- Write tests for new features:
  ```python
  import pytest
  from brain.models import UserProfile
  
  @pytest.mark.django_db
  def test_user_profile_creation():
      user = UserProfile.objects.create(
          github_username='test_user',
          total_xp=100
      )
      assert user.current_level == 1
      assert user.current_streak == 0
  ```

- Run tests before submitting PR:
  ```bash
  pytest brain/tests/ -v --cov=brain
  ```

## Commit Messages

Use clear, descriptive commit messages:

```
# Format: Type: Brief description

# Types: feat, fix, docs, style, refactor, perf, test, chore

# Examples:
feat: Add leaderboard pagination
fix: Resolve N+1 query in commit feed
docs: Update API documentation
test: Add tests for XP calculator
perf: Optimize leaderboard query
```

## Documentation

### When to Update Docs

- Adding new endpoints → Update API examples
- Changing configuration → Update .env.example
- Adding dependencies → Update requirements.txt
- Major feature → Update PHASE_X.md

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project overview |
| `.env.example` | Environment configuration template |
| `PHASE_3_INDEX.md` | Master documentation index |
| `PHASE_3_API_EXAMPLES.md` | API endpoint examples |
| `PHASE_3_TECHNICAL.md` | Technical implementation details |
| `GEMINI.md` | Project specification |

## Review Process

### Before Submitting PR

- [ ] Code follows PEP 8 / Black formatting
- [ ] All type hints included
- [ ] Docstrings added to new functions
- [ ] Tests written and passing
- [ ] No hardcoded secrets
- [ ] No breaking changes without discussion
- [ ] Documentation updated if needed
- [ ] Commit messages are clear

### During Code Review

- Be open to feedback
- Respond to comments promptly
- Make requested changes
- Request re-review after changes

### Approval

- At least 1 approval required
- All GitHub checks passing
- No conflicting files

## Common Tasks

### Add a New API Endpoint

1. **Create serializer** in `brain/serializers.py`
   ```python
   class MySerializer(serializers.ModelSerializer):
       class Meta:
           model = MyModel
           fields = ['field1', 'field2']
   ```

2. **Create view** in `brain/views.py`
   ```python
   class MyListView(ListAPIView):
       queryset = MyModel.objects.all()
       serializer_class = MySerializer
   ```

3. **Add URL** in `brain/urls.py`
   ```python
   path('my-endpoint/', MyListView.as_view(), name='my_endpoint')
   ```

4. **Add tests** in `brain/tests.py`
   ```python
   def test_my_endpoint(self):
       response = self.client.get('/api/my-endpoint/')
       assert response.status_code == 200
   ```

5. **Update documentation** in `PHASE_3_API_EXAMPLES.md`

### Fix a Bug

1. Create a failing test first
2. Fix the bug
3. Verify test passes
4. Submit PR with test included

### Optimize Query Performance

1. Use `select_related()` for FK relationships
2. Use `prefetch_related()` for reverse FK / many-to-many
3. Add database indexes if needed
4. Benchmark before/after with `django-silk` or similar
5. Document the optimization in commit message

## Questions?

- **Documentation**: See [README.md](README.md) and [PHASE_3_INDEX.md](PHASE_3_INDEX.md)
- **Issues**: Open a GitHub issue or discussion
- **Email**: Contact team leads

---

## Review Checklist for Maintainers

- [ ] PR description is clear
- [ ] Code follows style guide
- [ ] Tests are included and passing
- [ ] No security issues
- [ ] No performance regressions
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No merge conflicts

## Helpful Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django Rest Framework](https://www.django-rest-framework.org/)
- [PEP 8 Style Guide](https://pep8.org/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
- [Opik Documentation](https://www.comet.com/docs/opik/)
- [Gemini API Docs](https://ai.google.dev/docs)

---

Thank you for contributing to Prometheia! 🚀
