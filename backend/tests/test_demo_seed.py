from __future__ import annotations

from app.db import SessionLocal
from scripts.seed_demo import DEMO, main


def test_seed_demo_creates_pro_and_premium(client):
    main()  # idempotent
    main()  # run twice — must not raise or duplicate

    from app.auth_service import get_user_by_email

    with SessionLocal() as db:
        for email, _name, _password, plan in DEMO:
            user = get_user_by_email(db, email)
            assert user is not None
            assert user.plan == plan

    # the seeded accounts can actually sign in through the API
    for email, _name, password, plan in DEMO:
        res = client.post("/api/auth/login", json={"email": email, "password": password})
        assert res.status_code == 200, res.text
        assert res.json()["user"]["plan"] == plan
