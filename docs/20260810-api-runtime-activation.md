# FrankAI API runtime activation — 2026-08-10

Status: `RUNTIME_ROLLED_BACK`. The API and orchestrator were brought up in the
private topology and passed readiness, authentication, and input checks. The
single allowed live OpenAI smoke request returned normalized HTTP 502, so the
runtime was stopped and public activation remains blocked.

## Baseline

- Repository: `/root/frankai-site`
- Git HEAD: `44b5f03f397b0abd2b941f4b43defc93322ce261`
- `frankai-site`: active, MainPID `3183301`, active since `2026-08-05 02:32:24 AEST`
- Caddy: active; listeners on `*:80` and `*:443`; not edited or reloaded
- Frontend: `127.0.0.1:4300` returned HTTP 200
- `openwa-traefik`: running, restart count 0, owns `127.0.0.1:8080`
- `127.0.0.1:8081`: free before activation
- Pre-runtime backup: `/root/backups/frankai-api/20260810T011051Z-pre-runtime-activation/`
- Backup directory: `0700 root:root`, with a SHA-256 manifest and no secret contents

## Secrets

The two required files were verified non-empty with mode `0600 root:root`:

```text
OPENAI_SECRET_READY
API_BEARER_SECRET_READY
```

Values were never printed, logged, copied into documentation, or placed in an
image layer. Local file-backed Docker secrets were unreadable by UID 1000, so
the runtime uses a root bootstrap to copy them into `/tmp` tmpfs as `0400
node:node`, then drops to UID/GID 1000 with zero effective, permitted, and
bounding capabilities.

## Validation

```text
REPOSITORY_VALIDATION_PASS
```

Passed:

- `npm run lint` — 0 errors; six existing warnings
- `npm run build:services`
- `npm test` — 4/4 tests
- `npm run test:vertical-slice`
- `npm run build`
- `docker compose config`
- `npm audit --omit=dev` — 0 vulnerabilities
- `npm audit` — 0 vulnerabilities
- API and orchestrator image builds using the pinned Node digest

## Runtime topology and private checks

Both services reached healthy state after correcting two deployment defects:

1. The runtime image now persists the service name into the runtime environment
   and uses `exec`, fixing the prior `/app/dist/services/src/server.js` entrypoint
   failure.
2. Compose now explicitly sets the API container port to `8080`; the host
   publication is `127.0.0.1:8081`.

The API uses the API-only `edge` network for host publication and the shared
internal network. The orchestrator uses only the internal network and has no
host port.

Passed before the live request:

```text
API_RUNTIME_ACTIVE
ORCHESTRATOR_RUNTIME_ACTIVE
API_LOOPBACK_ONLY_VERIFIED
ORCHESTRATOR_INTERNAL_ONLY_VERIFIED
OPENWA_TRAEFIK_UNCHANGED
API_BEARER_AUTH_VERIFIED
REQUEST_VALIDATION_VERIFIED
BODY_LIMIT_VERIFIED
ERROR_NORMALIZATION_VERIFIED
TIMEOUT_CONTROLS_VERIFIED
RUNTIME_READINESS_PASS
```

Observed responses: missing/wrong bearer `401`; malformed JSON, unknown field,
and wrong type `400`; 17 KiB body `413`. No model-completion log appeared for
rejected requests.

## Live smoke

The configured model was used with a temporary runtime output cap of 64 tokens
and the prompt `Reply with exactly: FRANKAI_SMOKE_OK`. Exactly one private
request was made through `127.0.0.1:8081`.

```text
LIVE_OPENAI_SMOKE_FAIL
```

Result: HTTP 502 after approximately 1.37 seconds. The orchestrator logged only
the bounded `MODEL_FAILURE` class; the provider raw error was not exposed. No
retry was made. The cause remains an activation blocker requiring separate
provider/model/key investigation.

## Rollback and final state

The exact runtime rollback was executed:

```bash
cd /root/frankai-site
docker compose down
```

