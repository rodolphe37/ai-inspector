"""Ad-hoc end-to-end smoke test against a running API (default :8000)."""

from __future__ import annotations

import os
import sys

import httpx

BASE = os.environ.get("API", "http://localhost:8000") + "/api"


def check(label: str, cond: bool, extra: str = "") -> None:
    mark = "OK  " if cond else "FAIL"
    print(f"[{mark}] {label} {extra}")
    if not cond:
        sys.exit(1)


def main() -> None:
    c = httpx.Client(base_url=BASE, timeout=15)

    check("health", c.get("/health").json()["status"] == "ok")

    fps = c.get("/fingerprints").json()
    check("fingerprint catalogue", len(fps) >= 10, f"({len(fps)})")
    check("fingerprint detail", c.get(f"/fingerprints/{fps[0]['id']}").status_code == 200)

    check("oauth providers list", "providers" in c.get("/auth/oauth/providers").json())

    plans = c.get("/meta/plans").json()["plans"]
    check("plans meta", {p["tier"] for p in plans} == {"anonymous", "pro", "premium"})

    # --- anonymous quota -------------------------------------------------
    anon = c.post("/auth/anon").json()["anonId"]
    h = {"X-Anon-Id": anon}
    q = c.get("/scans/quota", headers=h).json()
    check("anon quota shape", q["tier"] == "anonymous" and q["limit"] == 5, str(q))

    last = None
    for i in range(5):
        r = c.post("/scans/consume", headers=h, json={"kind": "analysis"})
        check(f"anon consume #{i + 1}", r.status_code == 200, str(r.json()))
        last = r.json()
    check("anon remaining hits 0", last["remaining"] == 0)
    blocked = c.post("/scans/consume", headers=h, json={"kind": "analysis"})
    check("anon 6th consume -> 429", blocked.status_code == 429)
    check("429 carries resets_at", blocked.json()["detail"]["resets_at"] is not None)

    # --- account lifecycle --------------------------------------------
    email = f"smoke_{os.getpid()}@test.dev"
    reg = c.post(
        "/auth/register",
        json={"email": email, "name": "Smoke", "password": "password123", "plan": "pro"},
    )
    check("register", reg.status_code == 201, str(reg.status_code))
    tok = reg.json()
    auth = {"Authorization": f"Bearer {tok['accessToken']}"}

    check("register is idempotent-guarded",
          c.post("/auth/register", json={"email": email, "name": "x", "password": "password123"}).status_code == 409)

    check("login", c.post("/auth/login", json={"email": email, "password": "password123"}).status_code == 200)
    check("login rejects bad password",
          c.post("/auth/login", json={"email": email, "password": "nope"}).status_code == 401)

    ref = c.post("/auth/refresh", json={"refreshToken": tok["refreshToken"]})
    check("refresh", ref.status_code == 200)
    check("old refresh token revoked",
          c.post("/auth/refresh", json={"refreshToken": tok["refreshToken"]}).status_code == 401)
    auth = {"Authorization": f"Bearer {ref.json()['accessToken']}"}

    check("me", c.get("/auth/me", headers=auth).json()["email"] == email)
    check("me needs auth", c.get("/auth/me").status_code == 401)

    # --- pro quota is 300 ----------------------------------------------
    pq = c.get("/scans/quota", headers=auth).json()
    check("pro quota is 300", pq["limit"] == 300, str(pq))

    # --- settings -----------------------------------------------------
    s = c.get("/settings", headers=auth).json()
    check("settings default", s["appearance"]["theme"] == "dark")
    upd = c.put("/settings", headers=auth, json={"appearance": {"theme": "light", "density": "compact"}})
    check("settings update", upd.json()["appearance"]["theme"] == "light")

    # --- analyses ---------------------------------------------------
    a = c.post(
        "/analyses",
        headers=auth,
        json={
            "name": "note.txt", "type": "text", "status": "clean", "score": 3,
            "signalLevel": "clean", "result": {"summary": "clean"},
        },
    )
    check("create analysis", a.status_code == 201, str(a.status_code))
    aid = a.json()["id"]
    check("list analyses", any(x["id"] == aid for x in c.get("/analyses", headers=auth).json()))
    check("get analysis", c.get(f"/analyses/{aid}", headers=auth).json()["result"]["summary"] == "clean")
    check("dashboard counts it", c.get("/dashboard", headers=auth).json()["stats"]["analyses"] == 1)
    check("delete analysis", c.delete(f"/analyses/{aid}", headers=auth).status_code == 204)
    check("deleted -> 404", c.get(f"/analyses/{aid}", headers=auth).status_code == 404)

    # --- billing --------------------------------------------------
    up = c.post("/billing/upgrade", headers=auth, json={"plan": "premium"})
    check("upgrade to premium", up.status_code == 200 and up.json()["user"]["plan"] == "premium")
    prem_auth = {"Authorization": f"Bearer {up.json()['accessToken']}"}
    check("premium quota unlimited", c.get("/scans/quota", headers=prem_auth).json()["unlimited"] is True)

    # --- magic link ----------------------------------------------
    ml = c.post("/auth/magic/request", json={"email": f"magic_{os.getpid()}@test.dev", "plan": "pro"})
    check("magic request", ml.json()["sent"] is True)
    token = ml.json()["debugUrl"].split("token=")[1]
    mc = c.post("/auth/magic/consume", json={"token": token})
    check("magic consume creates account", mc.status_code == 200)
    check("magic token single-use", c.post("/auth/magic/consume", json={"token": token}).status_code == 400)

    print("\nAll smoke checks passed.")


if __name__ == "__main__":
    main()
