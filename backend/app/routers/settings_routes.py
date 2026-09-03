"""Per-user settings (server-side persistence for pro/premium)."""

from __future__ import annotations

from fastapi import APIRouter

from ..auth_service import default_settings_payload, ensure_settings
from ..deps import CurrentUser, DbSession
from ..schemas import UserSettingsOut, UserSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


def _merge(current: dict, update: UserSettingsUpdate) -> dict:
    data = dict(current)
    for section in ("appearance", "privacy", "analysis", "notifications"):
        value = getattr(update, section)
        if value is not None:
            data[section] = value.model_dump(by_alias=True)
    return data


@router.get("", response_model=UserSettingsOut)
def get_settings(user: CurrentUser, db: DbSession) -> UserSettingsOut:
    row = ensure_settings(db, user)
    db.commit()
    payload = {**default_settings_payload(user), **(row.data or {})}
    payload["account"] = {"email": user.email, "name": user.name, "plan": user.plan}
    return UserSettingsOut.model_validate(payload)


@router.put("", response_model=UserSettingsOut)
def update_settings(body: UserSettingsUpdate, user: CurrentUser, db: DbSession) -> UserSettingsOut:
    row = ensure_settings(db, user)
    if body.name:
        user.name = body.name.strip()
    row.data = _merge(row.data or default_settings_payload(user), body)
    db.commit()
    payload = {**default_settings_payload(user), **row.data}
    payload["account"] = {"email": user.email, "name": user.name, "plan": user.plan}
    return UserSettingsOut.model_validate(payload)
