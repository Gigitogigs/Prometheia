# Phase 3 Implementation Guide

## What Was Implemented

You now have **complete Phase 3 REST API endpoints** with:

✅ **Serializers** for all models:
- `UserProfileSerializer` - with leaderboard fields (rank, xp_to_next_level)
- `CommitLogSerializer` - with evaluations nested
- `CommitLogDetailSerializer` - includes raw diff for code review
- `JudgeEvaluationSerializer` - with proof_url linking to Opik dashboard

✅ **7 New API Endpoints**:
- `GET /api/leaderboard/` - Top users by XP (paginated)
- `GET /api/users/{username}/` - User profile with recent commits
- `GET /api/commits/` - Commit feed with filtering
- `GET /api/commits/{hash}/` - Single commit with full diff
- `GET /api/evaluations/` - All AI evaluations with filtering
- `GET /api/evaluations/{id}/` - Single evaluation with proof URL
- `POST /api/repositories/webhook/` - Create webhook (auth required)

✅ **Features**:
- Pagination (20 results/page, customizable)
- Filtering (by level, username, judge type, XP range)
- Nested serializers (evaluations inside commits)
- Opik proof URLs for transparency
- Type hints and comprehensive docstrings

---

## Quick Start

### 1. Run Django Migrations (if needed)
```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. Start Development Server
```bash
python manage.py runserver
```

### 3. Test Endpoints

**Get Leaderboard:**
```bash
curl http://localhost:8000/api/leaderboard/?page=1
```

**Get User Profile:**
```bash
curl http://localhost:8000/api/users/alice_dev/
```

**Get Commit Feed:**
```bash
curl http://localhost:8000/api/commits/?is_processed=true
```

**Get Evaluations:**
```bash
curl http://localhost:8000/api/evaluations/?judge=ARCHITECT&min_xp=70
```

---

## Files Modified

| File | Changes |
|------|---------|
| `brain/serializers.py` | ✅ Added 5 new serializers with nested relationships |
| `brain/views.py` | ✅ Added 7 new APIView classes with pagination & filtering |
| `brain/urls.py` | ✅ Registered all new endpoints |
| `brain/logic/ai_council.py` | ✅ Fixed Opik initialization |
| `PHASE_3_API_EXAMPLES.md` | ✅ Created comprehensive API documentation |

---

## Integration with Frontend

The endpoints are designed for easy frontend integration. Example (React):

```javascript
// Fetch leaderboard
const response = await fetch('/api/leaderboard/?page=1&page_size=20');
const { results, count } = await response.json();

// Each user has: rank, github_username, total_xp, current_level, avatar_url, title
results.forEach(user => {
  console.log(`#${user.rank}: ${user.github_username} - Lvl ${user.current_level}`);
});
```

```javascript
// Fetch commit with evaluations
const response = await fetch('/api/commits/a1b2c3d4/');
const commit = await response.json();

// Each evaluation has proof_url to Opik dashboard
commit.evaluations.forEach(eval => {
  console.log(`${eval.judge_display}: ${eval.xp_awarded} XP`);
  console.log(`Proof: ${eval.proof_url}`); // Links to AI reasoning
});
```

---

## Next Steps (Phase 4 & Beyond)

### Phase 4: Testing & Observability
- [ ] Add unit tests for serializers
- [ ] Add integration tests for endpoints
- [ ] Verify Opik traces are captured (visit dashboard)
- [ ] Add test data fixtures

### Phase 5: Frontend Prep
- [ ] Update CORS settings for frontend domain
- [ ] Add API documentation (Swagger/OpenAPI via `drf-spectacular`)
- [ ] Build Next.js leaderboard UI
- [ ] Build user profile page
- [ ] Build commit detail page with proof links

### Phase 6: Production Hardening
- [ ] Add rate limiting to endpoints
- [ ] Cache leaderboard (5-min TTL)
- [ ] Add database indexes on query fields
- [ ] Implement request throttling
- [ ] Add monitoring/alerting for API errors

---

## Useful Django Admin Additions

Add this to `brain/admin.py` for better admin interface:

```python
from django.contrib import admin
from django.utils.html import format_html
from .models import JudgeEvaluation

@admin.register(JudgeEvaluation)
class JudgeEvaluationAdmin(admin.ModelAdmin):
    list_display = ('judge_type', 'xp_awarded', 'commit', 'proof_link')
    list_filter = ('judge_type', 'xp_awarded', 'created_at')
    search_fields = ('commit__commit_hash', 'opik_trace_id')
    readonly_fields = ('opik_trace_id', 'reasoning', 'created_at')
    
    def proof_link(self, obj):
        if obj.opik_trace_id:
            url = f"https://www.comet.com/opik/traces/{obj.opik_trace_id}"
            return format_html('<a href="{}" target="_blank">View Opik Trace</a>', url)
        return "No trace"
    proof_link.short_description = "Opik Dashboard"
```

---

## Testing Tips

### 1. Create Test Data
```python
from brain.models import UserProfile, Repository, CommitLog, JudgeEvaluation

# Create user
user_profile = UserProfile.objects.create(
    github_username='test_user',
    total_xp=500,
    current_level=2,
    current_streak=3
)

# Create repo
repo = Repository.objects.create(
    owner=user_profile,
    name='test-repo',
    full_name='test_user/test-repo',
    webhook_secret='secret123'
)

# Create commit
commit = CommitLog.objects.create(
    repository=repo,
    author=user_profile,
    commit_hash='abc123def456',
    message='Test commit',
    timestamp=timezone.now(),
    url='https://github.com/test_user/test-repo/commit/abc123'
)

# Create evaluation
eval = JudgeEvaluation.objects.create(
    commit=commit,
    judge_type='ARCHITECT',
    xp_awarded=85,
    reasoning='Great architecture!',
    opik_trace_id='trace_12345'
)
```

### 2. Test API Endpoints
```bash
# List leaderboard
curl -s http://localhost:8000/api/leaderboard/ | python -m json.tool

# Get user
curl -s http://localhost:8000/api/users/test_user/ | python -m json.tool

# Get commit with evaluations
curl -s http://localhost:8000/api/commits/abc123def456/ | python -m json.tool

# Get evaluation with proof URL
curl -s http://localhost:8000/api/evaluations/1/ | python -m json.tool
```

### 3. Verify Opik Integration
1. Visit `https://www.comet.com/opik` and log in
2. Check if traces appear in "Default Project"
3. Click on a trace to see full Gemini API call details
4. Copy a `trace_id` and verify it appears in JudgeEvaluation
5. Test the `proof_url` - it should open Opik dashboard to that trace

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| 404 on leaderboard endpoint | Verify URLs are registered in `brain/urls.py` |
| Empty evaluations list | Create test data using Django shell |
| No opik_trace_id | Ensure Opik is configured and `@opik.track` decorators work |
| CORS errors on frontend | Update `CORS_ALLOWED_ORIGINS` in settings |
| Slow leaderboard query | Add index on UserProfile.total_xp |
| Too many results | Check pagination - default is 20/page |

---

## API Documentation Location

Full API examples and query parameters: [PHASE_3_API_EXAMPLES.md](PHASE_3_API_EXAMPLES.md)

---

## Notes

- All endpoints return **JSON**
- Timestamps are in **ISO 8601** format (UTC)
- Pagination uses **page-based** numbering (page 1, 2, 3...)
- Proof URLs are **valid for 30 days** (Opik retention policy)
- Public endpoints have **no authentication** (good for frontend)
- Webhook creation **requires** GitHub OAuth token

---

✨ **Phase 3 is complete! You now have a fully functional REST API for your gamified GitHub tracker.** ✨

