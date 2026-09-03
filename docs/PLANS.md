# Plans & quotas — source of truth

This document is the canonical definition of the three access tiers. The backend
(`server/app/plans.py`) and the frontend (`src/lib/plans.ts`) each hold a copy of
this table that MUST stay in sync with what is written here.

## Tiers

| Tier        | Account?      | Paid? |
|-------------|---------------|-------|
| `anonymous` | no            | no    |
| `pro`       | yes           | yes (simulated) |
| `premium`   | yes           | yes (simulated) |

There is **no free registered tier**. Creating an account always lands the user on
`pro` or `premium` (granted immediately by the simulated billing endpoint).

## Capability matrix

| Capability                    | anonymous                | pro                     | premium                 |
|-------------------------------|--------------------------|-------------------------|-------------------------|
| Scan quota                    | 5 / fixed 48 h window    | 300 / fixed 24 h window | unlimited               |
| Unicode analysis              | ✅                       | ✅                      | ✅                      |
| Basic metadata                | ✅                       | ✅                      | ✅                      |
| Full metadata (EXIF/XMP/IPTC) | ❌                       | ✅                      | ✅                      |
| C2PA manifest inspection      | ❌                       | ✅                      | ✅                      |
| Statistical analysis          | ❌                       | ✅                      | ✅                      |
| Fingerprint matching          | ❌                       | ✅                      | ✅                      |
| Detailed / technical report   | ❌                       | ❌                      | ✅                      |
| Content types                 | text, images             | + PDF, DOCX, audio      | all                     |
| Max file size                 | 2 MB                     | 50 MB                   | 200 MB                  |
| History                       | local (IndexedDB only)   | server, unlimited       | server, unlimited       |
| Clean — Unicode (text)        | ✅ (costs 1 scan credit) | ✅                      | ✅                      |
| Clean — image metadata strip  | ✅ (costs 1 scan credit) | ✅                      | ✅                      |
| Clean — PDF/DOCX/audio/C2PA   | ❌                       | ✅                      | ✅                      |
| Clean — batch                 | ❌                       | ❌                      | ✅                      |
| Report export                 | ❌                       | JSON + PDF              | JSON + PDF              |
| Batch analysis                | ❌                       | ❌                      | ✅                      |
| API access (API key)          | ❌                       | ❌                      | ✅                      |

## Quota mechanics

- **Anonymous**: the backend issues an anonymous session token (`POST /api/auth/anon`),
  persisted client-side (localStorage + `idb`) and sent as `X-Anon-Id`. A soft
  `ip_hash`/`ua_hash` is recorded server-side as an abuse signal only.
- A **scan credit** is consumed by `POST /api/scans/consume` at the start of every
  analysis *and* every Clean operation.
- The window is **fixed**: it starts at the first consumed credit and lasts
  `ANON_WINDOW_HOURS` (default 48). When it elapses the counter resets and a new
  window opens on the next credit.
- When the quota is exhausted the endpoint returns `429` with
  `{ "detail": "...", "resets_at": "<iso8601>" }`. The frontend opens the sign-up
  modal; closing it puts the app in a "blocked until `resets_at`" state.
- **pro**: identical fixed-window mechanics, `PRO_SCAN_LIMIT` (default 300) per
  `PRO_WINDOW_HOURS` (default 24). Counted against the signed-in user id.
- **premium**: quota checks are skipped entirely (`scan_limit` is `None`).

All numbers are environment-overridable — see `server/.env.example`.
