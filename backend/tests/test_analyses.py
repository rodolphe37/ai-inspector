from __future__ import annotations


def _make(client, auth, **over):
    payload = {
        "name": "sample.txt",
        "type": "text",
        "status": "clean",
        "score": 4,
        "signalLevel": "clean",
        "result": {"summary": "nothing found"},
    }
    payload.update(over)
    return client.post("/api/analyses", headers=auth, json=payload)


def test_analysis_crud_and_isolation(client, account):
    auth = account["auth"]
    created = _make(client, auth, name="a.txt")
    assert created.status_code == 201
    aid = created.json()["id"]

    listing = client.get("/api/analyses", headers=auth).json()
    assert [x["id"] for x in listing] == [aid]

    got = client.get(f"/api/analyses/{aid}", headers=auth)
    assert got.json()["result"]["summary"] == "nothing found"

    # another account cannot see it
    other = client.post(
        "/api/auth/register",
        json={"email": "other@test.dev", "name": "O", "password": "password123"},
    ).json()
    other_auth = {"Authorization": f"Bearer {other['accessToken']}"}
    assert client.get(f"/api/analyses/{aid}", headers=other_auth).status_code == 404

    assert client.delete(f"/api/analyses/{aid}", headers=auth).status_code == 204
    assert client.get(f"/api/analyses/{aid}", headers=auth).status_code == 404


def test_analyses_require_auth(client):
    assert client.get("/api/analyses").status_code == 401
    assert _make(client, {}).status_code == 401


def test_dashboard_aggregates_real_analyses(client, account):
    auth = account["auth"]
    _make(client, auth, status="clean")
    _make(client, auth, status="signal_detected", score=90, signalLevel="high")
    _make(client, auth, status="c2pa_found", score=80)

    dash = client.get("/api/dashboard", headers=auth).json()
    assert dash["stats"]["analyses"] == 3
    assert dash["stats"]["signalsDetected"] == 2
    assert dash["stats"]["cleanFiles"] == 1
    assert dash["stats"]["knownFingerprints"] >= 10
    assert len(dash["activity"]) == 30
    assert sum(p["analyses"] for p in dash["activity"]) == 3
    assert len(dash["recent"]) == 3
