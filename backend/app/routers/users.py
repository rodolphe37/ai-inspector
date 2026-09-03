"""Current-user profile endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ..auth_service import user_out
from ..deps import CurrentUser, DbSession
from ..schemas import UserOut, UserSettingsUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(user: CurrentUser) -> UserOut:
    return user_out(user)


@router.patch("/me", response_model=UserOut)
def patch_me(body: UserSettingsUpdate, user: CurrentUser, db: DbSession) -> UserOut:
    if body.name:
        user.name = body.name.strip()
    db.commit()
    db.refresh(user)
    return user_out(user)
