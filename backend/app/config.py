"""Application configuration, loaded from environment / .env file."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- Core -------------------------------------------------------------
    app_name: str = "IA Inspector API"
    environment: str = "development"
    debug: bool = True

    # Comma-separated list of allowed browser origins.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # SQLAlchemy URL. Defaults to a local SQLite file so the API runs with
    # zero external services. Point at Postgres in production, e.g.
    # postgresql+psycopg://user:pass@localhost:5432/ia_inspector
    database_url: str = "sqlite:///./ia_inspector.db"

    # Public URL of the SPA, used for OAuth / magic-link redirects.
    frontend_url: str = "http://localhost:5173"
    # Public base URL of this API (used to build OAuth callback URLs).
    api_base_url: str = "http://localhost:8000"

    # --- Auth -----------------------------------------------------------
    jwt_secret: str = "dev-only-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_ttl_min: int = 30
    refresh_token_ttl_days: int = 30
    magic_link_ttl_min: int = 15
    # Random secret for the OAuth session middleware.
    session_secret: str = "dev-only-session-secret-change-me"

    # --- Quotas -------------------------------------------------------
    anon_scan_limit: int = 5
    anon_window_hours: int = 48
    pro_scan_limit: int = 300
    pro_window_hours: int = 24
    # premium is unlimited (no config needed)

    # --- File limits (bytes) — enforced client-side, echoed to the UI ---
    anon_max_file_bytes: int = 2 * 1024 * 1024
    pro_max_file_bytes: int = 50 * 1024 * 1024
    premium_max_file_bytes: int = 200 * 1024 * 1024

    # --- OAuth providers ------------------------------------------------
    # A provider is "enabled" as soon as both id and secret are present.
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    microsoft_client_id: str = ""
    microsoft_client_secret: str = ""
    microsoft_tenant: str = "common"
    facebook_client_id: str = ""
    facebook_client_secret: str = ""
    apple_client_id: str = ""
    apple_client_secret: str = ""
    twitter_client_id: str = ""
    twitter_client_secret: str = ""
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    discord_client_id: str = ""
    discord_client_secret: str = ""

    # --- SMTP (optional) — if unset, magic-link URLs are logged instead --
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "no-reply@ia-inspector.local"

    quota_debug_header: bool = Field(
        default=True,
        description="Expose X-Quota-* response headers (handy in dev).",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
