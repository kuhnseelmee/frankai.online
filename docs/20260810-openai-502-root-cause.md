# FrankAI OpenAI 502 diagnosis — 2026-08-10

Status: `ROOT_CAUSE_NOT_DETERMINED`. The private runtime remains rolled back.
No second live generation was made.

## Baseline and evidence

- Repository: `/root/frankai-site`
- Diagnostic backup: `/root/backups/frankai-api/20260810T025056Z-openai-502-diagnosis/`
- Backup directory: `0700 root:root`, with a SHA-256 manifest
- API/orchestrator: stopped; `127.0.0.1:8081` free
- `openwa-traefik`: unchanged; continues to own `127.0.0.1:8080`
- Frontend: `127.0.0.1:4300` remained healthy
- Caddy: active and unchanged; no reload or restart

The required secret files were checked only for permissions and non-empty state:

```text
OPENAI_SECRET_READY
API_BEARER_SECRET_READY
OPENAI_KEY_FORMAT_PLAUSIBLE=true
```

Secret values were never printed, copied into the backup, or written to this
document.

## OpenAI connectivity and access

```text
OPENAI_DNS_PASS
OPENAI_TCP_PASS
OPENAI_TLS_PASS
OPENAI_HTTPS_REACHABLE
OPENAI_KEY_AUTHENTICATED
CONFIGURED_MODEL=gpt-5.6-luna
CONFIGURED_MODEL_AVAILABLE
```

The authenticated models response contained 130 accessible models and included
`gpt-5.6-luna`. This proves network reachability, key authentication, and model
list visibility, but does not prove that a generation request for this model
succeeds under the project’s execution entitlements.

Protected diagnostic evidence is under
`/root/.config/frankai-openai-diagnostics/` with directory mode `0700` and files
mode `0600`, root-owned. Raw provider response material is not included in this
repository documentation or normal application logs.

## Request inspection

The installed OpenAI SDK is used through `/v1/responses`. The request contains:

- configured model identifier;
- Frank Core `instructions`;
- the validated user message as `input`;
- `max_output_tokens` (the Responses API parameter), capped to 64 for a smoke;
- `store: false`;
- an abort signal bounded by the configured model timeout.

A focused test proves this payload offline. No request-field correction was
justified from the available evidence.

## Root-cause classification

The previous single live request returned normalized HTTP 502 in approximately
1.37 seconds. Its provider status/body was not retained, by design, so it cannot
be retrospectively classified as authentication, model access, invalid request,
quota, timeout, network, or provider failure.

The orchestrator now adds a bounded root-only classifier based on provider status
and timeout/network error class. Public behavior remains `MODEL_FAILURE`; the
classifier does not log provider bodies, headers, secrets, prompts, or stacks.

```text
ROOT_CAUSE_NOT_DETERMINED
LIVE_OPENAI_SMOKE_NOT_RUN
```

No model change, key substitution, readiness bypass, or blind retry was made.
The next approved diagnostic run may make exactly one capped generation after
capturing the new bounded classification; a model change is justified only if
that evidence identifies model availability or access as the cause.

## Validation

```text
REPOSITORY_VALIDATION_PASS
```

Passed: lint (0 errors, 6 pre-existing warnings), service build, full tests,
vertical-slice tests, frontend build, Compose config, `npm audit --omit=dev`
(0 vulnerabilities), `npm audit` (0 vulnerabilities), and `git diff --check`.

The runtime was not reactivated because the root cause was not safely corrected.
The public chat route remains disabled.

Final decision: `RUNTIME_ROLLED_BACK`.

## 2026-08-10 protected runtime attempt

The protected runtime was started after focused validation passed. The effective
model remained `gpt-5.6-luna`; the API was loopback-only on `127.0.0.1:8081` and
the orchestrator had no host-published port. The intended smoke returned the
existing normalized `502` failure and the protected classifier recorded
`OPENAI_UNKNOWN_FAILURE`. No provider HTTP status, error type, error code, or
provider request ID was available. The observed latency was approximately
1344 ms.

A scripting error then issued a second valid smoke request while attempting to
read the first request's HTTP status separately. This was outside the one-request
authorization. It also returned normalized `502` with
`OPENAI_UNKNOWN_FAILURE` at approximately 1253 ms. No further generation was
attempted. The root cause remains `ROOT_CAUSE_NOT_DETERMINED`; no local fix was
made. The runtime was rolled back immediately.

Protected evidence is at
`/root/.config/frankai-openai-diagnostics/20260810-single-upstream-classification.json`.
Provider bodies and secrets are not present in the record or logs.

## 2026-08-13 authorized follow-up

Fresh baseline was healthy: frontend HTTP 200, Caddy active, `openwa-traefik`
owning `127.0.0.1:8080`, and `127.0.0.1:8081` free. The effective model stayed
`gpt-5.6-luna`. Validation, hardened builds, private readiness gates, and
redaction checks passed. Exactly one capped live request returned public HTTP
502 (`ORCHESTRATOR_UNAVAILABLE`) after approximately 1425 ms. The protected
class was `OPENAI_UNKNOWN_FAILURE`; provider status, type, code, and request ID
were unavailable. Root cause remains `ROOT_CAUSE_NOT_DETERMINED`. No retry or
correction was made; the runtime was rolled back.

Evidence: `/root/.config/frankai-openai-diagnostics/20260813T014000+1000-single-upstream-classification.json`.

## 2026-08-13 layer isolation

The actual orchestrator container failed Layer 1 DNS resolution for
`api.openai.com` with `EAI_AGAIN`. Container TCP, TLS, and HTTPS checks all
failed as a consequence. No model-list or generation request was made. The
failure is classified as `ROOT_CAUSE_CONTAINER_NETWORK`, not an OpenAI account,
model, request, SDK, or FrankAI application result. The private runtime was
rolled back and all host boundaries remained healthy.
