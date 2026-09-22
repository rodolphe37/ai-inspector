# AI Inspector API

A small FastAPI service that publishes the **public fingerprint catalogue**
(known AI-provenance detection methods) in English and French.

It has **no accounts, no user data and never receives analysed content**: all
analysis runs in the browser (see [`../frontend`](../frontend)). Because it is
public and unauthenticated, it is read-only and hardened (see [Security](#security)).

## Stack

Python 3.11+ · FastAPI · SQLAlchemy 2 · Alembic · psycopg 3 ·
SQLite (development) / PostgreSQL (production, e.g. Neon)

## Quick start

```bash
make install     # venv + dev dependencies + .env from .env.example
make seed        # create tables (SQLite) and load the catalogue
make dev         # http://localhost:8000, interactive docs at /docs
```

| Command | Purpose |
|---|---|
| `make test` | pytest on an isolated SQLite file, no network |
| `make lint` / `make fmt` | ruff check / fix + format |
| `make migrate` | `alembic upgrade head` (PostgreSQL) |
| `make makemigration m="..."` | autogenerate a migration |
| `make db-up` / `make db-down` | local PostgreSQL via Docker Compose |
| `make smoke` | end-to-end check against a running server (`API=... make smoke`) |

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | liveness probe, `{"status": "ok", "version": ...}` |
| `GET` | `/api/fingerprints?lang=en\|fr` | full catalogue |
| `GET` | `/api/fingerprints/{id}?lang=en\|fr` | one entry (`id`: `[a-z0-9-]{1,64}`) |

`lang` localizes `name`, `provider`, `description`, `detection_method` and
`coverage`; untranslated fields fall back to English. Responses are cacheable
for 5 minutes.

## Configuration

Every setting has a working default for local development
(see [`.env.example`](.env.example)).

| Variable | Default | Notes |
|---|---|---|
| `ENVIRONMENT` | `development` | `production` enables HSTS and disables `/docs` |
| `DATABASE_URL` | `sqlite:///./ai_inspector.db` | `postgres://` and `postgresql://` URLs are accepted |
| `CORS_ORIGINS` | `http://localhost:5173,...` | comma-separated web-app origins |
| `CORS_ORIGIN_REGEX` | empty | extra origins, e.g. Netlify deploy previews |
| `RATE_LIMIT_PER_MINUTE` | `120` | per client IP, `0` disables |
| `ALLOWED_HOSTS` | empty | optional `Host` header allow-list |
| `ENABLE_DOCS` | auto | force `/docs` on or off |

## Security

- Only `GET`, `HEAD` and `OPTIONS` are served; other methods get `405`.
- Per-IP fixed-window rate limiting with `RateLimit-*` and `Retry-After` headers.
- Strict headers: `Content-Security-Policy: default-src 'none'`, `nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, HSTS in production,
  no `Server` header.
- CORS limited to the configured origins, `GET` only, no credentials.
- Path parameters validated; interactive docs off in production.

Implementation: [`app/hardening.py`](app/hardening.py). Report vulnerabilities
as described in [`../SECURITY.md`](../SECURITY.md).

## Catalogue

Entries live in [`app/seed_data.py`](app/seed_data.py) (English) and
[`app/seed_data_fr.py`](app/seed_data_fr.py) (French, keyed by id). Seeding is
idempotent and runs at every startup, so editing these files and redeploying is
enough to update production.

## Database

- **SQLite** (default): tables are created at startup.
- **PostgreSQL**: migrations via Alembic; the Docker image runs
  `alembic upgrade head` before serving.

## Deployment

The [`Dockerfile`](Dockerfile) runs `alembic upgrade head`, then serves on `$PORT`
behind a proxy. A Render Blueprint is provided in [`../render.yaml`](../render.yaml);
any container host with a PostgreSQL database (for example Neon, whose plain
`postgresql://...` pooled URL works as is) will do.
