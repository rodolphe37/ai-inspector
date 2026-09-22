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

- **Content never leaves the browser.** All analysis runs client-side; the API
  has no endpoint that accepts user content.
- **No accounts, no user data server-side.** History and settings are stored in
  the browser (IndexedDB).
- **The API is public and read-only.** It only serves the fingerprint catalogue
  and is hardened accordingly:
  - only `GET`, `HEAD` and `OPTIONS` are accepted (anything else returns `405`);
  - per-IP rate limiting (`RATE_LIMIT_PER_MINUTE`, `429` with `Retry-After`);
  - strict response headers (CSP `default-src 'none'`, `nosniff`, `DENY` framing,
    HSTS in production, no `Server` header);
  - CORS restricted to the configured web-app origins;
  - path parameters validated, interactive docs disabled in production;
  - optional `Host` allow-list (`ALLOWED_HOSTS`).
- Dependencies are pinned and monitored by Dependabot; CI runs tests and linters
  on every pull request.
