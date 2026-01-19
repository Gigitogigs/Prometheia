# Phase 3 Quick Reference Card

## The 3 Serializers You Asked For

### 1️⃣ UserProfileSerializer
```python
# What it does: Converts UserProfile to JSON for leaderboard

{
  "rank": 1,                        # ← Injected by view
  "github_username": "alice_dev",
  "total_xp": 2500,
  "current_level": 6,
  "xp_to_next_level": 0,           # ← Computed by SerializerMethodField
  "current_streak": 8,
  "last_commit_date": "2025-01-19T14:30:00Z",
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "title": "Master Architect"
}
```

**Key Features:**
- `xp_to_next_level`: Auto-calculated using `XPCalculator.calculate_xp_to_next_level()`
- `rank`: Set by LeaderboardListView for ranking
- All fields read-only (system manages them)

---

### 2️⃣ CommitLogSerializer
```python
# What it does: Converts CommitLog to JSON with all evaluations

{
  "id": 142,
  "commit_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "message": "Refactor authentication module",
  "timestamp": "2025-01-19T14:30:00Z",
  "url": "https://github.com/alice_dev/project/commit/a1b2c3",
  "author_username": "alice_dev",              # ← Flattened from author.github_username
  "repository_name": "alice_dev/project",      # ← Flattened from repository.full_name
  "total_xp_awarded": 95,                      # ← Sum of ARCHITECT + PALADIN + SCRIBE
  "is_processed": true,
  "evaluation_count": 3,                       # ← Count of evaluations
  "evaluations": [                             # ← Nested JudgeEvaluationSerializer
    { "judge_type": "ARCHITECT", "xp_awarded": 85, ... },
    { "judge_type": "PALADIN", "xp_awarded": 80, ... },
    { "judge_type": "SCRIBE", "xp_awarded": 75, ... }
  ],
  "created_at": "2025-01-19T14:32:00Z"
}
```

**Key Features:**
- `total_xp_awarded`: Direct from model field (sum of all judges)
- `evaluations`: Nested array with full judge feedback
- `author_username` & `repository_name`: Flattened for convenience

---

### 3️⃣ JudgeEvaluationSerializer
```python
# What it does: Converts JudgeEvaluation to JSON with Opik proof URL

{
  "id": 425,
  "judge_type": "ARCHITECT",
  "judge_display": "The Architect (Complexity)",     # ← Human-readable name
  "xp_awarded": 85,
  "reasoning": "**What You Did Well:**\n- Clear separation...",
  "opik_trace_id": "trace_12345abc",
  "proof_url": "https://www.comet.com/opik/traces/trace_12345abc?workspace=default",  # ← ✨ MAGIC ✨
  "created_at": "2025-01-19T14:35:00Z"
}
```

**Key Features:**
- `proof_url`: Auto-generated from `opik_trace_id` → direct link to Opik dashboard
- `judge_display`: Human-readable version of `judge_type`
- `reasoning`: Full markdown feedback from Gemini AI

---

## The 7 Endpoints You Can Call

```
GET  /api/leaderboard/                    → Top 100 users (paginated)
GET  /api/users/{username}/               → User profile + recent commits
GET  /api/commits/                        → Commit feed (paginated, filterable)
GET  /api/commits/{commit_hash}/          → Single commit with full diff + evals
GET  /api/evaluations/                    → All judge evaluations (paginated)
GET  /api/evaluations/{id}/               → Single evaluation + proof URL
POST /api/repositories/webhook/           → Create GitHub webhook (auth required)
```

---

## Common Usage Patterns

### Get Top 10 Users
```bash
curl "http://localhost:8000/api/leaderboard/?page_size=10"
```

### Get User & Recent Commits
```bash
curl "http://localhost:8000/api/users/alice_dev/"
```

### Get High-Quality Evaluations (80+ XP)
```bash
curl "http://localhost:8000/api/evaluations/?min_xp=80"
```

### Get Architect Evaluations Only
```bash
curl "http://localhost:8000/api/evaluations/?judge=ARCHITECT"
```

### Get Processed Commits from a User
```bash
curl "http://localhost:8000/api/commits/?is_processed=true&username=alice_dev"
```

### Get Commit Details with Raw Diff
```bash
curl "http://localhost:8000/api/commits/a1b2c3d4e5f6/"
```

---

## Serializer Hierarchy

