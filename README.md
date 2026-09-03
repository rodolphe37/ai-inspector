# IA Inspector

An **evidence-based AI-origin analyser** for text, code and images. It produces a
single verdict — *AI-generated / likely / possible / no evidence* — from:

- **C2PA Content Credentials** — full manifest parsing + signature validation
  (the `c2pa` WASM library). A valid manifest declaring AI generation is
  near-certain proof.
- **Generator metadata** — EXIF/XMP/PNG signatures (Stable Diffusion, Midjourney,
  Firefly…), IPTC `DigitalSourceType`.
- **Forensic image analysis** — frequency-domain up-sampling artifacts, sensor-
  noise residual, generator-native dimensions.
- **Text stylometry** — burstiness, register, LLM-favoured vocabulary.
- **Code stylometry** — comment density/uniformity, tutorial comments, docstring
  coverage, assistant leftovers, generic identifiers. Also flags **"Trojan
  Source"** Unicode tampering (bidi overrides / homoglyphs in source).

Every verdict states its **confidence basis** (cryptographic / metadata /
forensic estimate) and lists the signals behind it. Statistical estimates are
labelled as such — they have a real false-positive rate on edited, translated or
non-native content, and an absence of signal is never proof of human origin.

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

**Trying Pro / Premium:** anonymous use needs no account. `cd backend && make
seed-demo` creates local test accounts —
`pro@demo.ia-inspector.app` / `demo-pro-pass` and
`premium@demo.ia-inspector.app` / `demo-premium-pass`. Or register
normally (→ Pro) and upgrade from Settings (billing is simulated). Details in
[`backend/README.md`](backend/README.md#test-accounts-local-dev).

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
