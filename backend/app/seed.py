"""Idempotent seeding of the fingerprint catalogue."""

from __future__ import annotations

from sqlalchemy.orm import Session

from .db import SessionLocal, init_db
from .models import Fingerprint
from .seed_data import FINGERPRINTS


def seed_fingerprints(db: Session) -> int:
    changed = 0
    for entry in FINGERPRINTS:
        row = db.get(Fingerprint, entry["id"])
        if row is None:
            db.add(Fingerprint(**entry))
            changed += 1
        else:
            for key, value in entry.items():
                if getattr(row, key) != value:
                    setattr(row, key, value)
                    changed += 1
    db.commit()
    return changed


def main() -> None:
    init_db()
    with SessionLocal() as db:
        n = seed_fingerprints(db)
    print(f"Seed complete ({n} field(s) written).")


if __name__ == "__main__":
    main()
