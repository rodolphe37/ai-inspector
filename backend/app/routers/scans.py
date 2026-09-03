"""Scan quota: status + credit consumption."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response, status

from ..deps import DbSession, PrincipalDep
from ..quota import QuotaExceeded, consume, get_state
from ..schemas import ConsumeRequest, QuotaStatus

router = APIRouter(prefix="/scans", tags=["scans"])


def _to_schema(state) -> QuotaStatus:
    d = state.as_dict()
    return QuotaStatus(**d)


@router.get("/quota", response_model=QuotaStatus)
def quota(principal: PrincipalDep, db: DbSession) -> QuotaStatus:
    state = get_state(db, principal.owner_type, principal.owner_id, principal.plan)
    db.commit()
    return _to_schema(state)


@router.post("/consume", response_model=QuotaStatus)
def consume_credit(
    body: ConsumeRequest, principal: PrincipalDep, db: DbSession, response: Response
) -> QuotaStatus:
    try:
        state = consume(
            db, principal.owner_type, principal.owner_id, principal.plan, body.kind
        )
    except QuotaExceeded as exc:
        db.commit()
        resets = exc.state.resets_at
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Scan quota reached for this period.",
                "resets_at": resets.isoformat() if resets else None,
                "quota": _to_schema(exc.state).model_dump(by_alias=True, mode="json"),
            },
        ) from None
    db.commit()
    out = _to_schema(state)
    response.headers["X-Quota-Remaining"] = "" if out.remaining is None else str(out.remaining)
    return out
