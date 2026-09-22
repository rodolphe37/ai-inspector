from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.hardening import RateLimitMiddleware, SecurityHeadersMiddleware


def _tiny_app(limit: int) -> TestClient:
    app = FastAPI()
    app.add_middleware(SecurityHeadersMiddleware, hsts=True)
    app.add_middleware(RateLimitMiddleware, limit=limit, window=60)

    @app.get("/ping")
    def ping() -> dict:
        return {"ok": True}

    return TestClient(app)


def test_rate_limit_blocks_after_budget():
    c = _tiny_app(limit=3)
    for i in range(3):
        r = c.get("/ping")
        assert r.status_code == 200
        assert r.headers["RateLimit-Remaining"] == str(2 - i)
    blocked = c.get("/ping")
    assert blocked.status_code == 429
    assert int(blocked.headers["Retry-After"]) >= 1


def test_security_headers_and_hsts():
    r = _tiny_app(limit=100).get("/ping")
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"
    assert "default-src 'none'" in r.headers["Content-Security-Policy"]
    assert r.headers["Strict-Transport-Security"].startswith("max-age=")


def test_unsafe_methods_rejected(client):
    for method in ("post", "put", "patch", "delete"):
        assert getattr(client, method)("/api/fingerprints").status_code == 405


def test_api_sends_hardening_headers(client):
    r = client.get("/api/fingerprints")
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert "RateLimit-Limit" in r.headers
    assert r.headers["Cache-Control"].startswith("public")
    assert client.get("/api/health").headers["Cache-Control"] == "no-store"


def test_fingerprint_id_is_validated(client):
    assert client.get("/api/fingerprints/..%2F..%2Fetc").status_code in (404, 422)
    assert client.get("/api/fingerprints/" + "a" * 65).status_code == 422
    assert client.get("/api/fingerprints/UPPER").status_code == 422


def test_docs_disabled_in_production():
    from app.config import Settings

    assert Settings(environment="production").docs_enabled is False
    assert Settings(environment="development").docs_enabled is True
    assert Settings(environment="production", enable_docs=True).docs_enabled is True
