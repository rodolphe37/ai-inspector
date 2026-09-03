"""OAuth sign-in / sign-up endpoints (Authlib)."""

from __future__ import annotations

from datetime import timedelta
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth_service import ensure_settings, get_user_by_email, issue_token_pair
from ..config import settings
from ..deps import DbSession
from ..models import OAuthAccount, OAuthExchangeCode, User
from ..oauth import enabled_providers, fetch_userinfo, is_enabled, oauth
from ..schemas import OAuthExchangeRequest, TokenPair
from ..security import as_aware, generate_token, hash_token, utcnow

router = APIRouter(prefix="/auth/oauth", tags=["oauth"])


@router.get("/providers")
def providers() -> dict:
    return {"providers": enabled_providers()}


@router.get("/{provider}/login")
async def login(provider: str, request: Request, plan: str = Query("pro")) -> RedirectResponse:
    if not is_enabled(provider):
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Provider '{provider}' is not configured.")
    request.session["oauth_plan"] = "premium" if plan == "premium" else "pro"
    redirect_uri = f"{settings.api_base_url}/api/auth/oauth/{provider}/callback"
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)


@router.get("/{provider}/callback")
async def callback_get(provider: str, request: Request, db: DbSession) -> RedirectResponse:
    return await _handle_callback(provider, request, db)


@router.post("/{provider}/callback")
async def callback_post(provider: str, request: Request, db: DbSession) -> RedirectResponse:
    return await _handle_callback(provider, request, db)


async def _handle_callback(provider: str, request: Request, db: Session) -> RedirectResponse:
    if not is_enabled(provider):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown provider.")
    try:
        token = await oauth.create_client(provider).authorize_access_token(request)
        profile = await fetch_userinfo(provider, token)
    except Exception as exc:  # noqa: BLE001 - surface to the SPA
        return RedirectResponse(
            f"{settings.frontend_url}/login?oauth_error={quote(str(exc)[:200])}"
        )

    plan = request.session.pop("oauth_plan", "pro")

    link = db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_account_id == profile.provider_account_id,
        )
    ).scalar_one_or_none()

    if link is not None:
        user = db.get(User, link.user_id)
    else:
        user = get_user_by_email(db, profile.email) if profile.email else None
        if user is None:
            pid = profile.provider_account_id
            email = profile.email or f"{provider}-{pid}@oauth.provenance-inspector.app"
            user = User(
                email=email.lower(),
                name=profile.name or email.split("@")[0],
                plan=plan,
                avatar_url=profile.avatar_url,
            )
            db.add(user)
            db.flush()
            ensure_settings(db, user)
        db.add(
            OAuthAccount(
                user_id=user.id,
                provider=provider,
                provider_account_id=profile.provider_account_id,
                email=profile.email,
            )
        )

    if profile.avatar_url and not user.avatar_url:
        user.avatar_url = profile.avatar_url

    raw_code = generate_token(32)
    db.add(
        OAuthExchangeCode(
            code_hash=hash_token(raw_code),
            user_id=user.id,
            expires_at=utcnow() + timedelta(minutes=5),
        )
    )
    db.commit()
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?code={raw_code}")


@router.post("/exchange", response_model=TokenPair)
def exchange(body: OAuthExchangeRequest, db: DbSession) -> TokenPair:
    row = db.execute(
        select(OAuthExchangeCode).where(OAuthExchangeCode.code_hash == hash_token(body.code))
    ).scalar_one_or_none()
    if row is None or row.consumed or as_aware(row.expires_at) < utcnow():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code.")
    row.consumed = True
    user = db.get(User, row.user_id)
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown user.")
    pair = issue_token_pair(db, user)
    db.commit()
    return pair
