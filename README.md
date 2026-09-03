# Provenance Inspector

Independent provenance analysis for digital content — metadata, Unicode
artifacts, C2PA manifests and known statistical watermark patterns.
**Not an AI detector.** An absence of signal does not prove human origin; a
detected signal does not prove machine generation.

This is a monorepo:

| Package | Stack | What it does |
|---|---|---|
| [`frontend/`](frontend) | React 19 · Vite 8 · Tailwind 4 | The SPA. **Runs all content analysis in the browser.** |
| [`backend/`](backend) | Python · FastAPI · PostgreSQL/SQLite | Accounts, OAuth, scan quotas, simulated billing, synced history, fingerprint catalogue. Does **not** analyse content. |

## Run it

```bash
# 1. API  (SQLite by default — no external services needed)
cd backend
make install && make seed && make dev        # http://localhost:8000

# 2. Web app
cd ../frontend
npm install && cp .env.example .env
npm run dev                                   # http://localhost:5173
```

Use PostgreSQL instead of SQLite: `cd backend && make db-up` (Docker), set
`DATABASE_URL` in `backend/.env`, then `make migrate`.

## Plans

`anonymous` (no account, 5 scans / 48 h, local history) → `pro` → `premium`.
The full matrix — quotas, features, file limits — is in
[`docs/PLANS.md`](docs/PLANS.md) and is the single source of truth mirrored by
`backend/app/plans.py` and `frontend/src/lib/plans.ts`.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the pieces fit
- [`docs/PLANS.md`](docs/PLANS.md) — tiers, quotas, quota mechanics
- [`backend/README.md`](backend/README.md) — API, OAuth setup, migrations
- [`frontend/README.md`](frontend/README.md) — SPA, engine, routes
- [`CLAUDE.md`](CLAUDE.md) — repo guide for AI assistants

## Verify

```bash
cd backend  && make test && make lint         # 16 pytest + ruff
cd frontend && npm run typecheck && npm run lint && npm run build
```
