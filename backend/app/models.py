"""SQLAlchemy ORM models."""

from __future__ import annotations

from sqlalchemy import JSON, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class Fingerprint(Base):
    __tablename__ = "fingerprints"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    provider: Mapped[str] = mapped_column(String(120))
    type: Mapped[str] = mapped_column(String(24))
    version: Mapped[str] = mapped_column(String(24))
    status: Mapped[str] = mapped_column(String(24))
    description: Mapped[str] = mapped_column(Text)
    last_updated: Mapped[str] = mapped_column(String(24))
    confidence: Mapped[int] = mapped_column(Integer, default=0)
    detection_method: Mapped[str] = mapped_column(Text)
    target_content: Mapped[str] = mapped_column(String(24))
    coverage: Mapped[str] = mapped_column(String(255))
    references: Mapped[list] = mapped_column(JSON, default=list)
    # {"fr": {"name", "provider", "description", "detection_method", "coverage"}}
    translations: Mapped[dict] = mapped_column(JSON, default=dict)
    sort_order: Mapped[int] = mapped_column(Integer, default=100)
