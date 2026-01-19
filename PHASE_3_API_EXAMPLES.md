# Phase 3: REST API Endpoints Reference

## Overview
Phase 3 implements 7 new REST API endpoints for exposing leaderboard data, user profiles, commit history, and AI evaluations.

All endpoints are **public** (no authentication required for leaderboard/data views).

---

## Endpoints Summary

| Endpoint | Method | Purpose | Pagination |
|----------|--------|---------|-----------|
| `GET /api/leaderboard/` | GET | Top users by XP | Yes (20/page) |
| `GET /api/users/{username}/` | GET | User profile & stats | No |
| `GET /api/commits/` | GET | Recent commits feed | Yes (20/page) |
| `GET /api/commits/{hash}/` | GET | Single commit detail | No |
| `GET /api/evaluations/` | GET | All AI evaluations | Yes (20/page) |
| `GET /api/evaluations/{id}/` | GET | Single evaluation detail | No |
| `POST /api/repositories/webhook/` | POST | Create webhook | No (auth required) |

---

## 1. Leaderboard

### Request
```bash
GET /api/leaderboard/?page=1&page_size=20&min_level=5
```

### Response (200 OK)
```json
{
  "count": 47,
  "next": "http://localhost:8000/api/leaderboard/?page=2",
  "previous": null,
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
    },
    {
      "rank": 2,
      "github_username": "bob_secure",
      "total_xp": 2150,
      "current_level": 5,
      "xp_to_next_level": 350,
      "current_streak": 5,
      "last_commit_date": "2025-01-18T10:15:00Z",
      "avatar_url": "https://avatars.githubusercontent.com/u/67890?v=4",
      "title": "Security Guardian"
    }
  ]
}
```

### Query Parameters
- `page`: Page number (default 1)
- `page_size`: Results per page (default 20, max 100)
- `min_level`: Filter users by minimum level (e.g., `?min_level=5`)

---

## 2. User Profile

### Request
```bash
GET /api/users/alice_dev/
```

### Response (200 OK)
```json
{
  "github_username": "alice_dev",
  "total_xp": 2500,
  "current_level": 6,
  "xp_to_next_level": 0,
  "current_streak": 8,
  "last_commit_date": "2025-01-19T14:30:00Z",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
  "title": "Master Architect",
  "rank": 1,
  "total_commits": 24,
  "recent_commits": [
    {
      "id": 142,
      "commit_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "message": "Refactor authentication module with dependency injection",
      "timestamp": "2025-01-19T14:30:00Z",
      "url": "https://github.com/alice_dev/project/commit/a1b2c3d4",
      "author_username": "alice_dev",
      "repository_name": "alice_dev/project",
      "total_xp_awarded": 95,
      "is_processed": true,
      "evaluation_count": 3,
      "created_at": "2025-01-19T14:32:00Z"
    }
  ]
}
```

---

## 3. Commit Feed

### Request
```bash
GET /api/commits/?page=1&is_processed=true&username=alice_dev&repo=project
```

