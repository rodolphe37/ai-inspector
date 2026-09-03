"""Pydantic request/response models. Field names use camelCase on the wire
to match the TypeScript frontend."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel

PlanLiteral = Literal["pro", "premium"]


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# --- Auth ----------------------------------------------------------------


class RegisterRequest(CamelModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8, max_length=200)
    plan: PlanLiteral = "pro"


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class RefreshRequest(CamelModel):
    refresh_token: str


class MagicRequest(CamelModel):
    email: EmailStr
    name: str | None = Field(default=None, max_length=120)
    plan: PlanLiteral = "pro"


class MagicConsumeRequest(CamelModel):
    token: str


class OAuthExchangeRequest(CamelModel):
    code: str


class UserOut(CamelModel):
    id: str
    email: EmailStr
    name: str
    plan: str
    avatar_url: str | None = None
    has_password: bool = True
    created_at: datetime


class TokenPair(CamelModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class AnonSessionOut(CamelModel):
    anon_id: str


class OAuthProviderOut(CamelModel):
    id: str
    name: str
    authorize_url: str


class MagicLinkIssued(CamelModel):
    sent: bool
    # Present only in dev when SMTP is not configured.
    debug_url: str | None = None


# --- Settings ----------------------------------------------------------


class AccountSettings(CamelModel):
    email: str = ""
    name: str = ""
    plan: str = "pro"


class AppearanceSettings(CamelModel):
    theme: Literal["dark", "light", "system"] = "dark"
    density: Literal["comfortable", "compact"] = "comfortable"


class PrivacySettings(CamelModel):
    local_processing: bool = True
    store_history: bool = True
    telemetry: bool = False
    show_demo_labels: bool = False


class AnalysisSettings(CamelModel):
    detailed_results: bool = True
    show_statistical_data: bool = True
    show_technical_info: bool = True


class NotificationSettings(CamelModel):
    email_alerts: bool = False
    analysis_complete: bool = True
    security_alerts: bool = True


class UserSettingsOut(CamelModel):
    account: AccountSettings = AccountSettings()
    appearance: AppearanceSettings = AppearanceSettings()
    privacy: PrivacySettings = PrivacySettings()
    analysis: AnalysisSettings = AnalysisSettings()
    notifications: NotificationSettings = NotificationSettings()


class UserSettingsUpdate(CamelModel):
    appearance: AppearanceSettings | None = None
    privacy: PrivacySettings | None = None
    analysis: AnalysisSettings | None = None
    notifications: NotificationSettings | None = None
    name: str | None = Field(default=None, max_length=120)


# --- Quota -----------------------------------------------------------


class QuotaStatus(CamelModel):
    tier: str
    limit: int | None
    used: int
    remaining: int | None
    window_hours: int
    resets_at: datetime | None
    unlimited: bool = False


class ConsumeRequest(CamelModel):
    kind: Literal["analysis", "clean"] = "analysis"


# --- Analyses --------------------------------------------------------


class AnalysisCreate(CamelModel):
    id: str | None = None
    name: str
    type: str
    status: str
    score: int = 0
    signal_level: str = "clean"
    ai_verdict: str = "no_evidence"
    ai_probability: int = 0
    size: int | None = None
    language: str | None = None
    result: dict[str, Any] = Field(default_factory=dict)


class AnalysisSummary(CamelModel):
    id: str
    name: str
    type: str
    date: datetime
    status: str
    score: int
    signal_level: str
    ai_verdict: str = "no_evidence"
    ai_probability: int = 0
    size: int | None = None
    language: str | None = None


class AnalysisOut(AnalysisSummary):
    result: dict[str, Any]


# --- Dashboard ------------------------------------------------------


class DashboardStats(CamelModel):
    analyses: int
    signals_detected: int
    clean_files: int
    known_fingerprints: int


class ActivityPoint(CamelModel):
    date: str
    analyses: int
    signals: int


class DashboardOut(CamelModel):
    stats: DashboardStats
    activity: list[ActivityPoint]
    recent: list[AnalysisSummary]


# --- Fingerprints --------------------------------------------------


class FingerprintOut(CamelModel):
    id: str
    name: str
    provider: str
    type: str
    version: str
    status: str
    description: str
    last_updated: str
    confidence: int
    detection_method: str
    target_content: str
    coverage: str
    references: list[str] = []


# --- Billing --------------------------------------------------------


class UpgradeRequest(CamelModel):
    plan: PlanLiteral
