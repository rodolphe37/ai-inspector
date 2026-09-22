# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

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
- Netlify configuration (`netlify.toml`): SPA fallback, cache and security headers.
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
