"""Fixed-window scan quota accounting."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import QuotaWindow, ScanEvent
from .plans import PlanTier, scan_limit, window_hours
from .security import as_aware, utcnow


@dataclass
class QuotaState:
    tier: PlanTier
    limit: int | None
    used: int
    window_hours: int
    window_start: datetime | None

    @property
    def unlimited(self) -> bool:
        return self.limit is None

    @property
    def remaining(self) -> int | None:
        if self.limit is None:
            return None
        return max(0, self.limit - self.used)

    @property
    def resets_at(self) -> datetime | None:
        if self.window_start is None:
            return None
        return as_aware(self.window_start) + timedelta(hours=self.window_hours)

    @property
    def exhausted(self) -> bool:
        return self.limit is not None and self.used >= self.limit

    def as_dict(self) -> dict:
        return {
            "tier": self.tier.value,
            "limit": self.limit,
            "used": self.used,
            "remaining": self.remaining,
            "window_hours": self.window_hours,
            "resets_at": self.resets_at,
            "unlimited": self.unlimited,
        }


def _fresh_window(win: QuotaWindow | None, hours: int, now: datetime) -> bool:
    """True when the stored window is still active."""
    if win is None or win.window_start is None:
        return False
    return now - as_aware(win.window_start) < timedelta(hours=hours)


def get_state(db: Session, owner_type: str, owner_id: str, plan: PlanTier) -> QuotaState:
    limit = scan_limit(plan)
    hours = window_hours(plan)
    now = utcnow()

    if limit is None:
        return QuotaState(plan, None, 0, hours, None)

    win = db.execute(
        select(QuotaWindow).where(
            QuotaWindow.owner_type == owner_type, QuotaWindow.owner_id == owner_id
        )
    ).scalar_one_or_none()

    if _fresh_window(win, hours, now):
        return QuotaState(plan, limit, win.count, hours, win.window_start)
    # No window yet, or it has expired -> a fresh window is available.
    return QuotaState(plan, limit, 0, hours, None)


def consume(
    db: Session, owner_type: str, owner_id: str, plan: PlanTier, kind: str = "analysis"
) -> QuotaState:
    """Attempt to spend one credit. Raises ``QuotaExceeded`` when empty."""
    limit = scan_limit(plan)
    hours = window_hours(plan)
    now = utcnow()

    if limit is None:
        db.add(ScanEvent(owner_type=owner_type, owner_id=owner_id, kind=kind))
        db.flush()
        return QuotaState(plan, None, 0, hours, None)

    win = db.execute(
        select(QuotaWindow).where(
            QuotaWindow.owner_type == owner_type, QuotaWindow.owner_id == owner_id
        )
    ).scalar_one_or_none()

    if win is None:
        win = QuotaWindow(owner_type=owner_type, owner_id=owner_id, window_start=None, count=0)
        db.add(win)

    if not _fresh_window(win, hours, now):
        win.window_start = now
        win.count = 0

    state = QuotaState(plan, limit, win.count, hours, win.window_start)
    if state.exhausted:
        raise QuotaExceeded(state)

    win.count += 1
    db.add(ScanEvent(owner_type=owner_type, owner_id=owner_id, kind=kind))
    db.flush()
    return QuotaState(plan, limit, win.count, hours, win.window_start)


class QuotaExceeded(Exception):
    def __init__(self, state: QuotaState):
        self.state = state
        super().__init__("Scan quota exceeded")
