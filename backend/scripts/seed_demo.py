"""Create local demo accounts for trying the Pro and Premium tiers.

Idempotent — running it again just resets the passwords / plans.

    make seed-demo        # or: python -m scripts.seed_demo

Accounts (LOCAL DEV ONLY — never run against a real database):

    pro@demo.ia-inspector.app       demo-pro-pass       -> plan: pro
    premium@demo.ia-inspector.app    demo-premium-pass   -> plan: premium
"""

from __future__ import annotations

import sys

from app.auth_service import create_user, ensure_settings, get_user_by_email
from app.config import settings
from app.db import SessionLocal, init_db
from app.security import hash_password

DEMO = [
    ("pro@demo.ia-inspector.app", "Demo Pro", "demo-pro-pass", "pro"),
    ("premium@demo.ia-inspector.app", "Demo Premium", "demo-premium-pass", "premium"),
]


def main() -> None:
    if settings.environment not in ("development", "test", "local"):
        print(f"Refusing to seed demo accounts in environment={settings.environment!r}.")
        sys.exit(1)

    init_db()
    with SessionLocal() as db:
        for email, name, password, plan in DEMO:
            user = get_user_by_email(db, email)
            if user is None:
                user = create_user(db, email=email, name=name, plan=plan, password=password)
                action = "created"
            else:
                user.name = name
                user.plan = plan
                user.password_hash = hash_password(password)
                ensure_settings(db, user)
                action = "updated"
            db.commit()
            print(f"  {action:8} {email:24} {password:20} -> {plan}")
    print("Demo accounts ready.")


if __name__ == "__main__":
    main()