### Response (200 OK)
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/commits/?page=2&is_processed=true",
  "previous": null,
  "results": [
    {
      "id": 142,
      "commit_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "message": "Refactor authentication module",
      "timestamp": "2025-01-19T14:30:00Z",
      "url": "https://github.com/alice_dev/project/commit/a1b2c3d4",
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
          "reasoning": "**What You Did Well:**\n- Clear separation of concerns\n- Good use of dependency injection pattern\n\n**Areas for Growth:**\n- Consider adding more comprehensive error handling\n\n**Your Next Step:**\n- Implement custom exception classes",
          "opik_trace_id": "trace_12345abc",
          "proof_url": "https://www.comet.com/opik/traces/trace_12345abc?workspace=default",
          "created_at": "2025-01-19T14:35:00Z"
        },
        {
          "id": 426,
          "judge_type": "PALADIN",
          "judge_display": "The Paladin (Security)",
          "xp_awarded": 80,
          "reasoning": "**What You Did Well:**\n- Proper input validation on all endpoints\n- Good use of environment variables for secrets\n\n**Areas for Growth:**\n- Add rate limiting middleware\n\n**Your Next Step:**\n- Implement Django-ratelimit package",
          "opik_trace_id": "trace_12345def",
          "proof_url": "https://www.comet.com/opik/traces/trace_12345def?workspace=default",
          "created_at": "2025-01-19T14:35:30Z"
        },
        {
          "id": 427,
          "judge_type": "SCRIBE",
          "judge_display": "The Scribe (Syntax/Style)",
          "xp_awarded": 75,
          "reasoning": "**What You Did Well:**\n- Clear variable names and function signatures\n- Good docstring format\n\n**Areas for Growth:**\n- Add type hints to all functions\n\n**Your Next Step:**\n- Run mypy to check type coverage",
          "opik_trace_id": "trace_12345ghi",
          "proof_url": "https://www.comet.com/opik/traces/trace_12345ghi?workspace=default",
          "created_at": "2025-01-19T14:36:00Z"
        }
      ],
      "created_at": "2025-01-19T14:32:00Z"
    }
  ]
}
```

### Query Parameters
- `page`: Page number (default 1)
- `page_size`: Results per page (default 20, max 100)
- `is_processed`: Filter by status (`true` or `false`)
- `username`: Filter by author (e.g., `?username=alice_dev`)
- `repo`: Filter by repository name (partial match, e.g., `?repo=project`)

---

## 4. Commit Detail

### Request
```bash
GET /api/commits/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/
```

### Response (200 OK)
```json
{
  "id": 142,
  "commit_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "message": "Refactor authentication module",
  "timestamp": "2025-01-19T14:30:00Z",
  "url": "https://github.com/alice_dev/project/commit/a1b2c3d4",
  "author_username": "alice_dev",
  "repository_name": "alice_dev/project",
  "total_xp_awarded": 95,
  "is_processed": true,
  "raw_diff": "diff --git a/auth.py b/auth.py\nindex 1234567..abcdefg 100644\n--- a/auth.py\n+++ b/auth.py\n@@ -1,10 +1,15 @@\n class AuthService:\n-    def login(self, user, password):\n+    def login(self, user: User, password: str) -> Token:\n         validate_input(user, password)\n         ...\n",
  "evaluations": [
    {
      "id": 425,
      "judge_type": "ARCHITECT",
      "judge_display": "The Architect (Complexity)",
      "xp_awarded": 85,
      "reasoning": "**What You Did Well:**...",
      "opik_trace_id": "trace_12345abc",
      "proof_url": "https://www.comet.com/opik/traces/trace_12345abc?workspace=default",
      "created_at": "2025-01-19T14:35:00Z"
    }
  ],
  "created_at": "2025-01-19T14:32:00Z"
}
```

**Note:** This endpoint includes `raw_diff` for detailed code review purposes.

---

## 5. Judge Evaluations List

### Request
```bash
GET /api/evaluations/?judge=ARCHITECT&min_xp=70&max_xp=100
```

### Response (200 OK)
```json
{
  "count": 342,
  "next": "http://localhost:8000/api/evaluations/?page=2&judge=ARCHITECT",
  "previous": null,
  "results": [
    {
      "id": 425,
      "judge_type": "ARCHITECT",
      "judge_display": "The Architect (Complexity)",
      "xp_awarded": 85,
      "reasoning": "Excellent architectural decisions with clear separation of concerns.",
      "opik_trace_id": "trace_12345abc",
      "proof_url": "https://www.comet.com/opik/traces/trace_12345abc?workspace=default",
      "created_at": "2025-01-19T14:35:00Z"
    }
  ]
}
```

### Query Parameters
- `page`: Page number (default 1)
- `page_size`: Results per page (default 20, max 100)
- `judge`: Filter by judge type (`ARCHITECT`, `PALADIN`, or `SCRIBE`)
- `min_xp`: Minimum XP (e.g., `?min_xp=70`)
- `max_xp`: Maximum XP (e.g., `?max_xp=100`)
- `commit`: Filter by commit hash (partial match, e.g., `?commit=a1b2c3`)

---

## 6. Judge Evaluation Detail

### Request
```bash
GET /api/evaluations/425/
```

### Response (200 OK)
```json
{
  "id": 425,
  "judge_type": "ARCHITECT",
  "judge_display": "The Architect (Complexity)",
  "xp_awarded": 85,
  "reasoning": "**What You Did Well:**\n- Excellent architectural soundness with clear module separation\n- Strong adherence to SOLID principles\n- Good use of design patterns (Factory, Dependency Injection)\n\n**Areas for Growth:**\n- Consider adding more comprehensive error handling\n- Performance optimization for large datasets\n\n**Your Next Step:**\n- Implement custom exception hierarchy\n- Add caching for frequently accessed data",
  "opik_trace_id": "trace_12345abc",
  "proof_url": "https://www.comet.com/opik/traces/trace_12345abc?workspace=default",
  "created_at": "2025-01-19T14:35:00Z"
}
```

**Click `proof_url` to view the full AI reasoning on Opik dashboard!**

---

## 7. Create Repository Webhook (Authenticated)

### Request
```bash
POST /api/repositories/webhook/
Authorization: Bearer {your_auth_token}
Content-Type: application/json

