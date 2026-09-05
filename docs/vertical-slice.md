# FrankAI vertical slice

This slice is intentionally limited to:

`Browser -> Caddy -> API -> orchestrator -> frank-core -> response`

The API is published by Compose only on `127.0.0.1:${FRANKAI_API_PORT:-8081}`.
The orchestrator has no host-published port and is reachable only on Compose's
internal network. The existing Next.js frontend remains on `127.0.0.1:4300`.

## Secrets

Create the files interactively on the host; do not put values in `.env` or Compose:

```bash
umask 077
install -d -m 700 /root/frankai-site/secrets
read -r -s -p 'Dedicated FrankAI OpenAI API key: ' OPENAI_KEY
printf '\n' >&2
printf '%s\n' "$OPENAI_KEY" > /root/frankai-site/secrets/openai_api_key
unset OPENAI_KEY
openssl rand -hex 32 > /root/frankai-site/secrets/api_bearer_token
chmod 600 /root/frankai-site/secrets/openai_api_key /root/frankai-site/secrets/api_bearer_token
```

The OpenAI key is mounted only into the orchestrator. The bearer token is mounted
into both isolated services for API-to-orchestrator authentication and controlled
local administration; it is never sent by browsers. Rotate either by replacing its file with mode `0600` and
recreating only the isolated FrankAI Compose services after approval. The first
production key should be a dedicated project-scoped key with separate limits.
The current environment-provided development key must not be persisted as either
file.

## Authentication boundary

The bearer token is a service boundary for controlled local administration only.
It must never appear in frontend source, browser storage, rendered HTML, public
environment variables, API responses, client bundles, fixtures, or logs. The
OpenAI key is accepted only from the orchestrator's mounted secret file.

The public Caddy candidate is health-only. `/v1/chat` remains inaccessible through
Caddy until browser authentication, authorization, abuse controls, and rate
limiting are implemented.

The existing frontend auth system is suitable for the next phase: it already uses
secure `HttpOnly` `__Host-` access/refresh cookies, a separate CSRF cookie and
header, origin validation, refresh rotation, and `/api/auth/me`. The recommended
browser path is a same-origin Next.js server-side proxy that validates the existing
session and CSRF/origin policy, applies per-user authorization and rate limits, then
calls this private API with the bearer token server-side. Browser JavaScript should
never receive or send the service token.

## Local validation

```bash
npm ci
npm run lint
npm run build:services
npm run test:vertical-slice
docker compose config
```

The integration test uses a mocked model and does not need secrets. For a local
HTTP smoke test, start an isolated mock orchestrator and API with `ORCHESTRATOR_MODEL_MODE=mock`,
`API_BEARER_TOKEN_FILE` pointing to a temporary `0600` token file, and
`FRANKAI_API_PORT=8081`; do not use the production service or port 4300.

## Caddy route behavior

The candidate in `deploy/Caddyfile.frankai-api.route.candidate` is health-only.
Its `handle_path /api/*` strips `/api`, but only `/health/live` and
`/health/ready` are proxied; `/api/v1/chat` receives 404. Insert it before the existing
catch-all `handle` inside the `frankai.online, www.frankai.online` site block only
after public browser authentication is ready. The active Caddyfile has not been
changed or reloaded.

## Operations and limitations

Compose uses a root-only bootstrap only to copy file-backed secrets into the
existing `/tmp` tmpfs; the Node processes then run as UID/GID 1000 with a zero
capability bounding set. Host secret files remain `0600 root:root`, no secret is
copied into an image layer, and the temporary files disappear with the
container. The services otherwise use read-only root filesystems, dropped
capabilities, `no-new-privileges`, resource limits, restart policies, health
checks, and bounded JSON log files. Inspect service logs with
`docker compose logs --tail=200 api orchestrator`; request bodies, model responses,
provider errors, and secrets are not logged by the application. This slice has no
accounts, persistent conversation state, tools, browsing, memory, RAG, queues, or
multi-agent delegation. The bearer token is a temporary deployment gate, not full
user authentication.

## Deployment and rollback

Validate locally first, then obtain explicit approval before activation. If a Caddy
change is later approved, record the exact backup path:

```bash
CADDY_BACKUP="/etc/caddy/Caddyfile.bak-$(date -u +%Y%m%dT%H%M%SZ)"
sudo cp -p /etc/caddy/Caddyfile "$CADDY_BACKUP"
printf 'Caddy backup: %s\n' "$CADDY_BACKUP"
```

Rollback must use that recorded path:

```bash
sudo cp -p "$CADDY_BACKUP" /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Never stop or modify `openwa-traefik`.

The API is attached to an API-only `edge` network for Docker's loopback port
publication and to the `internal` network shared with the orchestrator. The
orchestrator is attached only to `internal` and has no host-published port.

## Upstream diagnostics

The public API continues to return only normalized model errors. The orchestrator
may record a root-only status classification such as `OPENAI_AUTH_FAILURE`,
`OPENAI_MODEL_NOT_FOUND`, `OPENAI_INVALID_REQUEST`, `OPENAI_QUOTA_FAILURE`,
`OPENAI_TIMEOUT`, or `OPENAI_UPSTREAM_5XX`. These records contain no provider
body, authorization header, secret, prompt, or stack trace. A future live smoke
failure must be diagnosed from that bounded class before changing the configured
model or request implementation.

The 2026-08-10 live attempt classified the observed provider failure as
`OPENAI_UNKNOWN_FAILURE`; no provider status/type/code was retained. The
attempt is invalid for release evidence because the smoke wrapper accidentally
sent two valid requests. The runtime was stopped and the root cause remains
`ROOT_CAUSE_NOT_DETERMINED`.

The 2026-08-13 authorized follow-up made exactly one capped live request. It
returned public HTTP 502 (`ORCHESTRATOR_UNAVAILABLE`) and protected class
`OPENAI_UNKNOWN_FAILURE`; provider status/type/code/request ID were unavailable.
The runtime was rolled back without retry and the root cause remains
`ROOT_CAUSE_NOT_DETERMINED`. Sanitized evidence is root-only under
`/root/.config/frankai-openai-diagnostics/`.

The 2026-08-13 layer-isolation run failed at Layer 1 inside the orchestrator
container: DNS for `api.openai.com` returned `EAI_AGAIN`. No model-list or
generation request was made, and Layers 2–5 were not run. The root cause is
`ROOT_CAUSE_CONTAINER_NETWORK`; the runtime was rolled back.
