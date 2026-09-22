# CLAUDE.md

Repo guide for AI assistants. Keep it short; link out for detail.

## What this is

`AI Inspector`: a free, open-source (MIT), **evidence-based AI-origin analyser**
for text, code and images. A **static, bilingual (EN/FR) PWA with no server**:
analysis, the detection-method catalogue, history and settings all live in the
browser. It emits one verdict (`ai_confirmed` / `ai_likely` / `ai_possible` /
`inconclusive` / `no_evidence` / `human_declared`) with a confidence basis
(`cryptographic` / `metadata` / `statistical`) and the contributing signals.
**Never present a statistical estimate as proof**: the caveats in
`engine/assess.ts` and the UI copy are load-bearing.

## Run / verify

```bash
cd frontend && npm install && npm run dev        # :5173
cd frontend && npm run typecheck && npm run lint && npm run build
```

## Ground rules

- **No server, no accounts, no plans, no quotas.** Do not add a backend or send
  content / results anywhere: it breaks the privacy promise.
- **Persistence is IndexedDB only** (`frontend/src/lib/localDb.ts`).
- **Catalogue** is embedded in `frontend/src/data/catalog.ts` (EN + `fr` block).
- **i18n**: every user-facing string goes in `frontend/src/i18n/locales/en/*`
  and `fr/*` (French is typed against English). Stylometry is language-aware
  (`engine/language.ts`, `aiText.ts`, `statistics.ts`).
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
  data/       catalog (embedded detection methods, EN + FR)
  i18n/       index (setup, detection) · locales/en/* · locales/fr/*
  services/   index (runAnalysis, history, settings, fingerprints) · catalog · dashboard
  stores/     useSettingsStore · useHistoryStore
  lib/        localDb · analysisStatus · constants
  pages/ , pages/app/
```

## Docs

[`README.md`](README.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
[`CONTRIBUTING.md`](CONTRIBUTING.md) · [`frontend/README.md`](frontend/README.md)
