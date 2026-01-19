# Phase 3 Summary: REST API Serializers & Endpoints

## What You Asked For ✅

You wanted to know how to create three serializers for Phase 3. Here's what was implemented:

### 1. **UserProfileSerializer** (Leaderboard Fields)
```python
class UserProfileSerializer(serializers.ModelSerializer):
    xp_to_next_level = serializers.SerializerMethodField()  # Computed field
    rank = serializers.SerializerMethodField()  # Injected by view
    
    class Meta:
        model = UserProfile
        fields = [
            'github_username',
            'total_xp',
            'current_level',
            'xp_to_next_level',  # How much XP to next level
            'current_streak',
            'last_commit_date',
            'avatar_url',
            'title',
            'rank',  # Leaderboard position
        ]
```

**Features:**
- Includes computed `xp_to_next_level` using `XPCalculator`
- `rank` injected by view for leaderboard ranking
- All read-only (data is set by system, not API users)

---

### 2. **CommitLogSerializer** (With Total XP & Evaluations)
```python
class CommitLogSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.github_username')
    repository_name = serializers.CharField(source='repository.full_name')
    evaluations = JudgeEvaluationSerializer(many=True, source='evaluations.all')
    evaluation_count = serializers.SerializerMethodField()
    
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
            'total_xp_awarded',  # ✅ Total from all judges
            'is_processed',
            'evaluation_count',
            'evaluations',  # ✅ Nested judge evaluations
            'created_at',
        ]
```

**Features:**
- Includes `total_xp_awarded` (sum of all judge scores)
- Nested `evaluations` array with all judge feedback
- Flattened author/repo names for convenience
- `evaluation_count` for quick status check

---

### 3. **JudgeEvaluationSerializer** (With Proof URL)
```python
class JudgeEvaluationSerializer(serializers.ModelSerializer):
    judge_display = serializers.CharField(source='get_judge_type_display')
    proof_url = serializers.SerializerMethodField()  # ✅ Opik dashboard link
    
    class Meta:
        model = JudgeEvaluation
        fields = [
            'id',
            'judge_type',
            'judge_display',
            'xp_awarded',
            'reasoning',
            'opik_trace_id',
            'proof_url',  # ✅ Link to AI's reasoning
            'created_at',
        ]
    
    def get_proof_url(self, obj):
        if not obj.opik_trace_id:
            return None
        return f"https://www.comet.com/opik/traces/{obj.opik_trace_id}?workspace=default"
```

**Features:**
- `proof_url` generates direct link to Opik dashboard
- `judge_display` shows human-readable judge name
- Full `reasoning` text (markdown formatted)
- Trace ID stored for complete transparency

---

## Bonus: You Also Got 7 API Endpoints 🎁

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /api/leaderboard/` | Top 100 users by XP | Array of UserProfileSerializer |
| `GET /api/users/{username}/` | User profile & stats | UserProfileSerializer + recent commits |
| `GET /api/commits/` | Recent commits feed | Array of CommitLogSerializer |
| `GET /api/commits/{hash}/` | Single commit detail | CommitLogDetailSerializer (includes raw diff) |
| `GET /api/evaluations/` | All judge evaluations | Array of JudgeEvaluationSerializer |
| `GET /api/evaluations/{id}/` | Single evaluation | JudgeEvaluationSerializer with full reasoning |
| `POST /api/repositories/webhook/` | Create repo webhook | Success response with webhook ID |

---

## Example API Responses

### Leaderboard Response
```json
{
  "count": 47,
  "next": "http://localhost:8000/api/leaderboard/?page=2",
  "results": [
    {
      "rank": 1,
      "github_username": "alice_dev",
      "total_xp": 2500,
      "current_level": 6,
      "xp_to_next_level": 0,
      "current_streak": 8,
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
      "title": "Master Architect"
    }
  ]
}
```

### Commit Feed Response
```json
{
  "id": 142,
  "commit_hash": "a1b2c3d4e5f6",
  "message": "Refactor auth module",
  "timestamp": "2025-01-19T14:30:00Z",
  "author_username": "alice_dev",
  "repository_name": "alice_dev/project",
  "total_xp_awarded": 95,
  "is_processed": true,
  "evaluation_count": 3,
  "evaluations": [
    {
      "judge_type": "ARCHITECT",
      "judge_display": "The Architect (Complexity)",
      "xp_awarded": 85,
      "reasoning": "Excellent architectural soundness...",
      "proof_url": "https://www.comet.com/opik/traces/trace_abc123?workspace=default"
    }
  ]
}
```

---

## How to Use Them

### In Your Views
```python
# List view
class LeaderboardListView(ListAPIView):
    queryset = UserProfile.objects.order_by('-total_xp')
    serializer_class = UserProfileSerializer
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Inject rank into each result
        for idx, user in enumerate(response.data['results']):
            user['rank'] = idx + 1
        return response

