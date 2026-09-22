# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.1.2] - 2026-09-22

### Fixed
- Horizontal overflow on phones: 18 responsive grids had no base column
  count, so a long line could widen the page (landing demo, results, cards).
  Checked on every route at 320 px wide.
- Results: header shows "Result" instead of "Overview"; action buttons laid
  out as a full-width primary action plus two equal buttons; fingerprint rows
  stack name and provider; statistics header and reference chip wrap cleanly;
  timeline icons stay round instead of stretching into capsules.
- Status badges never wrap onto two lines.
- History: filters in a 2 x 2 grid and one card per analysis on phones (no
  sideways scrolling); the full table is kept from tablet width.
- Fingerprint detail: header shows the section name; property labels no
  longer touch their values.
- Search fields are full width on phones.
- Landing: equal-width hero buttons on phones, "LLM" keeps its capitals in
  the demo, lighter subtitle size on small screens.
- Step numbers on "How it works" and "Features" are visible again.

### Added
- The app honours the system "reduce motion" setting.

## [1.1.1] - 2026-09-22

### Fixed
- Mobile header: only the current page is shown (single line, truncated if
  needed); the full breadcrumb comes back from tablet width.
- Mobile bottom bar: five equal columns with short single-line labels, nothing
  overflows down to 320 px wide screens.
- Safe areas on notched phones in installed (standalone) mode: header and
  bottom bar no longer sit under the status bar or home indicator.
- Dashboard activity card header stacks on small screens.

## [1.1.0] - 2026-09-22

### Added
- Docker image (`frontend/Dockerfile`): Node 22 build, unprivileged nginx
  serving the site in a read-only container (SPA fallback, cache and security
  headers).
- Docker Compose setup for a Traefik reverse proxy (`deploy/`) and a GitHub
  Actions workflow that publishes the image to GHCR and redeploys the VPS on
  every push to `main`.

### Changed
- Docker is the supported deployment; the site now runs at
  https://ai-inspector.rodolphe-augusto.fr.
- The deployment only prunes AI Inspector images on the server.

### Removed
- Netlify configuration (`netlify.toml`).

## [1.0.0] - 2026-09-22

First open-source release.

### Added
- English / French interface (i18next), with browser language detection, a
  switcher in the header and in Settings, and localized page title and meta.
- French text analysis: automatic language detection of the analysed text,
  French LLM-favoured lexicon and register markers, French reference letter
  frequencies for the χ² test (diacritics folded).
- Bilingual catalogue of detection methods, embedded in the app.
- App version shown in the footer and the app sidebar.
- Open-source documentation: README (EN/FR), contributing guide, code of
  conduct, security policy, architecture guide, CI and Dependabot.

### Removed
- Paid plans, quotas, billing and every usage limit: all features are free for everyone.
- User accounts (password, OAuth, magic links), server-side history, settings
  and dashboard. Everything user-related now lives in the browser.
- The backend (FastAPI, database): the app is now a static site with no server.
  The catalogue it used to serve is embedded in the frontend.
- The 30-analysis cap on local history.

### Changed
- Renamed the project from "IA Inspector" to **AI Inspector** (English product name).
- The em dash character is banned from code, UI copy and docs (checked in CI).

[1.1.2]: https://github.com/rodolphe37/ai-inspector/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/rodolphe37/ai-inspector/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/rodolphe37/ai-inspector/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rodolphe37/ai-inspector/releases/tag/v1.0.0
