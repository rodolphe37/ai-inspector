"""Simulated billing. Swap the upgrade handler for a Stripe webhook later."""

from __future__ import annotations

from fastapi import APIRouter

from ..auth_service import issue_token_pair
from ..deps import CurrentUser, DbSession
from ..plans import describe_all
from ..schemas import TokenPair, UpgradeRequest

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/plans")
def plans() -> dict:
    return {"plans": describe_all()}


@router.post("/upgrade", response_model=TokenPair)
def upgrade(body: UpgradeRequest, user: CurrentUser, db: DbSession) -> TokenPair:
    """Grant the requested plan immediately (no real payment).

    Returns a fresh token pair because the access token embeds the plan claim.
    """
    user.plan = body.plan
    if user.settings and isinstance(user.settings.data, dict):
        account = dict(user.settings.data.get("account", {}))
        account["plan"] = body.plan
        user.settings.data = {**user.settings.data, "account": account}
    db.commit()
    db.refresh(user)
    pair = issue_token_pair(db, user)
    db.commit()
    return pair
