"""Dashboard aggregates, computed from the user's real analyses."""

from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter
from sqlalchemy import func, select

from ..deps import CurrentUser, DbSession
from ..models import Analysis, Fingerprint
from ..schemas import (
    ActivityPoint,
    AnalysisSummary,
    DashboardOut,
    DashboardStats,
)
from ..security import as_aware, utcnow

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

SIGNAL_STATUSES = {"possible_signal", "signal_detected", "c2pa_found"}
AI_VERDICTS = {"ai_confirmed", "ai_likely", "ai_possible"}


def _is_signal(a) -> bool:
    return a.ai_verdict in AI_VERDICTS or a.status in SIGNAL_STATUSES


@router.get("", response_model=DashboardOut)
def dashboard(user: CurrentUser, db: DbSession, days: int = 30) -> DashboardOut:
    rows = db.execute(
        select(Analysis).where(Analysis.user_id == user.id).order_by(Analysis.created_at.desc())
    ).scalars().all()

    total = len(rows)
    signals = sum(1 for a in rows if _is_signal(a))
    clean = sum(1 for a in rows if not _is_signal(a) and a.status in ("clean", "inconclusive"))
    known_fp = db.execute(select(func.count()).select_from(Fingerprint)).scalar_one()

    today = utcnow().date()
    buckets: dict[str, dict[str, int]] = {
        (today - timedelta(days=i)).isoformat(): {"analyses": 0, "signals": 0}
        for i in range(days - 1, -1, -1)
    }
    for a in rows:
        key = as_aware(a.created_at).date().isoformat()
        if key in buckets:
            buckets[key]["analyses"] += 1
            if _is_signal(a):
                buckets[key]["signals"] += 1

    activity = [
        ActivityPoint(date=day, analyses=v["analyses"], signals=v["signals"])
        for day, v in buckets.items()
    ]
    recent = [
        AnalysisSummary(
            id=a.id, name=a.name, type=a.type, date=a.created_at, status=a.status,
            score=a.score, signal_level=a.signal_level, ai_verdict=a.ai_verdict,
            ai_probability=a.ai_probability, size=a.size, language=a.language,
        )
        for a in rows[:5]
    ]

    return DashboardOut(
        stats=DashboardStats(
            analyses=total,
            signals_detected=signals,
            clean_files=clean,
            known_fingerprints=known_fp,
        ),
        activity=activity,
        recent=recent,
    )
