"""Public catalogue of known provenance fingerprints / detection methods.

Read-only and unauthenticated. ``?lang=fr`` returns the French wording of the
human-readable fields (English is the fallback for anything untranslated).
"""

from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException, Path, Query, Response, status
from sqlalchemy import select

from ..deps import DbSession
from ..models import Fingerprint
from ..schemas import FingerprintOut

router = APIRouter(prefix="/fingerprints", tags=["fingerprints"])

Lang = Annotated[Literal["en", "fr"], Query(description="Language of the text fields.")]
FingerprintId = Annotated[str, Path(pattern=r"^[a-z0-9-]{1,64}$")]

# The catalogue changes only on deploy: let browsers / CDNs cache it briefly.
CACHE = "public, max-age=300, stale-while-revalidate=3600"

_LOCALISED = ("name", "provider", "description", "detection_method", "coverage")


def _out(f: Fingerprint, lang: str) -> FingerprintOut:
    tr = (f.translations or {}).get(lang, {}) if lang != "en" else {}
    text = {field: tr.get(field) or getattr(f, field) for field in _LOCALISED}
    return FingerprintOut(
        id=f.id,
        type=f.type,
        version=f.version,
        status=f.status,
        last_updated=f.last_updated,
        confidence=f.confidence,
        target_content=f.target_content,
        references=f.references or [],
        **text,
    )


@router.get("", response_model=list[FingerprintOut])
def list_fingerprints(db: DbSession, response: Response, lang: Lang = "en"):
    rows = db.execute(
        select(Fingerprint).order_by(Fingerprint.sort_order, Fingerprint.name)
    ).scalars().all()
    response.headers["Cache-Control"] = CACHE
    return [_out(f, lang) for f in rows]


@router.get("/{fingerprint_id}", response_model=FingerprintOut)
def get_fingerprint(
    fingerprint_id: FingerprintId, db: DbSession, response: Response, lang: Lang = "en"
) -> FingerprintOut:
    row = db.get(Fingerprint, fingerprint_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fingerprint not found.")
    response.headers["Cache-Control"] = CACHE
    return _out(row, lang)
