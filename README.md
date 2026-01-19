# Prometheia 🚀

> **Gamified GitHub Commit Tracker with AI-Powered Code Reviews**
>
> Stop breaking your New Year's resolution by January 15th. Prometheia turns daily coding into an engaging, transparent game where AI judges evaluate your commits and award XP for quality improvements.

[![Hackathon](https://img.shields.io/badge/Hackathon-Encode%20Club%3A%20Commit%20to%20Change-blue)](https://www.encode.club/)
[![Django](https://img.shields.io/badge/Django-6.0-green)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem & Solution](#problem--solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Environment Setup](#environment-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Prometheia** is a gamified GitHub tracker that uses **AI-powered code evaluation** to motivate developers to build better code through consistent daily commits. Each commit is analyzed by three AI judges (The Council of Wizards) who evaluate:

- 🏛️ **The Architect** - Code structure, design patterns, maintainability
- 🛡️ **The Paladin** - Security practices, vulnerability prevention
- 📚 **The Scribe** - Documentation, naming conventions, readability

Every evaluation is **fully transparent** with direct links to Opik observability for complete proof-of-work.

---

## Problem & Solution

### The Problem
- Developers struggle to maintain consistent coding habits
- New Year's resolutions typically fail by mid-January
- Code quality is hard to measure objectively
- Developer improvement is often subjective and unclear

### Our Solution
**Gamification + AI Transparency = Accountability**

| Feature | Benefit |
|---------|---------|
| **Daily Streaks** | Encourage consistency through habit tracking |
| **XP & Levels** | Progressive rewards for growth |
| **AI Judges** | Objective, transparent code evaluation |
| **Proof URLs** | See exactly why code was scored |
| **Leaderboard** | Friendly competition & motivation |

---

## Features

### ✅ Implemented (Phase 1-3)

#### 🔐 Security & Webhooks
- ✅ GitHub Webhook verification (HMAC-SHA256)
- ✅ Secure webhook secret management
- ✅ Idempotent commit processing
- ✅ GitHub OAuth authentication

#### 🤖 AI Evaluation
- ✅ Three parallel AI judges (Gemini 1.5 Flash)
- ✅ Comprehensive evaluation prompts with rubrics
- ✅ Opik integration for complete observability
- ✅ Trace IDs stored for proof-of-work
- ✅ Graceful error handling with baseline scoring

#### 💾 Data Models
- ✅ UserProfile with XP, level, and streak tracking
- ✅ Repository webhook management
- ✅ CommitLog with diff storage for audit trails
- ✅ JudgeEvaluation with opik_trace_ids
- ✅ Database integrity with atomic transactions

#### 🔄 Task Queue
- ✅ Celery + Redis for async processing
- ✅ Non-blocking webhook responses
- ✅ Automatic retry logic for failed evaluations
- ✅ XP calculation with atomic updates

#### 📊 REST API (Phase 3)
- ✅ **Leaderboard** - Top 100 users by XP
- ✅ **User Profiles** - Individual stats & recent commits
- ✅ **Commit Feed** - Recent commits with evaluations
- ✅ **Commit Details** - Full diff + all judge feedback
- ✅ **Evaluations** - All judge scores with proof URLs
- ✅ Pagination on all list endpoints
- ✅ Filtering (by judge type, XP range, username, repo)
- ✅ Nested serializers for related data
- ✅ Computed fields (XP to level, ranks)

### ⏳ In Progress (Phase 4-6)

#### Phase 4: Testing & Observability
- [ ] Unit tests for serializers and services
- [ ] Integration tests for API endpoints
- [ ] Test fixtures and factories
- [ ] Opik trace verification dashboard

#### Phase 5: Frontend (Next.js)
- [ ] Leaderboard UI with real-time updates
- [ ] User profile & stats dashboard
- [ ] Commit detail page with code diff viewer
- [ ] Proof URL integration to Opik
- [ ] GitHub OAuth login flow

#### Phase 6: Production Hardening
- [ ] API rate limiting & throttling
- [ ] Leaderboard caching (5-min TTL)
- [ ] Database query optimization & indexing
- [ ] Structured logging & monitoring
- [ ] Performance profiling & optimization

---

## Tech Stack

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Django** | Web framework | 6.0.1 |
| **Django Rest Framework** | REST API | 3.16.1 |
| **PostgreSQL** | Database | 13+ |
| **Celery** | Task queue | Latest |
| **Redis** | Cache & message broker | 7+ |
| **Gemini 1.5 Flash** | AI evaluation engine | Latest |
| **Opik** | LLM observability | Latest |
| **Google GenAI** | Gemini API client | 0.8.6 |
| **HTTPX** | Async HTTP client | 0.28.1 |
| **python-dotenv** | Environment management | Latest |

### Frontend (Upcoming)
- **Next.js** - React framework
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Axios** - API client

### DevOps & Monitoring
- **GitHub Webhooks** - Event triggering
- **Opik** - LLM tracing & observability
- **Django Debug Toolbar** - Development debugging

---

## Project Status

```
Phase 1: Core Infrastructure       ✅ COMPLETE
  ├─ GitHub Webhook security
  ├─ Task queue setup
  ├─ GitHub API client
  └─ Database models

Phase 2: AI Council                ✅ COMPLETE
  ├─ Three judge functions
  ├─ XP calculation logic
  ├─ Atomic transactions
  └─ Opik integration (fixed)

Phase 3: REST API                  ✅ COMPLETE
  ├─ Serializers (UserProfile, CommitLog, JudgeEvaluation)
  ├─ 7 API endpoints
  ├─ Pagination & filtering
  └─ Full documentation

Phase 4: Testing & Observability   ⏳ IN PROGRESS
  ├─ Unit tests
  ├─ Integration tests
  ├─ Opik trace verification
  └─ Test fixtures

Phase 5: Frontend (Next.js)        ⏳ PENDING
  ├─ Leaderboard UI
  ├─ User profile page
  ├─ Commit detail view
  └─ Proof URL integration

Phase 6: Production                ⏳ PENDING
  ├─ Rate limiting
  ├─ Caching strategy
  ├─ Performance optimization
  └─ Monitoring setup
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 13+
- Redis 7+
- Node.js 18+ (for frontend, separate repo)
- Git with SSH configured

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Gigitogigs/Prometheia.git
   cd Prometheia
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or: source venv/bin/activate  # Unix
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Set up database**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Start Redis** (in separate terminal)
   ```bash
   redis-server
   # or: docker run -d -p 6379:6379 redis:7
   ```

7. **Start Celery worker** (in separate terminal)
   ```bash
   celery -A Prometheia worker -l info
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```

Server runs at `http://localhost:8000`

---

## Architecture

### System Design

```
GitHub
  │
  ├─ User makes commit
  │
  └─→ GitHub Webhook ──→ Django Webhook Handler
                         (signature verification)
                              │
                              ├─ Create CommitLog
                              ├─ Extract metadata
                              └─ Queue Celery task (HTTP 202)
                                   │
                                   ├─→ Fetch diff from GitHub API
                                   │
                                   ├─→ Run 3 AI judges (parallel)
                                   │   ├─ Judge Architect (Gemini)
                                   │   ├─ Judge Paladin (Gemini)
                                   │   └─ Judge Scribe (Gemini)
                                   │
                                   ├─→ Create JudgeEvaluations
                                   │   (with opik_trace_ids)
                                   │
                                   ├─→ Calculate total XP
                                   │
                                   ├─→ Update UserProfile
                                   │   ├─ total_xp
                                   │   ├─ current_level
                                   │   ├─ current_streak
                                   │   └─ last_commit_date
                                   │
                                   └─→ Mark commit as processed
                                        │
                                        └─→ API serves data
                                            ├─ Leaderboard
                                            ├─ User profiles
                                            ├─ Commit feed
                                            └─ Evaluation proofs
```

### Database Schema

```
UserProfile
├─ id (PK)
├─ user (FK: django.contrib.auth.User)
├─ github_username (unique, indexed)
├─ total_xp
├─ current_level
├─ current_streak
├─ last_commit_date
├─ avatar_url
└─ title

Repository
├─ id (PK)
├─ owner (FK: UserProfile)
├─ name
├─ full_name (unique)
├─ webhook_secret
├─ is_active
└─ created_at

CommitLog
├─ id (PK)
├─ repository (FK: Repository)
├─ author (FK: UserProfile, nullable)
├─ commit_hash (unique, indexed)
├─ message
├─ timestamp
├─ url
├─ raw_diff
├─ is_processed
├─ total_xp_awarded
└─ created_at

JudgeEvaluation
├─ id (PK)
├─ commit (FK: CommitLog)
├─ judge_type (ARCHITECT/PALADIN/SCRIBE)
├─ xp_awarded
├─ reasoning
├─ opik_trace_id (references Opik dashboard)
└─ created_at
```

---

## API Documentation

### Quick Reference

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/leaderboard/` | GET | Top 100 users by XP | Public |
| `/api/users/{username}/` | GET | User profile & stats | Public |
| `/api/commits/` | GET | Commit feed | Public |
| `/api/commits/{hash}/` | GET | Commit details with diff | Public |
| `/api/evaluations/` | GET | All judge evaluations | Public |
| `/api/evaluations/{id}/` | GET | Single evaluation | Public |
| `/api/repositories/webhook/` | POST | Create webhook | Required |

### Complete API Examples

**Get Leaderboard**
```bash
curl http://localhost:8000/api/leaderboard/?page=1&page_size=20
```

**Get User Profile**
```bash
curl http://localhost:8000/api/users/alice_dev/
```

**Get Commit with Evaluations**
```bash
curl http://localhost:8000/api/commits/a1b2c3d4e5f6/
```

**Get High-Quality Evaluations**
```bash
curl http://localhost:8000/api/evaluations/?judge=ARCHITECT&min_xp=80
```

For complete API documentation with examples, see:
- [PHASE_3_API_EXAMPLES.md](PHASE_3_API_EXAMPLES.md) - Detailed endpoint examples
- [PHASE_3_TECHNICAL.md](PHASE_3_TECHNICAL.md) - Implementation details

---

## Project Structure

```
Prometheia/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── manage.py                          # Django management script
├── .env.example                       # Environment template
│
├── brain/                             # Main Django app
│   ├── models.py                      # UserProfile, Repository, CommitLog, JudgeEvaluation
│   ├── views.py                       # REST API endpoints (7 endpoints)
│   ├── serializers.py                 # Serializers for API responses
│   ├── urls.py                        # URL routing
│   ├── admin.py                       # Django admin config
│   ├── tasks.py                       # Celery tasks (async evaluation)
│   ├── signals.py                     # Django signals
│   ├── apps.py                        # App configuration
│   │
│   ├── services/                      # Business logic
│   │   ├── github_webhook_handler.py  # HMAC signature verification
│   │   ├── github_client.py           # GitHub API wrapper
│   │   └── xp_calculator.py           # XP aggregation logic
│   │
│   ├── logic/                         # AI evaluation
│   │   └── ai_council.py              # Three AI judges with Opik tracing
│   │
│   ├── migrations/                    # Database migrations
│   └── tests.py                       # Tests (to be implemented)
│
├── Prometheia/                        # Django project settings
│   ├── settings.py                    # Django configuration
│   ├── urls.py                        # Main URL routing
│   ├── wsgi.py                        # WSGI entry point
│   ├── asgi.py                        # ASGI entry point
│   └── celery.py                      # Celery configuration
│
├── Documentation/
│   ├── PHASE_3_INDEX.md               # Master documentation index
│   ├── PHASE_3_QUICKREF.md            # Quick reference card
│   ├── PHASE_3_SUMMARY.md             # High-level overview
│   ├── PHASE_3_API_EXAMPLES.md        # Copy-paste API examples
│   ├── PHASE_3_TECHNICAL.md           # Implementation details
│   ├── PHASE_3_SETUP.md               # Setup & testing guide
│   └── PHASE_3_VISUAL.md              # Visual diagrams
│
└── GEMINI.md                          # Project specification & checklist
```

---

## Development Guide

### Code Standards

- **Python**: PEP 8, Black formatting
- **Type Hints**: 100% coverage on public APIs
- **Docstrings**: Google-style format
- **Testing**: pytest with >80% coverage (goal)
- **Git**: Conventional commits

### Key Files to Know

| File | Purpose |
|------|---------|
| `brain/models.py` | Database models & ORM |
| `brain/views.py` | REST API endpoints |
| `brain/serializers.py` | JSON serialization |
| `brain/logic/ai_council.py` | AI judge evaluation logic |
| `brain/services/xp_calculator.py` | XP calculation & user updates |
| `brain/tasks.py` | Celery async tasks |
| `Prometheia/settings.py` | Django configuration |

### Common Tasks

**Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Create test data**
```bash
python manage.py shell
>>> from brain.models import UserProfile
>>> UserProfile.objects.create(github_username='test', total_xp=500)
```

**Test an endpoint**
```bash
curl -s http://localhost:8000/api/leaderboard/ | python -m json.tool
```

**Check for errors**
```bash
python manage.py check
```

---

## Environment Setup

### Required Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True  # False in production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=prometheia
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# GitHub
GITHUB_TOKEN=ghp_your_github_token
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Opik (Observability)
OPIK_API_KEY=your-opik-api-key
OPIK_WORKSPACE=default
OPIK_ENABLED=True

# Redis / Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS (Frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Getting API Keys

1. **GitHub Token**: Settings → Developer settings → Personal access tokens → Scopes: `repo`, `admin:repo_hook`
2. **Gemini API**: [Google AI Studio](https://aistudio.google.com/) → Get API key
3. **Opik**: [Comet Opik](https://www.comet.com/opik) → Create account → Get API key

---

## Testing

### Manual Testing

```bash
# Test webhook
curl -X POST http://localhost:8000/api/webhooks/github/ \
  -H "X-Hub-Signature-256: sha256=..." \
  -H "X-GitHub-Event: push" \
  -d '{"repository": {"full_name": "user/repo"}, ...}'

# Test leaderboard
curl http://localhost:8000/api/leaderboard/

# Test user profile
curl http://localhost:8000/api/users/alice_dev/
```

### Automated Testing (Phase 4)

```bash
pytest brain/tests/ -v --cov=brain
```

---

## Deployment

### Production Checklist

- [ ] Set `DJANGO_DEBUG=False`
- [ ] Use strong `DJANGO_SECRET_KEY`
- [ ] Configure PostgreSQL with backups
- [ ] Set up Redis with persistence
- [ ] Enable HTTPS/SSL
- [ ] Configure email for notifications
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Set up logging aggregation

### Recommended Deployment Platforms

- **Backend**: Heroku, Railway, Render, AWS Elastic Beanstalk
- **Database**: AWS RDS, Railway, Heroku Postgres
- **Redis**: Redis Cloud, AWS ElastiCache
- **Frontend**: Vercel, Netlify (separate repo)

---

## Contributing

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone git@github.com:your-username/Prometheia.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clear, descriptive commit messages
   - Add type hints to functions
   - Write docstrings for new functions
   - Update tests as needed

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Reference any related issues
   - Describe your changes clearly
   - Ensure all tests pass

### Code Review Process

- At least 1 approval required
- All tests must pass
- No broken imports
- Type hints required

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: django` | Activate venv: `source venv/Scripts/activate` |
| `OPIK_API_KEY not found` | Add to `.env` file |
| `Connection refused (Redis)` | Start Redis: `redis-server` |
| `Webhook 404` | Ensure `brain.urls` is included in main `urls.py` |
| `Celery task not running` | Start worker: `celery -A Prometheia worker -l info` |
| `Database connection error` | Check PostgreSQL is running and `.env` credentials |

### Debug Mode

Enable verbose logging:
```bash
export DJANGO_LOG_LEVEL=DEBUG
python manage.py runserver
```

Check Celery tasks:
```bash
celery -A Prometheia inspect active
```

---

## Documentation

### Quick Links

| Document | Content |
|----------|---------|
| [PHASE_3_INDEX.md](PHASE_3_INDEX.md) | **START HERE** - Master documentation index |
| [PHASE_3_API_EXAMPLES.md](PHASE_3_API_EXAMPLES.md) | Complete API endpoint examples & responses |
| [PHASE_3_TECHNICAL.md](PHASE_3_TECHNICAL.md) | Implementation details & patterns |
| [PHASE_3_SETUP.md](PHASE_3_SETUP.md) | Setup & local testing guide |
| [PHASE_3_VISUAL.md](PHASE_3_VISUAL.md) | Visual diagrams & ASCII art |
| [GEMINI.md](GEMINI.md) | Complete project specification & checklist |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Team

**Hackathon**: Encode Club - Commit to Change (2025-2026)

---

## Support

### Getting Help

- **Issues**: Open a GitHub issue for bugs or features
- **Discussions**: Start a discussion for questions
- **Documentation**: Check [PHASE_3_INDEX.md](PHASE_3_INDEX.md) first
- **Email**: Contact team members

---

## Roadmap

### Short Term (Phase 4)
- [ ] Unit tests for serializers
- [ ] Integration tests for API
- [ ] Opik trace verification
- [ ] Performance optimization

### Medium Term (Phase 5)
- [ ] Next.js frontend
- [ ] Real-time leaderboard updates
- [ ] User dashboard
- [ ] GitHub OAuth flow

### Long Term (Phase 6)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Team/organization support
- [ ] Custom evaluation rules
- [ ] Webhook extensibility

---

**Happy coding! 🚀**

*Last updated: January 19, 2026*
