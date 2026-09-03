"""FastAPI application entry point."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from . import __version__
from .config import settings
from .db import SessionLocal, init_db
from .plans import describe_all
from .routers import (
    analyses,
    auth,
    billing,
    dashboard,
    fingerprints,
    oauth_routes,
    scans,
    settings_routes,
    users,
)
from .seed import seed_fingerprints

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("provenance")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed_fingerprints(db)
    log.info("Provenance Inspector API ready (env=%s, db=%s)", settings.environment,
             "sqlite" if settings.is_sqlite else "postgres")
    yield


app = FastAPI(
    title=settings.app_name,
    version=__version__,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Quota-Remaining"],
)
app.add_middleware(SessionMiddleware, secret_key=settings.session_secret, same_site="lax")

api = app  # alias

for router in (
    auth.router,
    oauth_routes.router,
    users.router,
    settings_routes.router,
    scans.router,
    analyses.router,
    dashboard.router,
    fingerprints.router,
    billing.router,
):
    app.include_router(router, prefix="/api")


@app.get("/api/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "version": __version__}


@app.get("/api/meta/plans", tags=["meta"])
def plans() -> dict:
    return {"plans": describe_all()}
