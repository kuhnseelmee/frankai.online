# 2026-08-10 single upstream classification

## Baseline

- Frontend PID `3183301`, active since `2026-08-05 02:32:24 AEST`; HTTP `200`.
- Caddy active; public HTTPS HTTP `200`.
- `openwa-traefik` healthy and unchanged; it owned `127.0.0.1:8080`.
- `127.0.0.1:8081` was free before activation and after rollback.
- Protected backup: `/root/backups/frankai-api/20260810T134736+1000-single-upstream-classification/`.

## Secrets and validation

`OPENAI_SECRET_READY` and `API_BEARER_SECRET_READY` passed without disclosure.
The effective model was `gpt-5.6-luna`. Lint, service build, full tests,
vertical-slice tests, Compose config, and `git diff --check` passed:
`REPOSITORY_VALIDATION_PASS`.

## Runtime and readiness

Only the API and orchestrator were started. The API was loopback-only on
`127.0.0.1:8081`; the orchestrator was internal-only. Liveness/readiness,
authentication, request validation, body limits, and pre/post-request log
redaction checks passed.

## Live result

The intended capped request returned normalized API `502` and the protected
classifier `OPENAI_UNKNOWN_FAILURE`. Provider HTTP status, error type, error
code, and provider request ID were unavailable. Latency was approximately
`1344 ms`; the root cause is `ROOT_CAUSE_NOT_DETERMINED`.

The smoke wrapper accidentally sent a second valid request while attempting to
read the first status. It also returned normalized `502` and
`OPENAI_UNKNOWN_FAILURE` at approximately `1253 ms`. This run therefore did not
meet the exactly-one-request constraint. No further requests, model changes,
key changes, retries, or local fixes were made.

`RUNTIME_LOG_REDACTION_VERIFIED` passed. The private runtime was stopped:
`RUNTIME_ROLLED_BACK`. Frontend, Caddy, OpenWA Traefik, and public routing were
unchanged; `PUBLIC_CHAT_NOT_EXPOSED`.

Final decision: `NOT_READY_FOR_RUNTIME`.

## 2026-08-13 authorized follow-up

Fresh baseline, protected backup, validation, private readiness, and redaction
checks passed. The configured model remained `gpt-5.6-luna`. Exactly one capped
live request returned public HTTP 502 (`ORCHESTRATOR_UNAVAILABLE`) after about
1425 ms. Protected classification was `OPENAI_UNKNOWN_FAILURE`; provider
status/type/code/request ID were unavailable. Root cause is
`ROOT_CAUSE_NOT_DETERMINED`. Runtime rollback completed; frontend, Caddy,
public HTTPS, and `openwa-traefik` remained unchanged. Public chat was not
exposed.

Evidence: `/root/.config/frankai-openai-diagnostics/20260813T014000+1000-single-upstream-classification.json`.
