from __future__ import annotations


def test_register_login_refresh_flow(client):
    email = "flow@test.dev"
    reg = client.post(
        "/api/auth/register",
        json={"email": email, "name": "Flow", "password": "password123", "plan": "premium"},
    )
    assert reg.status_code == 201
    body = reg.json()
    assert body["user"]["plan"] == "premium"
    assert body["tokenType"] == "bearer"

    dup = client.post(
        "/api/auth/register",
        json={"email": email, "name": "Flow", "password": "password123"},
    )
    assert dup.status_code == 409

    ok = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    assert ok.status_code == 200
    bad = client.post("/api/auth/login", json={"email": email, "password": "WRONG"})
    assert bad.status_code == 401

    refreshed = client.post(
        "/api/auth/refresh", json={"refreshToken": body["refreshToken"]}
    )
    assert refreshed.status_code == 200
    # refresh tokens rotate / are single use
    assert client.post(
        "/api/auth/refresh", json={"refreshToken": body["refreshToken"]}
    ).status_code == 401


def test_me_requires_bearer(client, account):
    assert client.get("/api/auth/me").status_code == 401
    me = client.get("/api/auth/me", headers=account["auth"])
    assert me.status_code == 200
    assert me.json()["email"] == account["email"]


def test_password_min_length(client):
    r = client.post(
        "/api/auth/register",
        json={"email": "short@test.dev", "name": "S", "password": "short"},
    )
    assert r.status_code == 422


def test_magic_link_single_use(client):
    req = client.post("/api/auth/magic/request", json={"email": "m@test.dev", "plan": "pro"})
    assert req.json()["sent"] is True
    token = req.json()["debugUrl"].split("token=")[1]
    assert client.post("/api/auth/magic/consume", json={"token": token}).status_code == 200
    assert client.post("/api/auth/magic/consume", json={"token": token}).status_code == 400


def test_anon_session_issue_and_reuse(client):
    a1 = client.post("/api/auth/anon").json()["anonId"]
    a2 = client.post("/api/auth/anon", headers={"X-Anon-Id": a1}).json()["anonId"]
    assert a1 == a2
