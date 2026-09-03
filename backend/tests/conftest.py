from __future__ import annotations

import os
import tempfile
from collections.abc import Iterator

import pytest

# Point the app at an isolated SQLite file *before* importing it.
_tmp = tempfile.NamedTemporaryFile(suffix=".sqlite3", delete=False)
_tmp.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.name}"
os.environ["JWT_SECRET"] = "test-secret-key-that-is-definitely-long-enough-000"
os.environ["SESSION_SECRET"] = "test-session-secret-also-quite-long-enough-000000"
os.environ["ANON_SCAN_LIMIT"] = "3"
os.environ["ANON_WINDOW_HOURS"] = "48"
os.environ["PRO_SCAN_LIMIT"] = "10"

from fastapi.testclient import TestClient  # noqa: E402

from app.db import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _schema() -> Iterator[None]:
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    os.unlink(_tmp.name)


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as c:
        yield c


@pytest.fixture
def account(client: TestClient):
    import uuid

    email = f"user_{uuid.uuid4().hex[:8]}@test.dev"
    res = client.post(
        "/api/auth/register",
        json={"email": email, "name": "Test", "password": "password123", "plan": "pro"},
    )
    assert res.status_code == 201, res.text
    data = res.json()
    return {
        "email": email,
        "tokens": data,
        "auth": {"Authorization": f"Bearer {data['accessToken']}"},
    }
