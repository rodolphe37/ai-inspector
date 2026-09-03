# CLAUDE.md

Repo guide for AI assistants. Keep it short; link out for detail.

## What this is

`Provenance Inspector` — an **evidence-based AI-origin analyser** for text and
images. It emits one verdict (`ai_confirmed` / `ai_likely` / `ai_possible` /
`inconclusive` / `no_evidence` / `human_declared`) with a confidence basis
(`cryptographic` / `metadata` / `statistical`) and the list of contributing
signals. **Never present a statistical estimate as proof** — the honest caveats
in `engine/assess.ts` and the UI copy are load-bearing. A cryptographic verdict
(valid C2PA manifest) is authoritative; everything else is an estimate.

Monorepo: [`frontend/`](frontend) (React SPA, runs all analysis in-browser) +
[`backend/`](backend) (FastAPI — accounts, quotas, history, catalogue; never
analyses content).

## Run / verify

```bash
cd backend  && make install && make seed && make dev     # :8000, SQLite
cd frontend && npm install && npm run dev                 # :5173

cd backend  && make test && make lint                     # pytest (16) + ruff
cd frontend && npm run typecheck && npm run lint && npm run build
```

PostgreSQL: `cd backend && make db-up`, set `DATABASE_URL` in `backend/.env`,
`make migrate`.

## Ground rules

- **Plans**: three tiers — `anonymous`, `pro`, `premium` (no free-account tier).
  The matrix in [`docs/PLANS.md`](docs/PLANS.md) is authoritative and mirrored in
  `backend/app/plans.py` **and** `frontend/src/lib/plans.ts` — change all three
  together.
- **Analysis stays client-side** (`frontend/src/engine/`). Don't add
  content-analysis endpoints to the backend; it breaks the privacy promise.
- **Anonymous persistence** is IndexedDB only (`frontend/src/lib/localDb.ts`).
  Signed-in users use the API. `services/index.ts` switches on auth state.
- **Quota** is enforced server-side (`backend/app/quota.py`); the client just
  reacts to `429`. Fixed window, `analysis` and `clean` share the budget.
- **Latest stable deps.** TypeScript is pinned to 5.9 only because
  `typescript-eslint` peers `<6.1`; revisit when it supports TS 7.
- Tailwind 4 keeps the JS config via `@config` in `src/index.css`; custom color
  tokens are CSS-variable based for runtime light/dark.
- Commit messages: use `git commit -F <file>` for multi-line bodies (shell
  mangles `-m` strings with `+`/unicode).

## Layout

```
frontend/src/
  engine/         c2pa (WASM) · aiImage (FFT/noise) · aiText (stylometry) · assess (verdict)
                  · unicode · metadata · statistics · fingerprints · score · index (orchestrator) · clean
  services/       index (analysisApi, historyApi, settingsApi, fingerprintApi, runAnalysis) · catalog · dashboard · errors
  stores/         useAuthStore · useQuotaStore · useSettingsStore · useHistoryStore
  lib/            apiClient · plans · localDb
  components/auth/ AuthPanel · OAuthButtons · SignUpModal · AuthCallback (page)
  pages/ , pages/app/

backend/app/
  main · config · db · models · schemas · plans · quota · security · deps · oauth · auth_service · seed(_data)
  routers/        auth · oauth_routes · users · settings_routes · scans · analyses · dashboard · fingerprints · billing
```

## Docs

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/PLANS.md`](docs/PLANS.md)
· [`backend/README.md`](backend/README.md) · [`frontend/README.md`](frontend/README.md)
