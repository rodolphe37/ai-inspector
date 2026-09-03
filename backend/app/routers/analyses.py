"""Server-side analysis history (pro / premium)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..deps import CurrentUser, DbSession
from ..models import Analysis
from ..plans import PlanTier, can
from ..schemas import AnalysisCreate, AnalysisOut, AnalysisSummary

router = APIRouter(prefix="/analyses", tags=["analyses"])


def _summary(a: Analysis) -> AnalysisSummary:
    return AnalysisSummary(
        id=a.id, name=a.name, type=a.type, date=a.created_at, status=a.status,
        score=a.score, signal_level=a.signal_level, ai_verdict=a.ai_verdict,
        ai_probability=a.ai_probability, size=a.size, language=a.language,
    )


@router.get("", response_model=list[AnalysisSummary])
def list_analyses(user: CurrentUser, db: DbSession, limit: int = 100, offset: int = 0):
    rows = db.execute(
        select(Analysis)
        .where(Analysis.user_id == user.id)
        .order_by(Analysis.created_at.desc())
        .limit(min(limit, 500))
        .offset(offset)
    ).scalars().all()
    return [_summary(a) for a in rows]


@router.post("", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
def create_analysis(body: AnalysisCreate, user: CurrentUser, db: DbSession) -> AnalysisOut:
    if not can(PlanTier(user.plan), "server_history"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Your plan cannot store history.")
    row = Analysis(
        user_id=user.id,
        name=body.name[:255],
        type=body.type,
        status=body.status,
        score=body.score,
        signal_level=body.signal_level,
        ai_verdict=body.ai_verdict,
        ai_probability=body.ai_probability,
        size=body.size,
        language=body.language,
        result=body.result,
    )
    if body.id:
        row.id = body.id[:32]
    db.add(row)
    db.commit()
    db.refresh(row)
    return AnalysisOut(**_summary(row).model_dump(by_alias=True), result=row.result)


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(analysis_id: str, user: CurrentUser, db: DbSession) -> AnalysisOut:
    row = db.get(Analysis, analysis_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Analysis not found.")
    return AnalysisOut(**_summary(row).model_dump(by_alias=True), result=row.result)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(analysis_id: str, user: CurrentUser, db: DbSession) -> None:
    row = db.get(Analysis, analysis_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Analysis not found.")
    db.delete(row)
    db.commit()