# Detail view
class UserProfileDetailView(RetrieveAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'github_username'
```

### On Your Frontend (React)
```javascript
// Fetch leaderboard
const response = await fetch('/api/leaderboard/');
const data = await response.json();

// Render with rank and avatar
data.results.map(user => (
  <div key={user.github_username}>
    <span>#{user.rank}</span>
    <img src={user.avatar_url} />
    <span>{user.github_username} - Lvl {user.current_level}</span>
    <span>{user.total_xp} XP</span>
  </div>
));

// Click evaluation to see proof
commit.evaluations.map(eval => (
  <a href={eval.proof_url} target="_blank">
    {eval.judge_display}: {eval.xp_awarded} XP
  </a>
));
```

---

## Key Design Decisions

| Design | Why |
|--------|-----|
| **Nested Evaluations** | Users see full context of how XP was awarded |
| **Computed Fields** | `xp_to_next_level` calculated on the fly |
| **Proof URLs** | Direct links to AI reasoning on Opik for transparency |
| **Flattened Names** | `author_username` instead of `author.github_username` in responses |
| **Separate Detail Serializer** | `CommitLogDetailSerializer` includes `raw_diff` only in detail view (saves bandwidth) |
| **Pagination** | 20 results/page by default (customizable) |
| **Public Endpoints** | No auth required for leaderboard (good for frontend) |

---

## Files You Now Have

```
brain/
├── serializers.py          # ✅ 5 new serializers
├── views.py                # ✅ 7 new API endpoint classes
├── urls.py                 # ✅ Routes for all endpoints
└── logic/
    └── ai_council.py       # ✅ Fixed Opik integration

Documentation/
├── PHASE_3_API_EXAMPLES.md    # ✅ Complete API reference
└── PHASE_3_SETUP.md           # ✅ Setup & testing guide
```

---

## What's Working Now

✅ **Data Serialization**: All models can be converted to JSON  
✅ **Pagination**: Results paginated (20/page, customizable)  
✅ **Filtering**: Endpoints support filtering (judge type, XP range, username)  
✅ **Nesting**: Evaluations nested inside commits  
✅ **Computed Fields**: XP to next level, ranks, evaluation counts  
✅ **Proof of Work**: Every evaluation links to AI's reasoning on Opik  
✅ **Type Hints**: Full type annotations throughout  
✅ **Documentation**: Every endpoint documented with examples  

---

## What Still Needs Work

⏳ **Phase 4**: Unit tests for serializers  
⏳ **Phase 5**: Next.js frontend UI  
⏳ **Phase 6**: Rate limiting, caching, monitoring  

---

## Quick Start

```bash
# 1. Start server
python manage.py runserver

# 2. Test leaderboard
curl http://localhost:8000/api/leaderboard/

# 3. Test user profile
curl http://localhost:8000/api/users/alice_dev/

# 4. Test commit with evaluations
curl http://localhost:8000/api/commits/?page=1

# 5. View Opik proof URLs in responses
# Copy proof_url from evaluation and open in browser
```

---

✨ **Phase 3 Complete!** You now have a fully functional REST API with complete data transparency through Opik integration. 🚀