{
  "repo_name": "my-awesome-project"
}
```

### Response (201 Created)
```json
{
  "status": "success",
  "message": "Webhook created successfully for john_doe/my-awesome-project.",
  "webhook_id": 123456789
}
```

### Errors

**400 Bad Request** - Missing repo_name
```json
{
  "repo_name": ["This field is required."]
}
```

**401 Unauthorized** - No GitHub account linked
```json
{
  "error": "The authenticated user 'john_doe' does not have a GitHub social account linked..."
}
```

**409 Conflict** - Repository already tracked
```json
{
  "error": "Repository \"john_doe/my-awesome-project\" is already being tracked."
}
```

---

## Usage Examples

### Get Top 10 Users
```bash
curl "http://localhost:8000/api/leaderboard/?page_size=10"
```

### Get User Profile with Recent Commits
```bash
curl "http://localhost:8000/api/users/alice_dev/"
```

### Get Recent Commits
```bash
curl "http://localhost:8000/api/commits/?is_processed=true"
```

### Get High-Quality Evaluations
```bash
curl "http://localhost:8000/api/evaluations/?min_xp=80"
```

### Get Architect Evaluations
```bash
curl "http://localhost:8000/api/evaluations/?judge=ARCHITECT"
```

### Get Commit Details with Full Diff
```bash
curl "http://localhost:8000/api/commits/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/"
```

### View Evaluation Proof URL
```bash
# Get the evaluation
curl "http://localhost:8000/api/evaluations/425/"

# Copy the proof_url from response and open in browser:
# https://www.comet.com/opik/traces/trace_12345abc?workspace=default
```

---

## Frontend Integration

### Leaderboard Display
```javascript
// Fetch leaderboard
const response = await fetch('/api/leaderboard/?page=1&page_size=20');
const data = await response.json();

// Render with rank, avatar, username, level, XP
data.results.forEach((user, index) => {
  console.log(`${user.rank}. ${user.github_username} - Lvl ${user.current_level} (${user.total_xp} XP)`);
});
```

### Commit Feed
```javascript
// Fetch commits
const response = await fetch('/api/commits/?page=1&is_processed=true');
const data = await response.json();

// Display with evaluations and proof links
data.results.forEach(commit => {
  console.log(`Commit: ${commit.message}`);
  commit.evaluations.forEach(eval => {
    console.log(`  ${eval.judge_display}: ${eval.xp_awarded} XP - ${eval.proof_url}`);
  });
});
```

### User Profile
```javascript
// Fetch user
const username = 'alice_dev';
const response = await fetch(`/api/users/${username}/`);
const user = await response.json();

// Display profile with stats and recent activity
console.log(`${user.github_username} - Level ${user.current_level} (${user.total_xp} XP)`);
console.log(`Rank: #${user.rank}`);
console.log(`Recent Commits: ${user.recent_commits.length}`);
```

---

## Notes

- All endpoints support **JSON** responses
- Pagination defaults to **20 results per page**
- **Proof URLs** for evaluations expire after 30 days (Opik retention)
- **Raw diffs** are truncated to 50KB for performance
- All **public endpoints** (leaderboard, profiles, commits) have **no authentication required**
- **Repository webhook creation** requires **GitHub OAuth authentication**

