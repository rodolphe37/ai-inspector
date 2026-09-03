"""Shared helpers for creating users, issuing token pairs and default settings."""

from __future__ import annotations

from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .models import RefreshToken, User, UserSettings
from .schemas import TokenPair, UserOut, UserSettingsOut
from .security import (
    as_aware,
    create_access_token,
    generate_token,
    hash_password,
    hash_token,
    utcnow,
)


def default_settings_payload(user: User) -> dict:
    out = UserSettingsOut()
    out.account.email = user.email
    out.account.name = user.name
    out.account.plan = user.plan
    return out.model_dump(by_alias=True)


def ensure_settings(db: Session, user: User) -> UserSettings:
    row = db.get(UserSettings, user.id)
    if row is None:
        row = UserSettings(user_id=user.id, data=default_settings_payload(user))
        db.add(row)
        db.flush()
    return row


def user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        plan=user.plan,
        avatar_url=user.avatar_url,
        has_password=user.password_hash is not None,
        created_at=user.created_at,
    )


def issue_token_pair(db: Session, user: User) -> TokenPair:
    raw_refresh = generate_token(48)
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=utcnow() + timedelta(days=settings.refresh_token_ttl_days),
        )
    )
    db.flush()
    return TokenPair(
        access_token=create_access_token(user.id, {"plan": user.plan}),
        refresh_token=raw_refresh,
        expires_in=settings.access_token_ttl_min * 60,
        user=user_out(user),
    )


def rotate_refresh_token(db: Session, raw_refresh: str) -> tuple[User, TokenPair] | None:
    row = db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_refresh))
    ).scalar_one_or_none()
    if row is None or row.revoked:
        return None
    if as_aware(row.expires_at) < utcnow():
        return None
    user = db.get(User, row.user_id)
    if user is None:
        return None
    row.revoked = True
    pair = issue_token_pair(db, user)
    return user, pair


def revoke_refresh_token(db: Session, raw_refresh: str) -> None:
    row = db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_refresh))
    ).scalar_one_or_none()
    if row is not None:
        row.revoked = True


def create_user(
    db: Session,
    *,
    email: str,
    name: str,
    plan: str,
    password: str | None = None,
    avatar_url: str | None = None,
) -> User:
    user = User(
        email=email.lower().strip(),
        name=name.strip(),
        plan=plan,
        password_hash=hash_password(password) if password else None,
        avatar_url=avatar_url,
    )
    db.add(user)
    db.flush()
    ensure_settings(db, user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(
        select(User).where(User.email == email.lower().strip())
    ).scalar_one_or_none()
