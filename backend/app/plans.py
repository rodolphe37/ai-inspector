"""Plan tiers and their capabilities — canonical copy of docs/PLANS.md.

Keep this in sync with `frontend/src/lib/plans.ts` and `docs/PLANS.md`.
"""

from __future__ import annotations

from enum import Enum

from .config import settings


class PlanTier(str, Enum):
    ANONYMOUS = "anonymous"
    PRO = "pro"
    PREMIUM = "premium"


# Paid tiers that require an account. Registration always lands here.
ACCOUNT_TIERS = (PlanTier.PRO, PlanTier.PREMIUM)

# Capability flags. `True` / `False`, or a scalar limit.
FEATURES: dict[str, dict[PlanTier, object]] = {
    "unicode_analysis": {PlanTier.ANONYMOUS: True, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "basic_metadata": {PlanTier.ANONYMOUS: True, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "full_metadata": {PlanTier.ANONYMOUS: False, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "c2pa": {PlanTier.ANONYMOUS: True, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "statistical_analysis": {PlanTier.ANONYMOUS: False, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "fingerprint_matching": {PlanTier.ANONYMOUS: False, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "detailed_report": {PlanTier.ANONYMOUS: False, PlanTier.PRO: False, PlanTier.PREMIUM: True},
    "server_history": {PlanTier.ANONYMOUS: False, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "clean_text": {PlanTier.ANONYMOUS: True, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "clean_image_metadata": {PlanTier.ANONYMOUS: True, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "clean_documents": {PlanTier.ANONYMOUS: False, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "clean_batch": {PlanTier.ANONYMOUS: False, PlanTier.PRO: False, PlanTier.PREMIUM: True},
    "report_export": {PlanTier.ANONYMOUS: False, PlanTier.PRO: True, PlanTier.PREMIUM: True},
    "batch_analysis": {PlanTier.ANONYMOUS: False, PlanTier.PRO: False, PlanTier.PREMIUM: True},
    "api_access": {PlanTier.ANONYMOUS: False, PlanTier.PRO: False, PlanTier.PREMIUM: True},
}

CONTENT_TYPES: dict[PlanTier, list[str]] = {
    PlanTier.ANONYMOUS: ["text", "code", "image"],
    PlanTier.PRO: ["text", "code", "image", "pdf", "docx", "audio"],
    PlanTier.PREMIUM: ["text", "code", "image", "pdf", "docx", "audio", "video"],
}


def can(plan: PlanTier, feature: str) -> bool:
    return bool(FEATURES.get(feature, {}).get(plan, False))


def scan_limit(plan: PlanTier) -> int | None:
    """Scans allowed per window. ``None`` means unlimited."""
    return {
        PlanTier.ANONYMOUS: settings.anon_scan_limit,
        PlanTier.PRO: settings.pro_scan_limit,
        PlanTier.PREMIUM: None,
    }[plan]


def window_hours(plan: PlanTier) -> int:
    return {
        PlanTier.ANONYMOUS: settings.anon_window_hours,
        PlanTier.PRO: settings.pro_window_hours,
        PlanTier.PREMIUM: settings.pro_window_hours,
    }[plan]


def max_file_bytes(plan: PlanTier) -> int:
    return {
        PlanTier.ANONYMOUS: settings.anon_max_file_bytes,
        PlanTier.PRO: settings.pro_max_file_bytes,
        PlanTier.PREMIUM: settings.premium_max_file_bytes,
    }[plan]


def describe(plan: PlanTier) -> dict:
    """Full capability snapshot for a tier — consumed by the frontend (camelCase)."""
    return {
        "tier": plan.value,
        "requiresAccount": plan in ACCOUNT_TIERS,
        "scanLimit": scan_limit(plan),
        "windowHours": window_hours(plan),
        "maxFileBytes": max_file_bytes(plan),
        "contentTypes": CONTENT_TYPES[plan],
        "features": {name: can(plan, name) for name in FEATURES},
    }


def describe_all() -> list[dict]:
    return [describe(p) for p in PlanTier]
