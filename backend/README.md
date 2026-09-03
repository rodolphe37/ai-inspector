# IA Inspector — API

FastAPI service that provides **accounts, authentication, scan quotas, simulated
billing, per-user history and the fingerprint catalogue** for the IA Inspector SPA.

It does **not** analyse content. All provenance analysis (Unicode, metadata,
C2PA, statistics) runs client-side in the browser — see `../frontend`. This
service only stores what a signed-in user chooses to keep.

## Stack

- Python 3.11+ · FastAPI · SQLAlchemy 2 (sync) · Alembic
- SQLite by default (zero config) · PostgreSQL in production
- JWT access tokens + rotating refresh tokens · bcrypt
- OAuth via Authlib (Google, GitHub, Microsoft, Facebook, Apple, X, LinkedIn,
  Discord) · passwordless magic links

## Quick start

```bash
cd backend
make install         # venv + deps + .env from .env.example
make seed            # create tables (SQLite) and load the fingerprint catalogue
make seed-demo       # optional: create local Pro + Premium test accounts
make dev             # http://localhost:8000  ·  docs at /docs
```

### Test accounts (local dev)

Anonymous use needs no account. To try the **Pro** and **Premium** tiers,
`make seed-demo` creates:

| Email | Password | Plan |
|---|---|---|
| `pro@demo.ia-inspector.app` | `demo-pro-pass` | pro |
| `premium@demo.ia-inspector.app` | `demo-premium-pass` | premium |

It refuses to run outside `ENVIRONMENT=development` / `test` / `local`. You can
also just register normally (you land on Pro) and switch to Premium from
**Settings → Upgrade to Premium** — billing is simulated (`POST /billing/upgrade`).

`make test` runs the pytest suite, `make smoke` runs an end-to-end check against
a already-running server, `make lint` runs ruff.

## Database

**SQLite (default)** — nothing to do. Tables are created on startup and by
`make seed`.

**PostgreSQL**

```bash
make db-up            # docker compose up -d db  (postgres:16 on :5432)
# in backend/.env:
#   DATABASE_URL=postgresql+psycopg://ia_inspector:ia_inspector@localhost:5432/ia_inspector
make migrate          # alembic upgrade head
make seed
```

Or run the whole thing in containers: `docker compose --profile api up`.

### Migrations

```bash
make makemigration m="add widget table"   # autogenerate
make migrate                              # apply
```

`init_db()` (used for SQLite/dev/tests) calls `create_all()`; Postgres should be
driven by Alembic.

## Configuration

Every setting has a dev default. See [`.env.example`](.env.example) for the full
list. The important ones:

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./ia_inspector.db` | Postgres: `postgresql+psycopg://…` |
| `JWT_SECRET` / `SESSION_SECRET` | dev values | **must** be changed in production |
| `CORS_ORIGINS` | `http://localhost:5173,…` | comma-separated |
| `FRONTEND_URL` | `http://localhost:5173` | OAuth / magic-link redirect target |
| `API_BASE_URL` | `http://localhost:8000` | used to build OAuth callback URLs |
| `ANON_SCAN_LIMIT` / `ANON_WINDOW_HOURS` | `5` / `48` | anonymous quota |
| `PRO_SCAN_LIMIT` / `PRO_WINDOW_HOURS` | `300` / `24` | pro quota (premium is unlimited) |

## OAuth setup

A provider's button only appears in the SPA once its `*_CLIENT_ID` **and**
`*_CLIENT_SECRET` are set. For each provider, register an app on its developer
console and set the **redirect / callback URL** to:

```
{API_BASE_URL}/api/auth/oauth/{provider}/callback
```

e.g. `http://localhost:8000/api/auth/oauth/google/callback`.

| Provider | Console | Scopes used |
|---|---|---|
| `google` | https://console.cloud.google.com/apis/credentials | `openid email profile` |
| `github` | https://github.com/settings/developers | `read:user user:email` |
| `microsoft` | https://portal.azure.com → App registrations | `openid email profile` |
| `facebook` | https://developers.facebook.com/apps | `email public_profile` |
| `apple` | https://developer.apple.com → Identifiers | `name email` (secret is a JWT) |
| `twitter` | https://developer.twitter.com | `users.read tweet.read` (no email) |
| `linkedin` | https://www.linkedin.com/developers/apps | `openid profile email` |
| `discord` | https://discord.com/developers/applications | `identify email` |

The OAuth callback issues a short-lived one-time `code`; the SPA calls
`POST /api/auth/oauth/exchange` to swap it for a token pair.

## API surface

```
GET    /api/health
GET    /api/meta/plans                     capability matrix for the 3 tiers

POST   /api/auth/register                  { email, name, password, plan }
POST   /api/auth/login
POST   /api/auth/refresh                   rotating refresh tokens
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/anon                      issue / reuse an anonymous session id
POST   /api/auth/magic/request             passwordless — emails (or logs) a link
POST   /api/auth/magic/consume

GET    /api/auth/oauth/providers           enabled providers only
GET    /api/auth/oauth/{provider}/login    ?plan=pro|premium
GET|POST /api/auth/oauth/{provider}/callback
POST   /api/auth/oauth/exchange            { code } -> token pair

GET    /api/scans/quota                    current window status
POST   /api/scans/consume                  { kind: analysis|clean } -> 200 | 429

GET    /api/settings                       auth
PUT    /api/settings

GET    /api/analyses                       auth — server-side history (pro/premium)
POST   /api/analyses
GET    /api/analyses/{id}
DELETE /api/analyses/{id}
GET    /api/dashboard                      aggregates computed from real analyses

GET    /api/fingerprints                   public catalogue
GET    /api/fingerprints/{id}

GET    /api/billing/plans
POST   /api/billing/upgrade                { plan } — simulated, Stripe-ready
```

## Tests

```bash
make test        # pytest, isolated SQLite temp DB, no network
```

Covers register/login/refresh rotation, magic links, anon sessions, the quota
lifecycle (exhaust → 429 → reset), analysis CRUD + tenant isolation, dashboard
aggregation, the seeded catalogue and the plan matrix.
