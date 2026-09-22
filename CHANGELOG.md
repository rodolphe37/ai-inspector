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
- Bilingual fingerprint catalogue (`GET /api/fingerprints?lang=fr`).
- App version shown in the footer and the app sidebar.
- API hardening: per-IP rate limiting, strict security headers, safe methods
  only, path validation, docs disabled in production, optional Host allow-list.
- Deployment configuration for Netlify (`netlify.toml`), Render (`render.yaml`)
  and Neon (plain `postgres://` URLs accepted).
- Open-source documentation: README (EN/FR), contributing guide, code of
  conduct, security policy, architecture guide, CI and Dependabot.

### Removed
- Paid plans, quotas, billing and every usage limit: all features are free for everyone.
- User accounts (password, OAuth, magic links), server-side history, settings
  and dashboard. Everything user-related now lives in the browser.
- The 30-analysis cap on local history.

### Changed
- Renamed the project from "IA Inspector" to **AI Inspector** (English product name).
- The API now only serves the public, read-only fingerprint catalogue.
- The em dash character is banned from code, UI copy and docs (checked in CI).
