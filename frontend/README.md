# IA Inspector — Web app

React SPA that answers **"was this made by AI?"** with a verdict + its evidence:
C2PA Content Credentials, generator metadata, forensic image analysis and text
stylometry.

All analysis runs **in the browser** (`src/engine`) — including full C2PA
signature validation (WASM) and the FFT-based image forensics. The
[API](../backend) is only used for accounts, scan quotas and (for signed-in
users) synced history.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 7 ·
Zustand · Framer Motion · Recharts · `idb` · `exifr`

## Develop

```bash
npm install
cp .env.example .env          # VITE_API_URL, defaults to http://localhost:8000/api
npm run dev                   # http://localhost:5173
```

Run the [API](../backend) alongside it (`cd ../backend && make dev`).

To try the Pro / Premium UI, create local test accounts with
`cd ../backend && make seed-demo` (`pro@demo.ia-inspector.app` /
`demo-pro-pass`, `premium@demo.ia-inspector.app` / `demo-premium-pass`),
or register and upgrade from Settings (billing is simulated).

```bash
npm run typecheck             # tsc --noEmit
npm run lint                  # eslint
npm run build                 # production build (+ PWA)
```

## How it fits together

```
 Browser (SPA)
 ├── src/engine/            analysis — c2pa (WASM signature validation),
 │                          metadata (exifr), aiImage (FFT + noise forensics),
 │                          aiText (stylometry), assess (AI-origin verdict),
 │                          unicode, statistics, fingerprints, score
 ├── src/services/          HTTP when signed in · IndexedDB when anonymous
 │     └── runAnalysis()    enforce plan limits → consume quota → analyse → persist
 ├── src/stores/            auth · quota · settings · history (Zustand)
 └── src/lib/
       ├── apiClient.ts     bearer + X-Anon-Id, silent token refresh, typed errors
       └── plans.ts         capability matrix — mirror of backend/app/plans.py
                            │
                            ▼  VITE_API_URL
                     ../backend (FastAPI)
```

## Plans

Three tiers — `anonymous` (no account), `pro`, `premium` — defined in
[`../docs/PLANS.md`](../docs/PLANS.md) and enforced both client-side (instant UI
gating via `src/lib/plans.ts`) and server-side (quota + capability checks).

Anonymous users get 5 scans / 48 h, Unicode + basic metadata, and local-only
history (IndexedDB). Hitting the quota opens the sign-up modal; closing it
blocks further scans until the window resets.

## Routes

Public: `/`, `/features`, `/how-it-works`, `/security`, `/pricing`, `/about`,
`/login`, `/signup`, `/auth/callback` (OAuth / magic link).

App (`/app`, no login required — anonymous tier works): `/app`, `/app/analyze`,
`/app/results/:id`, `/app/history`, `/app/fingerprints`, `/app/fingerprints/:id`,
`/app/clean`, `/app/settings`. Pro/Premium-only capabilities render an inline
upgrade prompt.