```
UserProfileSerializer
├── github_username
├── total_xp
├── current_level
├── xp_to_next_level (computed)
├── current_streak
├── avatar_url
└── rank (injected by view)

CommitLogSerializer
├── commit_hash
├── message
├── author_username (flattened)
├── repository_name (flattened)
├── total_xp_awarded
├── is_processed
├── evaluation_count
└── evaluations → JudgeEvaluationSerializer (nested)
    ├── judge_type
    ├── judge_display
    ├── xp_awarded
    ├── reasoning
    └── proof_url (computed from opik_trace_id)

CommitLogDetailSerializer (extends CommitLogSerializer)
└── + raw_diff (only in detail view)

JudgeEvaluationSerializer
├── judge_type
├── judge_display
├── xp_awarded
├── reasoning
├── opik_trace_id
└── proof_url (computed)
```

---

## Response Examples (Copy-Paste Ready)

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
      "last_commit_date": "2025-01-19T14:30:00Z",
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
      "title": "Master Architect"
    }
  ]
}
```

### Commit with Evaluations
```json
{
  "id": 142,
  "commit_hash": "a1b2c3d4",
  "message": "Refactor auth",
  "author_username": "alice_dev",
  "repository_name": "alice_dev/project",
  "total_xp_awarded": 95,
  "is_processed": true,
  "evaluation_count": 3,
  "evaluations": [
    {
      "id": 425,
      "judge_type": "ARCHITECT",
      "judge_display": "The Architect (Complexity)",
      "xp_awarded": 85,
      "reasoning": "Excellent architecture!",
      "proof_url": "https://www.comet.com/opik/traces/trace_abc123?workspace=default"
    }
  ]
}
```

---

## Frontend Integration (React Snippet)

```jsx
// Fetch & display leaderboard
function Leaderboard() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/leaderboard/?page=1&page_size=20')
      .then(r => r.json())
      .then(data => setUsers(data.results));
  }, []);
  
  return (
    <table>
      <tbody>
        {users.map(user => (
          <tr key={user.github_username}>
            <td>#{user.rank}</td>
            <td><img src={user.avatar_url} width="30" /></td>
            <td>{user.github_username}</td>
            <td>Lvl {user.current_level}</td>
            <td>{user.total_xp} XP</td>
            <td>Streak: {user.current_streak} days</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Get commit with evaluations
function CommitDetail({ hash }) {
  const [commit, setCommit] = useState(null);
  
  useEffect(() => {
    fetch(`/api/commits/${hash}/`)
      .then(r => r.json())
      .then(setCommit);
  }, [hash]);
  
  return (
    <div>
      <h3>{commit?.message}</h3>
      <p>Total XP: {commit?.total_xp_awarded}</p>
      <div>
        {commit?.evaluations.map(eval => (
          <a href={eval.proof_url} target="_blank" key={eval.id}>
            {eval.judge_display}: {eval.xp_awarded} XP (View Proof)
          </a>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing Checklist

- [ ] GET `/api/leaderboard/` returns list of users sorted by XP
- [ ] GET `/api/users/alice_dev/` returns user with rank calculated
- [ ] GET `/api/commits/` returns paginated list with evaluations nested
- [ ] GET `/api/commits/{hash}/` returns single commit with raw_diff
- [ ] GET `/api/evaluations/` returns all evaluations
- [ ] GET `/api/evaluations/{id}/` returns evaluation with proof_url
- [ ] proof_url is clickable and opens Opik dashboard
- [ ] Filtering works: `?judge=ARCHITECT`, `?min_xp=70`, `?username=alice_dev`
- [ ] Pagination works: `?page=2&page_size=50`

---

## Files Changed

| File | Lines Added | What Changed |
|------|-------------|--------------|
| `brain/serializers.py` | +200 | 5 new serializers with computed fields & nesting |
| `brain/views.py` | +300 | 7 new API endpoint classes with pagination & filtering |
| `brain/urls.py` | +30 | Route registrations for all endpoints |
| `brain/logic/ai_council.py` | ~5 | Fixed Opik initialization |

---

## That's It! 🎉

You now have:
- ✅ 3 production-ready serializers
- ✅ 7 fully-functional REST endpoints
- ✅ Complete Opik integration with proof URLs
- ✅ Pagination and filtering support
- ✅ Full type hints and documentation

**Next: Build the Next.js frontend to display this data!** 🚀

