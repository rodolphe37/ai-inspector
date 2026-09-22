"""Protections for a public, unauthenticated, read-only API.

- ``RateLimitMiddleware``: fixed-window request budget per client IP. In-memory
  on purpose: the API runs as a single instance and needs no Redis. Behind a
  proxy (Render), uvicorn's ``--proxy-headers`` puts the real client address in
  ``request.client.host``.
- ``SecurityHeadersMiddleware``: strict headers for JSON-only responses.
- Only safe methods are served: anything else is rejected with 405.
"""

from __future__ import annotations

import time
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS"})

# JSON API: forbid everything a browser could do with a response.
_BASE_HEADERS = {
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

# Interactive docs need scripts/styles from their CDN; relax CSP only there.
_DOCS_PATHS = ("/docs", "/redoc", "/openapi.json")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, hsts: bool) -> None:
        super().__init__(app)
        self.hsts = hsts

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        if request.method not in SAFE_METHODS:
            return JSONResponse({"detail": "Method not allowed."}, status_code=405)
        response = await call_next(request)
        for name, value in _BASE_HEADERS.items():
            if name == "Content-Security-Policy" and request.url.path.startswith(_DOCS_PATHS):
                continue
            response.headers.setdefault(name, value)
        if self.hsts:
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
            )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Allow ``limit`` requests per ``window`` seconds per client IP."""

    def __init__(self, app, *, limit: int, window: int = 60, max_clients: int = 50_000) -> None:
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.max_clients = max_clients
        self._hits: dict[str, tuple[float, int]] = {}

    def _client(self, request: Request) -> str:
        return request.client.host if request.client else "unknown"

    def _prune(self, now: float) -> None:
        expired = [ip for ip, (start, _) in self._hits.items() if now - start >= self.window]
        for ip in expired:
            del self._hits[ip]
        # Hard cap so a flood of spoofed addresses cannot exhaust memory.
        if len(self._hits) > self.max_clients:
            self._hits.clear()

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        if self.limit <= 0 or request.url.path == "/api/health":
            return await call_next(request)

        now = time.monotonic()
        if len(self._hits) > self.max_clients // 2:
            self._prune(now)

        ip = self._client(request)
        start, count = self._hits.get(ip, (now, 0))
        if now - start >= self.window:
            start, count = now, 0
        count += 1
        self._hits[ip] = (start, count)

        remaining = max(0, self.limit - count)
        reset = max(1, int(self.window - (now - start)))
        if count > self.limit:
            return JSONResponse(
                {"detail": "Too many requests. Please slow down."},
                status_code=429,
                headers={"Retry-After": str(reset), "RateLimit-Limit": str(self.limit),
                         "RateLimit-Remaining": "0", "RateLimit-Reset": str(reset)},
            )
        response = await call_next(request)
        response.headers["RateLimit-Limit"] = str(self.limit)
        response.headers["RateLimit-Remaining"] = str(remaining)
        response.headers["RateLimit-Reset"] = str(reset)
        return response
