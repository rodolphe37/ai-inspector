# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.3.3] - 2026-09-22

### Changed
- Every description (README, architecture guide, page meta, PWA manifest,
  landing, About and Analyze pages) now lists all supported formats: text,
  code, images, PDF and Word documents, audio and video.

## [1.3.2] - 2026-09-22

### Fixed
- After a deploy, the first visit could still show the previous version (kept
  by the service worker) until the next reload. The page now reloads itself
  once the new version is installed.

## [1.3.1] - 2026-09-22

### Changed
- Clean page: the key under the preview now lists every character found, with
  its marker, its name, its code point and how many times it occurs, instead
  of asking to hover a marker (which does not exist on touch screens).
- Clearer description of the trailing-whitespace option.

## [1.3.0] - 2026-09-22

### Added
- Analysis and cleaning for every listed format: text, code, images (JPEG,
  PNG, WebP, GIF, HEIC, AVIF), PDF, DOCX, audio (MP3, WAV, FLAC, M4A, OGG
  analysis only) and video (MP4, MOV, AVI). The real format is sniffed from
  the bytes, not taken from the extension.
- Lossless metadata stripping: no re-encoding for JPEG, PNG, WebP, WAV, MP3,
  FLAC, MP4 / MOV / M4A and AVI (offsets stay valid); PDF properties, XMP and
  embedded files removed; DOCX properties blanked. Text and code files can be
  cleaned too.
- PDF and DOCX text goes through the text analyses (stylometry, Unicode,
  statistics).
- Generator signatures, each read from the field its tool writes: Stable
  Diffusion web UIs, ComfyUI, InvokeAI, NovelAI, Midjourney, Google AI credit,
  and audio, video and document tools (Suno, Udio, ElevenLabs, Sora, Runway,
  Veo, Pika, Kling, ChatGPT…).
- Content Credentials from more providers: Microsoft, Google, Samsung, plus
  camera capture credentials.
- Cleaning history: every cleaning run is listed in its own History tab with a
  badge, what was removed and the sizes. The content is never stored.
- Supported formats section on the landing page and in the README.
- Clean page: same input as Analyze (language selector, counters, paste and
  clear, drag and drop with format chips); Markdown hard line breaks and blank
  lines in code are kept; the download uses the language's extension.
- Live view of invisible characters and homoglyphs before cleaning, and a copy
  button for the cleaned text.

### Fixed
- Text cleaning left some invisible characters and homoglyphs in place.
- Settings: toggles that did nothing were removed, the remaining ones now
  change the results page, and switches are announced by screen readers.
- Legitimate French typography (narrow no-break spaces), emoji sequences and
  Cyrillic or Greek text are no longer flagged.

## [1.2.0] - 2026-09-22

### Added
- Durable Content Credentials detection: the C2PA reader now recognises a
  `c2pa.soft-binding` assertion (invisible watermark or perceptual fingerprint
  that lets stripped credentials be recovered), reported as a known
  fingerprint.

### Removed
- The deprecated "LSB steganography" catalogue entry, replaced by Durable
  Content Credentials (it was already ignored by the analysis).

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

[1.3.3]: https://github.com/rodolphe37/ai-inspector/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/rodolphe37/ai-inspector/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/rodolphe37/ai-inspector/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/rodolphe37/ai-inspector/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/rodolphe37/ai-inspector/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/rodolphe37/ai-inspector/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/rodolphe37/ai-inspector/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/rodolphe37/ai-inspector/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rodolphe37/ai-inspector/releases/tag/v1.0.0
