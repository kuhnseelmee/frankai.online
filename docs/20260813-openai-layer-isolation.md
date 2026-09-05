# FrankAI OpenAI layer isolation — 2026-08-13

## Result

The first diagnostic layer failed inside the actual orchestrator container:

```text
ORCHESTRATOR_CONTAINER_DNS_FAIL
ORCHESTRATOR_CONTAINER_TCP_FAIL
ORCHESTRATOR_CONTAINER_TLS_FAIL
ORCHESTRATOR_CONTAINER_HTTPS_FAIL
ROOT_CAUSE_CONTAINER_NETWORK
```

DNS resolution for `api.openai.com` returned `EAI_AGAIN`. TCP, TLS, and HTTPS
were consequently not reachable from that network namespace. No authenticated
models request and no generation request were made after this failure.

## Baseline and backup

- Frontend: PID `3183301`, HTTP 200; active since `2026-08-05 02:32:24 AEST`
- Caddy: active
- `openwa-traefik`: unchanged and owns `127.0.0.1:8080`
- `127.0.0.1:8081`: free before and after the run
- Backup: `/root/backups/frankai-api/20260813T033212+1000-openai-layer-isolation/`
- Effective model: `gpt-5.6-luna`
- Secrets: `OPENAI_SECRET_READY`, `API_BEARER_SECRET_READY`

The backup is root-owned with a `0700` directory and SHA-256 manifest. Secret
values were not copied into documentation or evidence.

## Client and validation

```text
OPENAI_CLIENT=openai
OPENAI_CLIENT_VERSION=7.4.0
OPENAI_ENDPOINT=https://api.openai.com/v1
```

The application uses `responses.create()` with `instructions`, string `input`,
`max_output_tokens`, `store: false`, and `AbortSignal.timeout`. Sanitized
exception provenance was added for transport, SDK, API, abort, parse, and
application-wrapper categories without serializing unknown errors.

Focused validation passed: lint (six pre-existing warnings, zero errors),
service build, full tests, vertical-slice tests, Compose config, and diff check.
The API and orchestrator hardened images built successfully.

## Layer results

| Layer | Result |
|---|---|
| Container DNS/TCP/TLS/HTTPS | `FAIL` — DNS `EAI_AGAIN` |
| Container authenticated `/v1/models` | `NOT_RUN` |
| Raw Responses API generation | `NOT_RUN` |
| Direct OpenAI SDK generation | `NOT_RUN` |
| FrankAI orchestrator generation | `NOT_RUN` |
| Private API integration | `NOT_RUN` |

No chargeable generation request was made in this run.

Protected evidence is stored at
`/root/.config/frankai-openai-diagnostics/20260813T034000+1000-openai-layer-isolation.json`
with mode `0600 root:root`; the directory is `0700 root:root`.

## Rollback and security

The private runtime was stopped immediately after the Layer 1 failure. After
rollback, 8081 was free, 8080 remained owned by `openwa-traefik`, frontend and
public HTTPS returned 200, and Caddy remained active. Logs passed redaction
checks. Caddy and the production frontend were not changed; public chat was not
exposed.

Final decision: `RUNTIME_ROLLED_BACK`.
