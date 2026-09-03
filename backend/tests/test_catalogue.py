from __future__ import annotations


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


def test_plans_meta(client):
    plans = client.get("/api/meta/plans").json()["plans"]
    by_tier = {p["tier"]: p for p in plans}
    assert set(by_tier) == {"anonymous", "pro", "premium"}
    assert by_tier["anonymous"]["features"]["c2pa"] is False
    assert by_tier["pro"]["features"]["c2pa"] is True
    assert by_tier["premium"]["scanLimit"] is None
    assert by_tier["anonymous"]["requiresAccount"] is False
    assert by_tier["pro"]["requiresAccount"] is True


def test_settings_roundtrip(client, account):
    auth = account["auth"]
    base = client.get("/api/settings", headers=auth).json()
    assert base["account"]["plan"] == "pro"
    assert base["appearance"]["theme"] == "dark"

    client.put(
        "/api/settings",
        headers=auth,
        json={"privacy": {"localProcessing": False, "storeHistory": True,
                          "telemetry": True, "showDemoLabels": False}},
    )
    after = client.get("/api/settings", headers=auth).json()
    assert after["privacy"]["telemetry"] is True
    assert after["appearance"]["theme"] == "dark"  # untouched section preserved


def test_oauth_providers_endpoint(client):
    body = client.get("/api/auth/oauth/providers").json()
    assert "providers" in body
    # none configured in tests
    assert body["providers"] == []
    assert client.get("/api/auth/oauth/google/login").status_code == 404
