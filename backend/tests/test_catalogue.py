from __future__ import annotations

import pytest


def test_health(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_fingerprint_catalogue_is_seeded(client):
    rows = client.get("/api/fingerprints").json()
    assert len(rows) >= 10
    ids = {r["id"] for r in rows}
    assert "c2pa-content-credentials" in ids
    assert "synthid-text" in ids

    one = client.get("/api/fingerprints/synthid-text")
    assert one.status_code == 200
    assert one.json()["provider"] == "Google DeepMind"
    assert client.get("/api/fingerprints/does-not-exist").status_code == 404


def test_catalogue_in_french_with_english_fallback(client):
    fr = {r["id"]: r for r in client.get("/api/fingerprints?lang=fr").json()}
    en = {r["id"]: r for r in client.get("/api/fingerprints").json()}
    assert fr["homoglyph-substitution"]["name"] == "Substitution d'homoglyphes"
    assert en["homoglyph-substitution"]["name"] == "Homoglyph substitution"
    # untranslated fields (provider, ids, numbers) are identical
    assert fr["synthid-text"]["provider"] == en["synthid-text"]["provider"]
    one = client.get("/api/fingerprints/synthid-text?lang=fr").json()
    assert "filigrane" in one["description"].lower()
    assert client.get("/api/fingerprints?lang=de").status_code == 422


def test_every_entry_has_a_french_translation():
    from app.seed_data import FINGERPRINTS
    from app.seed_data_fr import FINGERPRINTS_FR

    assert {f["id"] for f in FINGERPRINTS} == set(FINGERPRINTS_FR)


def test_seed_is_idempotent(client):
    from app.db import SessionLocal
    from app.seed import seed_fingerprints

    before = len(client.get("/api/fingerprints").json())
    with SessionLocal() as db:
        assert seed_fingerprints(db) == 0
    assert len(client.get("/api/fingerprints").json()) == before


@pytest.mark.parametrize(
    "path",
    [
        "/api/auth/me",
        "/api/auth/register",
        "/api/scans/quota",
        "/api/billing/plans",
        "/api/meta/plans",
        "/api/analyses",
        "/api/settings",
        "/api/dashboard",
    ],
)
def test_no_accounts_quotas_or_user_data(client, path):
    # Open-source build: free access, no accounts, nothing user-related server-side.
    assert client.get(path).status_code == 404


def test_cors_allows_configured_origin(client):
    res = client.get("/api/fingerprints", headers={"Origin": "http://localhost:5173"})
    assert res.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_database_url_is_normalised_for_psycopg():
    from app.config import Settings

    neon = "postgresql://u:p@ep-x-pooler.eu-central-1.aws.neon.tech/db?sslmode=require"
    assert Settings(database_url=neon).database_url.startswith("postgresql+psycopg://u:p@ep-x")
    assert Settings(database_url="postgres://u:p@h/db").database_url == (
        "postgresql+psycopg://u:p@h/db"
    )
    assert Settings(database_url="sqlite:///./x.db").database_url == "sqlite:///./x.db"
