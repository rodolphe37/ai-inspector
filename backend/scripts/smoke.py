"""Ad-hoc end-to-end smoke test against a running API (default :8000).

    API=https://your-api.onrender.com python scripts/smoke.py
"""

from __future__ import annotations

import os
import sys

import httpx

BASE = os.environ.get("API", "http://localhost:8000").rstrip("/") + "/api"


def check(label: str, cond: bool, extra: str = "") -> None:
    mark = "OK  " if cond else "FAIL"
    print(f"[{mark}] {label} {extra}")
    if not cond:
        sys.exit(1)


def main() -> None:
    c = httpx.Client(base_url=BASE, timeout=60)  # generous: free hosts cold-start

    check("health", c.get("/health").json()["status"] == "ok")

    fps = c.get("/fingerprints").json()
    check("fingerprint catalogue", len(fps) >= 10, f"({len(fps)})")
    check("fingerprint detail", c.get(f"/fingerprints/{fps[0]['id']}").status_code == 200)
    check("unknown fingerprint -> 404", c.get("/fingerprints/nope").status_code == 404)

    check("no quota endpoint", c.get("/scans/quota").status_code == 404)
    check("no auth endpoint", c.get("/auth/me").status_code == 404)

    print("\nAll smoke checks passed.")


if __name__ == "__main__":
    main()
