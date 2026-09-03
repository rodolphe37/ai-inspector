"""OAuth provider registry (Authlib) and a normalised user-info fetcher.

A provider is available as soon as its CLIENT_ID + CLIENT_SECRET are set in the
environment. The frontend only renders buttons for providers returned by
``GET /api/auth/oauth/providers``.
"""

from __future__ import annotations

from dataclasses import dataclass

import httpx
from authlib.integrations.starlette_client import OAuth

from .config import settings


@dataclass
class ProviderSpec:
    id: str
    display_name: str
    kwargs: dict
    # How to turn a token into {sub, email, name, avatar_url}
    userinfo: str  # "oidc" | custom key handled in fetch_userinfo


_SPECS: list[ProviderSpec] = [
    ProviderSpec(
        "google",
        "Google",
        {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "server_metadata_url": "https://accounts.google.com/.well-known/openid-configuration",
            "client_kwargs": {"scope": "openid email profile"},
        },
        "oidc",
    ),
    ProviderSpec(
        "microsoft",
        "Microsoft",
        {
            "client_id": settings.microsoft_client_id,
            "client_secret": settings.microsoft_client_secret,
            "server_metadata_url": (
                f"https://login.microsoftonline.com/{settings.microsoft_tenant}"
                "/v2.0/.well-known/openid-configuration"
            ),
            "client_kwargs": {"scope": "openid email profile"},
        },
        "oidc",
    ),
    ProviderSpec(
        "linkedin",
        "LinkedIn",
        {
            "client_id": settings.linkedin_client_id,
            "client_secret": settings.linkedin_client_secret,
            "server_metadata_url": "https://www.linkedin.com/oauth/.well-known/openid-configuration",
            "client_kwargs": {"scope": "openid profile email"},
        },
        "oidc",
    ),
    ProviderSpec(
        "apple",
        "Apple",
        {
            "client_id": settings.apple_client_id,
            "client_secret": settings.apple_client_secret,
            "server_metadata_url": "https://appleid.apple.com/.well-known/openid-configuration",
            "client_kwargs": {"scope": "name email", "response_mode": "form_post"},
        },
        "oidc",
    ),
    ProviderSpec(
        "github",
        "GitHub",
        {
            "client_id": settings.github_client_id,
            "client_secret": settings.github_client_secret,
            "access_token_url": "https://github.com/login/oauth/access_token",
            "authorize_url": "https://github.com/login/oauth/authorize",
            "api_base_url": "https://api.github.com/",
            "client_kwargs": {"scope": "read:user user:email"},
        },
        "github",
    ),
    ProviderSpec(
        "discord",
        "Discord",
        {
            "client_id": settings.discord_client_id,
            "client_secret": settings.discord_client_secret,
            "access_token_url": "https://discord.com/api/oauth2/token",
            "authorize_url": "https://discord.com/api/oauth2/authorize",
            "api_base_url": "https://discord.com/api/",
            "client_kwargs": {"scope": "identify email"},
        },
        "discord",
    ),
    ProviderSpec(
        "facebook",
        "Facebook",
        {
            "client_id": settings.facebook_client_id,
            "client_secret": settings.facebook_client_secret,
            "access_token_url": "https://graph.facebook.com/v19.0/oauth/access_token",
            "authorize_url": "https://www.facebook.com/v19.0/dialog/oauth",
            "api_base_url": "https://graph.facebook.com/v19.0/",
            "client_kwargs": {"scope": "email public_profile"},
        },
        "facebook",
    ),
    ProviderSpec(
        "twitter",
        "X",
        {
            "client_id": settings.twitter_client_id,
            "client_secret": settings.twitter_client_secret,
            "access_token_url": "https://api.twitter.com/2/oauth2/token",
            "authorize_url": "https://twitter.com/i/oauth2/authorize",
            "api_base_url": "https://api.twitter.com/2/",
            "client_kwargs": {
                "scope": "users.read tweet.read",
                "code_challenge_method": "S256",
                "token_endpoint_auth_method": "client_secret_post",
            },
        },
        "twitter",
    ),
]

oauth = OAuth()
_ENABLED: dict[str, ProviderSpec] = {}

for spec in _SPECS:
    if spec.kwargs.get("client_id") and spec.kwargs.get("client_secret"):
        oauth.register(name=spec.id, **spec.kwargs)
        _ENABLED[spec.id] = spec


def enabled_providers() -> list[dict]:
    return [{"id": s.id, "name": s.display_name} for s in _ENABLED.values()]


def is_enabled(provider: str) -> bool:
    return provider in _ENABLED


@dataclass
class NormalizedProfile:
    provider: str
    provider_account_id: str
    email: str | None
    name: str
    avatar_url: str | None


async def fetch_userinfo(provider: str, token: dict) -> NormalizedProfile:
    spec = _ENABLED[provider]
    client = oauth.create_client(provider)

    if spec.userinfo == "oidc":
        info = token.get("userinfo")
        if not info:
            info = await client.userinfo(token=token)
        return NormalizedProfile(
            provider=provider,
            provider_account_id=str(info.get("sub") or info.get("id")),
            email=info.get("email"),
            name=info.get("name") or info.get("email", "").split("@")[0] or "User",
            avatar_url=info.get("picture"),
        )

    headers = {"Authorization": f"Bearer {token['access_token']}"}
    async with httpx.AsyncClient(timeout=10) as hc:
        if spec.userinfo == "github":
            u = (await hc.get("https://api.github.com/user", headers=headers)).json()
            email = u.get("email")
            if not email:
                emails = (
                    await hc.get("https://api.github.com/user/emails", headers=headers)
                ).json()
                primary = next(
                    (e for e in emails if e.get("primary") and e.get("verified")), None
                )
                email = primary["email"] if primary else (emails[0]["email"] if emails else None)
            return NormalizedProfile(
                "github", str(u["id"]), email, u.get("name") or u.get("login"), u.get("avatar_url")
            )

        if spec.userinfo == "discord":
            u = (await hc.get("https://discord.com/api/users/@me", headers=headers)).json()
            avatar = (
                f"https://cdn.discordapp.com/avatars/{u['id']}/{u['avatar']}.png"
                if u.get("avatar")
                else None
            )
            return NormalizedProfile(
                "discord", str(u["id"]), u.get("email"),
                u.get("global_name") or u.get("username"), avatar,
            )

        if spec.userinfo == "facebook":
            u = (
                await hc.get(
                    "https://graph.facebook.com/v19.0/me",
                    params={"fields": "id,name,email,picture"},
                    headers=headers,
                )
            ).json()
            pic = u.get("picture", {}).get("data", {}).get("url")
            return NormalizedProfile("facebook", str(u["id"]), u.get("email"), u.get("name"), pic)

        if spec.userinfo == "twitter":
            u = (
                await hc.get(
                    "https://api.twitter.com/2/users/me",
                    params={"user.fields": "profile_image_url"},
                    headers=headers,
                )
            ).json().get("data", {})
            # X does not expose email via the v2 API for most apps.
            return NormalizedProfile(
                "twitter", str(u.get("id")), None,
                u.get("name") or u.get("username") or "X user",
                u.get("profile_image_url"),
            )

    raise RuntimeError(f"Unsupported provider userinfo: {provider}")
