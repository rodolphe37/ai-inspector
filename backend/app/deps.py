"""FastAPI dependencies: DB session, current user, anonymous session, plan."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import AnonSession, User
from .plans import PlanTier
from .security import decode_access_token, hash_fingerprint, utcnow

DbSession = Annotated[Session, Depends(get_db)]


def _bearer(authorization: str | None) -> str | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    return token


def get_current_user(
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    token = _bearer(authorization)
    payload = decode_access_token(token) if token else None
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.get(User, payload["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown user")
    return user


def get_optional_user(
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
) -> User | None:
    token = _bearer(authorization)
    payload = decode_access_token(token) if token else None
    if not payload:
        return None
    return db.get(User, payload["sub"])


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_optional_user)]


def client_fingerprints(request: Request) -> tuple[str | None, str | None]:
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "")
    ua = request.headers.get("user-agent", "")
    return (
        hash_fingerprint(ip) if ip else None,
        hash_fingerprint(ua) if ua else None,
    )


def get_or_touch_anon(
    db: DbSession,
    request: Request,
    x_anon_id: Annotated[str | None, Header()] = None,
) -> AnonSession:
    """Return the anon session named by X-Anon-Id, creating it if unknown."""
    ip_hash, ua_hash = client_fingerprints(request)
    sess: AnonSession | None = None
    if x_anon_id:
        sess = db.execute(
            select(AnonSession).where(AnonSession.id == x_anon_id)
        ).scalar_one_or_none()
    if sess is None:
        sess = AnonSession(ip_hash=ip_hash, ua_hash=ua_hash)
        if x_anon_id and len(x_anon_id) <= 32:
            sess.id = x_anon_id
        db.add(sess)
        db.flush()
    else:
        sess.last_seen_at = utcnow()
        if ip_hash:
            sess.ip_hash = ip_hash
    return sess


AnonSessionDep = Annotated[AnonSession, Depends(get_or_touch_anon)]


class Principal:
    """Unified view of "who is asking" for quota + capability checks."""

    def __init__(self, plan: PlanTier, owner_type: str, owner_id: str, user: User | None):
        self.plan = plan
        self.owner_type = owner_type
        self.owner_id = owner_id
        self.user = user


def get_principal(
    db: DbSession,
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
    x_anon_id: Annotated[str | None, Header()] = None,
) -> Principal:
    user = get_optional_user(db, authorization)
    if user is not None:
        return Principal(PlanTier(user.plan), "user", user.id, user)
    anon = get_or_touch_anon(db, request, x_anon_id)
    return Principal(PlanTier.ANONYMOUS, "anon", anon.id, None)


PrincipalDep = Annotated[Principal, Depends(get_principal)]
