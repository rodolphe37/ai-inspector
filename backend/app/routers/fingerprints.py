"""Public catalogue of known provenance fingerprints / detection methods."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..deps import DbSession
from ..models import Fingerprint
from ..schemas import FingerprintOut

router = APIRouter(prefix="/fingerprints", tags=["fingerprints"])


def _out(f: Fingerprint) -> FingerprintOut:
    return FingerprintOut(
        id=f.id,
        name=f.name,
        provider=f.provider,
        type=f.type,
        version=f.version,
        status=f.status,
        description=f.description,
        last_updated=f.last_updated,
        confidence=f.confidence,
        detection_method=f.detection_method,
        target_content=f.target_content,
        coverage=f.coverage,
        references=f.references or [],
    )


@router.get("", response_model=list[FingerprintOut])
def list_fingerprints(db: DbSession):
    rows = db.execute(
        select(Fingerprint).order_by(Fingerprint.sort_order, Fingerprint.name)
    ).scalars().all()
    return [_out(f) for f in rows]


@router.get("/{fingerprint_id}", response_model=FingerprintOut)
def get_fingerprint(fingerprint_id: str, db: DbSession) -> FingerprintOut:
    row = db.get(Fingerprint, fingerprint_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fingerprint not found.")
    return _out(row)
