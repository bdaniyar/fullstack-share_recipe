# Share Recipe – Fullstack Application

> Share Recipe is a web app where people publish cooking ideas, like, save and discuss recipes. Email & Google sign‑in, media uploads, and an admin panel make content management simple.  

Fullstack recipe sharing platform combining:
- Backend: FastAPI (async), PostgreSQL, Redis, Alembic, SQLAdmin, JWT, Google OAuth (PKCE)
- Frontend: Next.js (React, App Router), TypeScript-ready setup, Tailwind (if configured), REST API consumption

> This README covers BOTH frontend & backend. Each subfolder may also contain its own README for deeper details.

![UI Screenshot 1](share-recipe-frontend/src/assets/Снимок%20экрана%202025-08-29%20в%2019.47.31.png)
![UI Screenshot 2](share-recipe-frontend/src/assets/Снимок%20экрана%202025-08-29%20в%2021.25.57.png)

## Repositories
| Repo | Purpose | Deploy |
|------|---------|--------|
| [Frontend](https://github.com/bdaniyar/frontend-share_recipe-for_vercel) | Next.js + UI | Vercel |
| [Backend](https://github.com/bdaniyar/backend-share_recipe) | FastAPI + DB | Render / Railway |

---
## High‑Level Features
### User & Auth
- Email signup + verification code (Redis TTL)
- Password reset (email code flow)
- Google OAuth (PKCE) login
- JWT access / refresh tokens
- Session-based admin panel auth (SQLAdmin)

### Recipes & Social
- Recipe CRUD (title, content, ingredients, photos)
- Image upload (profile & recipe) served under `/media`
- Like / Save recipes
- Threaded comments (reply depth = 1) *(if implemented)*
- Daily posting / rate limits (configurable in code)

### Other
- Ingredient normalization & search
- Feedback submission + admin view
- Structured logging (console + rotating file)
- Caching layer (fastapi-cache + Redis) – verification codes & potential response caching
- Admin panel for models (User, Recipe, Ingredients, Comments, Likes, Saves, Feedback)
- OpenAPI/Swagger docs (dev open, can restrict in prod)

---
## Tech Stack
Backend:
- FastAPI, Pydantic Settings
- SQLAlchemy 2.x Async + asyncpg
- PostgreSQL
- Redis (verification codes / caching)
- Alembic (migrations)
- SQLAdmin (admin UI)
- python-jose (JWT)
- fastapi-cache, bcrypt, email utilities

Frontend:
- Next.js (React 18+, App Router)
- Fetch / Axios (depending on implementation) for API calls
- Global state (Redux or local hooks) *(see `src/redux/` if present)*
- Componentized UI (see `src/components/`)
- Static assets in `public/` & `src/assets/`

Infra / Dev:
- Docker & docker-compose
- Multi-stage friendly Dockerfile (backend) *(can be extended for frontend build)*

---
## Environment Variables
Create `.env` in `share-recipe-frontend/backend/` . Example:
```
# Core
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/share_recipe
SECRET_KEY=change-me
ALGORITHM=HS256

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASSWORD=password
EMAIL_FROM=no-reply@example.com

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# OAuth
OAUTH_GOOGLE_CLIENT_ID=...
OAUTH_GOOGLE_CLIENT_SECRET=...

# Admin / Sessions
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
SESSION_SECRET=optional-session-secret

# Optional docs protection (if enforced in code)
# DOCS_USERNAME=docs
# DOCS_PASSWORD=docs-pass

ENV=development
```
Frontend runtime config (for Next.js) typically in `.env.local` (not committed):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
Adjust for production (e.g., API reverse proxy URL).

---
## Quick Start (Fullstack via Docker Compose)
```
docker compose up --build
```
Services started:
- backend: FastAPI at http://localhost:8000
- frontend: Next.js at http://localhost:3000
- db: PostgreSQL
- redis: Redis

Data persistence:
- Postgres data: named volume `recipe-db-data`
- Uploaded media: bind mount `./share-recipe-frontend/backend/media` -> `/app/media`

On container start backend runs: `alembic upgrade head` then launches Uvicorn.

---
## Quick Start (Manual Without Docker)
1. Start PostgreSQL & Redis locally.
2. Create `.env` (see above) in backend directory.
3. Install backend deps:
```
cd share-recipe-frontend/backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
4. Frontend:
```
cd share-recipe-frontend
npm install
npm run dev
```
5. Open frontend: http://localhost:3000 (it calls backend at 8000).

---
## Migrations
Create & apply:
```
cd share-recipe-frontend/backend
alembic revision -m "add_feature"
alembic upgrade head
```

---
## Media & Uploads
- Profile photos: `/media/profile_photos/`
- Recipe images: `/media/recipe_photos/`
Static file mount defined in `app/main.py`. Persist `/app/media` in production.

---
## API & Docs
- OpenAPI JSON: `/openapi.json`
- Swagger UI: `/docs` (development)
- ReDoc: `/redoc` (if enabled)
Production can restrict docs via Basic Auth (set `ENV=production` + credentials if implemented).

---
## Admin Panel
- Path: `/admin`
- Auth: username/password (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)
- Provides CRUD browsing for key models using SQLAdmin.

---
## Google OAuth (PKCE)
State JWT holds `code_verifier` + redirect target, expires in 5 minutes. After callback tokens (access & refresh) provided to frontend (query params or JSON depending on implementation).

---
## Tests (Backend)
```
cd share-recipe-frontend/backend
pytest -q
```
Configure test env variables (can point `DATABASE_URL` to a SQLite URI for faster local tests if supported by code) & disable external dependencies as needed.

---
## Deployment Guidance
Frontend (Vercel recommended):
- Deploy `share-recipe-frontend` directory
- Set `NEXT_PUBLIC_API_BASE_URL` to deployed backend URL

Backend (Railway / Render / Fly.io / Docker host):
- Use provided Dockerfile
- Ensure it binds to `$PORT` env (already supported via `${PORT:-8000}` in command)
- Supply all environment variables via platform
- Run migrations automatically or via release phase (current CMD runs them on start)
- Persist `/app/media` (volume / object storage + rewrite)
- Monitor logs (`app/logging.py` handles rotation)

Security checklist:
- Strong `SECRET_KEY` & `SESSION_SECRET`
- Restrict admin credentials
- HTTPS termination at ingress layer
- Rotate secrets & tokens if compromised

---
## Logging & Observability
- Structured logs (timestamp, level, logger, request_id)
- Request ID middleware injects `X-Request-ID`
