"""Database engine, session factory and declarative base."""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

# SQLite needs cross-thread access for FastAPI's threadpool. For Postgres,
# disable psycopg's automatic prepared statements so the app also works behind
# a transaction-mode pooler (e.g. Neon's ``-pooler`` endpoint / PgBouncer).
_connect_args = (
    {"check_same_thread": False} if settings.is_sqlite else {"prepare_threshold": None}
)

engine = create_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables for engines without migrations (SQLite dev, tests).

    For Postgres, prefer ``alembic upgrade head``.
    """
    from . import models  # noqa: F401  (register mappers)

    Base.metadata.create_all(bind=engine)
