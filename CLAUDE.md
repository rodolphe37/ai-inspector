# CLAUDE.md

Repo guide for AI assistants. Keep it short; link out for detail.

## What this is

`AI Inspector`: a free, open-source (MIT), **evidence-based AI-origin analyser**
for text, code and images, bilingual (English / French) PWA. It emits one
verdict (`ai_confirmed` / `ai_likely` / `ai_possible` / `inconclusive` /
`no_evidence` / `human_declared`) with a confidence basis (`cryptographic` /
`metadata` / `statistical`) and the contributing signals. **Never present a
statistical estimate as proof**: the caveats in `engine/assess.ts` and the UI
copy are load-bearing. A valid C2PA manifest is authoritative; everything else
is an estimate.

Monorepo: [`frontend/`](frontend) (React SPA, runs all analysis in-browser) +
[`backend/`](backend) (FastAPI, public read-only fingerprint catalogue; never
analyses content, no user data).

## Run / verify

```bash
cd backend  && make install && make seed && make dev     # :8000, SQLite
cd frontend && npm install && npm run dev                 # :5173

cd backend  && make test && make lint                     # pytest + ruff
cd frontend && npm run typecheck && npm run lint && npm run build
```

## Ground rules

- **No plans, no quotas, no accounts.** Everything is free for everyone. Do not
  reintroduce auth or user data on the server.
- **Analysis stays client-side** (`frontend/src/engine/`). No content-analysis
  endpoints: it breaks the privacy promise.
- **Persistence is IndexedDB only** (`frontend/src/lib/localDb.ts`).
- **API is public**: keep it read-only (GET) and behind `app/hardening.py`
  (rate limit, security headers).
- **i18n**: every user-facing string goes in `frontend/src/i18n/locales/en/*`
  and `fr/*` (French is typed against English). Catalogue translations live in
  `backend/app/seed_data_fr.py`. Stylometry is language-aware (`engine/language.ts`,
  `aiText.ts`, `statistics.ts`).
- **Never use the em dash character** (U+2014) in code, UI copy or docs. CI fails on it.
- **Latest stable deps.** TypeScript is pinned to 5.9 only because
  `typescript-eslint` peers `<6.1`.
- Tailwind 4 keeps the JS config via `@config` in `src/index.css`; colour tokens
  are CSS variables for runtime light/dark.
- Commit messages: use `git commit -F <file>` for multi-line bodies.

## Layout

```
frontend/src/
  engine/     c2pa · aiImage · aiText · aiCode · language · assess · unicode · metadata
              · statistics · fingerprints · score · clean · index (orchestrator)
  i18n/       index (setup, detection) · locales/en/* · locales/fr/*
  services/   index (runAnalysis, history, settings, fingerprints) · catalog · dashboard
  stores/     useSettingsStore · useHistoryStore
  lib/        apiClient · localDb · analysisStatus · constants
  pages/ , pages/app/

backend/app/
  main · config · hardening · db · models · schemas · deps · seed · seed_data(_fr)
  routers/fingerprints
```

## Docs

[`README.md`](README.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
[`CONTRIBUTING.md`](CONTRIBUTING.md) ·
[`backend/README.md`](backend/README.md) · [`frontend/README.md`](frontend/README.md)
