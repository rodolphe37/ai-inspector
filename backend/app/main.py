"""FastAPI application entry point.

The API only serves the public fingerprint catalogue. Content analysis,
history and settings all live in the browser: nothing about a user or their
content ever reaches this server.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from . import __version__
from .config import settings
from .db import SessionLocal, init_db
from .hardening import RateLimitMiddleware, SecurityHeadersMiddleware
from .routers import fingerprints
from .seed import seed_fingerprints

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("ai_inspector")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed_fingerprints(db)
    log.info("AI Inspector API ready (env=%s, db=%s)", settings.environment,
             "sqlite" if settings.is_sqlite else "postgres")
    yield


docs = settings.docs_enabled
app = FastAPI(
    title=settings.app_name,
    version=__version__,
    lifespan=lifespan,
    docs_url="/docs" if docs else None,
    redoc_url="/redoc" if docs else None,
    openapi_url="/openapi.json" if docs else None,
)

# Starlette runs the last-added middleware first: CORS answers pre-flights,
# then the rate limiter, then headers / method filter, then host check.
if settings.allowed_host_list:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_host_list)
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(SecurityHeadersMiddleware, hsts=settings.is_production)
app.add_middleware(RateLimitMiddleware, limit=settings.rate_limit_per_minute)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
    max_age=86400,
)

app.include_router(fingerprints.router, prefix="/api")


@app.get("/api/health", tags=["meta"])
def health(response: Response) -> dict:
    response.headers["Cache-Control"] = "no-store"
    return {"status": "ok", "version": __version__}
