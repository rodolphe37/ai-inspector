"""Password hashing, token hashing and JWT helpers."""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from .config import settings

# --- Passwords --------------------------------------------------------------

_BCRYPT_MAX_BYTES = 72


def _prepare(password: str) -> bytes:
    # bcrypt silently truncates at 72 bytes; pre-hash longer inputs so the
    # whole password contributes to the digest.
    raw = password.encode("utf-8")
    if len(raw) > _BCRYPT_MAX_BYTES:
        raw = hashlib.sha256(raw).hexdigest().encode("ascii")
    return raw


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(password), hashed.encode("ascii"))
    except (ValueError, TypeError):
        return False


# --- Opaque tokens (refresh tokens, magic links, oauth exchange codes) -----


def generate_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_fingerprint(value: str) -> str:
    """Keyed hash for IP / user-agent abuse signals (not reversible)."""
    return hmac.new(
        settings.jwt_secret.encode("utf-8"), value.encode("utf-8"), hashlib.sha256
    ).hexdigest()


# --- JWT access tokens -----------------------------------------------------


def create_access_token(subject: str, extra: dict | None = None) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.access_token_ttl_min)).timestamp()),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except jwt.PyJWTError:
        return None
    if payload.get("type") != "access":
        return None
    return payload


def utcnow() -> datetime:
    return datetime.now(UTC)


def as_aware(dt: datetime | None) -> datetime | None:
    """Normalise a possibly-naive datetime (SQLite) to UTC-aware."""
    if dt is None:
        return None
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=UTC)
