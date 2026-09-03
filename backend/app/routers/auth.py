"""Classic auth: register, login, refresh, logout, magic links, anon sessions."""

from __future__ import annotations

import logging
from datetime import timedelta

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select

from ..auth_service import (
    create_user,
    get_user_by_email,
    issue_token_pair,
    revoke_refresh_token,
    rotate_refresh_token,
    user_out,
)
from ..config import settings
from ..deps import CurrentUser, DbSession, get_or_touch_anon
from ..models import AnonSession, MagicLink
from ..schemas import (
    AnonSessionOut,
    LoginRequest,
    MagicConsumeRequest,
    MagicLinkIssued,
    MagicRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UserOut,
)
from ..security import as_aware, generate_token, hash_token, utcnow, verify_password

log = logging.getLogger("ia_inspector.auth")
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: DbSession) -> TokenPair:
    if get_user_by_email(db, body.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
    user = create_user(
        db, email=body.email, name=body.name, plan=body.plan, password=body.password
    )
    pair = issue_token_pair(db, user)
    db.commit()
    return pair


@router.post("/login", response_model=TokenPair)
def login(body: LoginRequest, db: DbSession) -> TokenPair:
    user = get_user_by_email(db, body.email)
    if user is None or user.password_hash is None or not verify_password(
        body.password, user.password_hash
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    pair = issue_token_pair(db, user)
    db.commit()
    return pair


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshRequest, db: DbSession) -> TokenPair:
    result = rotate_refresh_token(db, body.refresh_token)
    if result is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token.")
    _, pair = result
    db.commit()
    return pair


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(body: RefreshRequest, db: DbSession) -> None:
    revoke_refresh_token(db, body.refresh_token)
    db.commit()


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> UserOut:
    return user_out(user)


@router.post("/anon", response_model=AnonSessionOut)
def anon(request: Request, db: DbSession) -> AnonSessionOut:
    incoming = request.headers.get("x-anon-id")
    sess = get_or_touch_anon(db, request, incoming)
    db.commit()
    return AnonSessionOut(anon_id=sess.id)


# --- Magic link ------------------------------------------------------------


@router.post("/magic/request", response_model=MagicLinkIssued)
def magic_request(body: MagicRequest, db: DbSession) -> MagicLinkIssued:
    raw = generate_token(32)
    db.add(
        MagicLink(
            email=body.email.lower().strip(),
            name=body.name,
            plan=body.plan,
            token_hash=hash_token(raw),
            expires_at=utcnow() + timedelta(minutes=settings.magic_link_ttl_min),
        )
    )
    db.commit()

    link = f"{settings.frontend_url}/auth/magic?token={raw}"
    if settings.smtp_host:
        _send_magic_email(body.email, link)
        return MagicLinkIssued(sent=True)
    log.warning("Magic link for %s (SMTP disabled): %s", body.email, link)
    return MagicLinkIssued(sent=True, debug_url=link)


@router.post("/magic/consume", response_model=TokenPair)
def magic_consume(body: MagicConsumeRequest, db: DbSession) -> TokenPair:
    row = db.execute(
        select(MagicLink).where(MagicLink.token_hash == hash_token(body.token))
    ).scalar_one_or_none()
    if row is None or row.consumed or as_aware(row.expires_at) < utcnow():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired link.")
    row.consumed = True

    user = get_user_by_email(db, row.email)
    if user is None:
        user = create_user(
            db, email=row.email, name=row.name or row.email.split("@")[0], plan=row.plan
        )
    pair = issue_token_pair(db, user)
    db.commit()
    return pair


def _send_magic_email(to: str, link: str) -> None:
    import smtplib
    from email.message import EmailMessage

    msg = EmailMessage()
    msg["Subject"] = "Your IA Inspector sign-in link"
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg.set_content(f"Click to sign in:\n\n{link}\n\nThis link expires shortly.")
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as s:
        s.starttls()
        if settings.smtp_user:
            s.login(settings.smtp_user, settings.smtp_password)
        s.send_message(msg)


_ = AnonSession  # re-exported for tests
