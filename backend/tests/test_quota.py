from __future__ import annotations


def test_anonymous_quota_exhausts_and_blocks(client):
    anon = client.post("/api/auth/anon").json()["anonId"]
    h = {"X-Anon-Id": anon}

    q = client.get("/api/scans/quota", headers=h).json()
    assert q["tier"] == "anonymous"
    assert q["limit"] == 3  # ANON_SCAN_LIMIT overridden in conftest

    for i in range(3):
        r = client.post("/api/scans/consume", headers=h, json={"kind": "analysis"})
        assert r.status_code == 200, r.text
        assert r.json()["remaining"] == 2 - i

    blocked = client.post("/api/scans/consume", headers=h, json={"kind": "analysis"})
    assert blocked.status_code == 429
    detail = blocked.json()["detail"]
    assert detail["resets_at"] is not None
    assert detail["quota"]["remaining"] == 0


def test_clean_shares_the_same_budget(client):
    anon = client.post("/api/auth/anon").json()["anonId"]
    h = {"X-Anon-Id": anon}
    client.post("/api/scans/consume", headers=h, json={"kind": "clean"})
    client.post("/api/scans/consume", headers=h, json={"kind": "analysis"})
    q = client.get("/api/scans/quota", headers=h).json()
    assert q["used"] == 2 and q["remaining"] == 1


def test_pro_quota_is_higher(client, account):
    q = client.get("/api/scans/quota", headers=account["auth"]).json()
    assert q["tier"] == "pro"
    assert q["limit"] == 10  # PRO_SCAN_LIMIT overridden in conftest


def test_premium_is_unlimited(client, account):
    up = client.post("/api/billing/upgrade", headers=account["auth"], json={"plan": "premium"})
    assert up.status_code == 200
    new_auth = {"Authorization": f"Bearer {up.json()['accessToken']}"}
    q = client.get("/api/scans/quota", headers=new_auth).json()
    assert q["unlimited"] is True
    assert q["remaining"] is None
    for _ in range(15):
        assert client.post(
            "/api/scans/consume", headers=new_auth, json={"kind": "analysis"}
        ).status_code == 200
