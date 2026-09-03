# Architecture

## Principle: analysis is local, the account is remote

The product promise is *local-first*. Every provenance check — Unicode, metadata,
C2PA, statistics, fingerprint matching — runs in the browser in `frontend/src/engine`.
The FastAPI service never receives the content being inspected. It exists for:

- **Identity** — email/password + OAuth + magic links
- **Quota** — anonymous and pro scan limits, enforced server-side so they can't
  be bypassed by clearing local state alone
- **Persistence** — synced analysis history and settings for pro/premium
- **Reference data** — the fingerprint catalogue
- **Billing** — a simulated `upgrade` endpoint (Stripe-ready)

```
┌───────────────────────── Browser (SPA) ─────────────────────────┐
│                                                                 │
│  Pages ── stores (auth · quota · settings · history) ── services│
│                                          │                      │
│                                   ┌──────┴───────┐              │
│                                   ▼              ▼              │
│                           src/engine        lib/apiClient       │
│                    (Unicode, metadata,      (bearer + X-Anon-Id,│
│                     C2PA, statistics,        silent refresh)    │
│                     fingerprints, score)         │              │
│                                   │              │              │
│                          ┌────────┴───┐          │              │
│                          ▼            ▼          │              │
│                    IndexedDB     (anon: local)   │              │
│                    (idb)                         │              │
└─────────────────────────────────────────────────┼──────────────┘
                                                  │ VITE_API_URL
                              ┌───────────────────┴───────────────────┐
                              │            FastAPI (backend)          │
                              │  routers: auth · oauth · users ·      │
                              │  settings · scans · analyses ·        │
                              │  dashboard · fingerprints · billing   │
                              │            │              │           │
                              │      SQLAlchemy 2     Authlib         │
                              │            │                          │
                              │     SQLite (dev) / PostgreSQL (prod)  │
                              └──────────────────────────────────────┘
```

## Request flow: running an analysis

1. `Analyze.tsx` calls `runAnalysis(input)` (`src/services/index.ts`).
2. `assertContentAllowed` checks file size / type against `planFor(tier)`.
3. `useQuotaStore.consume('analysis')` → `POST /api/scans/consume`.
   - `200` → proceed. `429` → `QuotaError`; the store records `blockedUntil`
     and opens `SignUpModal`; `runAnalysis` throws `QuotaBlockedError` which the
     page swallows.
4. The engine runs the modules the tier allows (`can(tier, feature)`):
   - `c2pa.ts` — the official `c2pa` WASM library: parse the manifest store,
     validate the signature chain, read generative-AI assertions. Lazy-loaded.
   - `aiImage.ts` — 2D FFT radial power spectrum (up-sampling peaks), noise
     residual (missing/flat sensor noise), generator-native dimensions.
   - `aiText.ts` — prose stylometry: burstiness, register, LLM-favoured vocabulary.
   - `aiCode.ts` — code stylometry: comment density/uniformity, tutorial comments,
     docstring coverage, assistant scaffolding leftovers, generic identifiers.
     For `type === 'code'` the English letter-frequency test is skipped and the
     summary leads with a "Trojan Source" warning when the Unicode module found
     bidi overrides or homoglyphs in the source.
   - `assess.ts` — combines all of the above into one `AiAssessment`
     (`verdict`, `probability`, `confidence` basis, `signals[]`, `caveat`).
   Then builds the `AnalysisResult` (AI assessment, score, signal level, timeline).
   The confidence ladder is **cryptographic** (valid C2PA) > **metadata**
   (generator tags / IPTC / watermark) > **statistical** (forensic estimate).
5. Persist: signed-in + `server_history` → `POST /api/analyses`; otherwise
   `saveLocalAnalysis` (IndexedDB, capped at 30).
6. Navigate to `/app/results/:id`. `Results.tsx` reads it back via
   `analysisApi.getAnalysis` (server or local).

## Auth flow

- **Password**: `POST /auth/register|login` → `{ accessToken, refreshToken, user }`.
  Access token (JWT, 30 min) kept in memory + `localStorage`; refresh token
  (opaque, rotating, 30 days) in `localStorage`.
- **Silent refresh**: any `401` triggers one `POST /auth/refresh`; on success the
  original request retries, on failure tokens are cleared and an `onAuthEvent`
  fires.
- **OAuth**: `GET /auth/oauth/{provider}/login?plan=` → provider →
  `GET /auth/oauth/{provider}/callback` → SPA `/auth/callback?code=` →
  `POST /auth/oauth/exchange` → token pair. Only providers with configured
  credentials are offered.
- **Magic link**: `POST /auth/magic/request` emails (or, without SMTP, logs) a
  link to `/auth/magic?token=` → `POST /auth/magic/consume`.
- **Anonymous**: `POST /auth/anon` issues an id stored in `localStorage` and sent
  as `X-Anon-Id`; the server records soft `ip_hash`/`ua_hash` as abuse signals.

## Quota mechanics

Fixed window per owner (`anon:<id>` or `user:<id>`), tracked in `quota_windows`.
First `consume` opens a window; when `window_hours` elapse the counter resets on
the next `consume`. `premium` skips the check (`scan_limit is None`). Clean
operations consume from the same budget (`kind: "clean"`). See
[`PLANS.md`](PLANS.md).

## Keeping the plan matrix in sync

`docs/PLANS.md` is authoritative. `backend/app/plans.py` and
`frontend/src/lib/plans.ts` are hand-kept mirrors; the frontend also refreshes
from `GET /api/meta/plans` at runtime (`setPlanMatrix`). If you change a limit,
change all three.

## Databases

- **SQLite** (default): `init_db()` runs `create_all()` on startup; `make seed`
  loads the catalogue. Good for dev and the test suite (isolated temp file).
- **PostgreSQL**: driven by Alembic (`alembic/versions/`). `render_as_batch` is
  on so the same migrations apply to SQLite too.

## Tests

- `backend/tests` — pytest against an isolated SQLite file, no network. Covers
  auth + refresh rotation, magic links, anon sessions, the quota lifecycle,
  analysis CRUD + tenant isolation, dashboard aggregation, the catalogue and the
  plan matrix.
- `backend/scripts/smoke.py` — end-to-end HTTP check against a running server.
- Frontend correctness is currently covered by `typecheck` + `lint` + `build`
  and manual verification; the engine modules are pure functions and unit-test
  friendly if a runner is added later.
