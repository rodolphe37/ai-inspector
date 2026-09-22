# Self-hosting with Docker + Traefik

AI Inspector is a static site. The image (`frontend/Dockerfile`) builds it and
serves it with an unprivileged nginx on port 8080 (SPA fallback, cache and
security headers). TLS is left to your reverse proxy.

## Run it

```bash
docker run -d -p 8080:8080 ghcr.io/rodolphe37/ai-inspector:latest
```

## Behind Traefik

1. On the server, create a folder (for example `/opt/ai-inspector`) with
   [`docker-compose.yml`](docker-compose.yml) and a `.env` copied from
   [`.env.example`](.env.example) (domain, Traefik network, entrypoint,
   certificate resolver).
2. `docker compose up -d`.

## Continuous deployment

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) builds the
image on every push to `main`, publishes it to GHCR and, when the repository
secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` and `VPS_SSH_KNOWN_HOSTS` are set,
runs `docker compose pull && docker compose up -d` on the server over SSH.
Use a dedicated SSH key whose user can only run Docker in the app folder.
