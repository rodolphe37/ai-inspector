# Security Policy

## Supported versions

Only the latest release on `main` receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue**. Use a private
[GitHub security advisory](https://github.com/rodolphe37/ai-inspector/security/advisories/new)
with a description, reproduction steps and the impact you observed.

You should receive an acknowledgement within 72 hours. Once a fix is released,
you will be credited in the release notes unless you prefer to stay anonymous.

## Security model

- **No application server.** AI Inspector is a static site: there is no API,
  no database and no account system to attack or to leak.
- **Content never leaves the browser.** Analysis, the catalogue of detection
  methods, history and settings all run or live on the user's device
  (IndexedDB), and can be wiped from Settings.
- **Hosting headers** (`netlify.toml`): `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Supply chain:** dependencies are pinned in `package-lock.json`, monitored by
  Dependabot, and CI runs the type checker, linter and build on every pull request.

Relevant reports include, for example: a way to make the app send content or
results off the device, script injection through analysed files or metadata, or
a malicious file that crashes or hijacks the analysis engine.
