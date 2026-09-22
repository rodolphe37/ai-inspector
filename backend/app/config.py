"""Application configuration, loaded from environment / .env file."""

from __future__ import annotations

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "AI Inspector API"
    environment: str = "development"

    # Comma-separated list of allowed browser origins.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Optional regex for extra origins, e.g. Netlify deploy previews:
    # https://.*--your-site\.netlify\.app
    cors_origin_regex: str = ""

    # SQLAlchemy URL. Defaults to a local SQLite file so the API runs with
    # zero external services. Point at Postgres in production. Plain
    # ``postgres://`` / ``postgresql://`` URLs (Neon, Render, Heroku...) are
    # rewritten to the psycopg 3 driver automatically.
    database_url: str = "sqlite:///./ai_inspector.db"

    # --- Hardening (the API is public and unauthenticated) -----------------
    # Requests allowed per client IP per minute (0 disables the limiter).
    rate_limit_per_minute: int = 120
    # Comma-separated Host header allow-list, e.g. "ai-inspector-api.onrender.com".
    # Empty = accept any host (fine locally; set it in production).
    allowed_hosts: str = ""
    # Interactive API docs (/docs, /redoc, /openapi.json). Default: on in
    # development, off in production.
    enable_docs: bool | None = None

    @field_validator("database_url")
    @classmethod
    def _psycopg_driver(cls, v: str) -> str:
        for prefix in ("postgres://", "postgresql://"):
            if v.startswith(prefix):
                return "postgresql+psycopg://" + v[len(prefix):]
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def docs_enabled(self) -> bool:
        return not self.is_production if self.enable_docs is None else self.enable_docs

    @property
    def allowed_host_list(self) -> list[str]:
        return [h.strip() for h in self.allowed_hosts.split(",") if h.strip()]

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