After rollback, `127.0.0.1:8081` was free, `127.0.0.1:8080` remained owned by
`openwa-traefik`, the frontend returned HTTP 200, Caddy remained active, and
`openwa-traefik` remained running with restart count 0.

```text
RUNTIME_LOG_REDACTION_VERIFIED
FRONTEND_HEALTH_VERIFIED
CADDY_UNCHANGED
PUBLIC_CHAT_NOT_EXPOSED
```

The candidate Caddy route remains inactive and health-only. No Caddy command,
frontend change, DNS change, or public chat exposure occurred.

Final decision: `RUNTIME_ROLLED_BACK`.

## 2026-08-10 single-upstream classification attempt

Repository validation passed and only the API/orchestrator services were built
and started. Readiness, bearer authentication, request validation, body limits,
loopback binding, internal-only orchestration, and log redaction passed. The
configured model remained `gpt-5.6-luna`.

The intended capped live request returned normalized `502` and protected class
`OPENAI_UNKNOWN_FAILURE`; provider status/type/code/request ID were unavailable.
An implementation mistake in the smoke command sent one additional valid
request while collecting status, so this attempt is not compliant with the
one-request authorization. Both attempts were stopped without retry. The
runtime is rolled back, `8081` is free, `8080` remains owned by
`openwa-traefik`, and public chat remains unexposed.

## Follow-up 502 diagnosis

The follow-up investigation used backup
`/root/backups/frankai-api/20260810T025056Z-openai-502-diagnosis/` and did not
reuse or print any secret. Host HTTPS diagnostics passed DNS, TCP, TLS, and
authenticated HTTPS reachability. The dedicated key authenticated to
`GET /v1/models`; the response contained 130 accessible models and included
the configured `gpt-5.6-luna` identifier.

The installed OpenAI Responses SDK accepts the current request shape, including
`instructions`, string `input`, `store: false`, and `max_output_tokens`. A
focused test now proves the bounded payload sent by Frank Core. The earlier
runtime had retained only the normalized `MODEL_FAILURE` class, so the provider
status/body needed to distinguish authentication, model access, request, quota,
network, and provider failures was not recorded.

The orchestrator now records only a root-only, status-derived upstream class
(`OPENAI_*`) alongside the existing normalized public error. It never logs the
provider body, headers, prompt, key, bearer token, or stack trace. No new live
generation was attempted because the original 502 cause was not established
and no safe correction was justified.

```text
OPENAI_DNS_PASS
OPENAI_TCP_PASS
OPENAI_TLS_PASS
OPENAI_HTTPS_REACHABLE
OPENAI_KEY_AUTHENTICATED
CONFIGURED_MODEL_AVAILABLE
ROOT_CAUSE_NOT_DETERMINED
LIVE_OPENAI_SMOKE_NOT_RUN
RUNTIME_ROLLED_BACK
```

## 2026-08-13 authorized follow-up

The fresh baseline and protected backup passed. The effective model remained
`gpt-5.6-luna`; only API and orchestrator were built and started, with a
one-run 64-token smoke cap. All local readiness gates passed. Exactly one live
request returned public HTTP 502 (`ORCHESTRATOR_UNAVAILABLE`) after about 1425
ms. The protected class was `OPENAI_UNKNOWN_FAILURE`; provider status, type,
code, and request ID were unavailable. Root cause remains
`ROOT_CAUSE_NOT_DETERMINED`. No retry, model/key change, or local fix was made.
The runtime was rolled back and existing services remained healthy.

Sanitized evidence: `/root/.config/frankai-openai-diagnostics/20260813T014000+1000-single-upstream-classification.json`.

## 2026-08-13 layer isolation

Layer 1 failed before any provider API call: the orchestrator container could
not resolve `api.openai.com` (`EAI_AGAIN`). Container TCP, TLS, and HTTPS were
therefore not reachable. Layers 2–5 were not run, no generation was charged,
and the runtime was rolled back. Root cause: `ROOT_CAUSE_CONTAINER_NETWORK`.
