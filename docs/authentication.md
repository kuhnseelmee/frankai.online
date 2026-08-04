# Authentication

FrankAI uses short-lived HS256 access JWTs and rotating, server-side refresh sessions. Both tokens are `Secure`, `HttpOnly` cookies; the browser obtains session state from `GET /api/auth/me`. Refresh tokens are stored only as SHA-256 hashes under `AUTH_DATA_DIR` and are revoked on logout and reuse detection.

PostgreSQL is the active production and staging authority when `AUTH_STORE=postgres`, `DATABASE_URL`, and `AUTH_DATABASE_ENABLED=true` are set. Production currently uses the `frankai_auth` database and staging uses `frankai_auth_staging`. Migrations are explicit and run with `npm run db:migrate`; `npm run auth:migrate-file` imports the previous file-backed users, revokes old refresh sessions, quarantines malformed records, and writes a report. The file-backed store remains only as an explicit development or emergency fallback and must not be selected implicitly in production.

State-changing browser requests require the readable `frankai_csrf` cookie to match `X-CSRF-Token`. CORS is same-origin by default; do not add wildcard credentialed origins.

Public signup is disabled by default (`PUBLIC_SIGNUP_ENABLED=false`). Invitation-only signup is the intended production policy. Administrator MFA uses encrypted TOTP secrets and one-time hashed recovery codes; `MFA_ENCRYPTION_KEY` is required before enrollment.

Authentication acceptance uses an explicit email registry. Invitation,
verification, password-reset, and password-changed notifications are active
only through their existing application events. MFA-disabled, administrator
security-alert, and new-login renderers are reserved and fail closed until a
future policy defines their trigger, recipient, and retry semantics. Audit
metadata is recursively redacted by key and value pattern before persistence.
# Current deployment boundary

**OBSERVED 2026-08-01:** production is PostgreSQL-backed and active on
`frankai-site.service` port 4300. The operational state is not equivalent to
formal cutover approval; the approval record remains unresolved. Staging is
PostgreSQL-backed on port 4500 with a separate database and Mailpit capture.
Invitation-only registration, secure cookies, CSRF/Origin checks, rotating
refresh sessions, email workflows, MFA, recent reauthentication, audit logging,
and PostgreSQL rate-limit buckets are implemented. Current staging acceptance
remains partial only for privileged SMTP outbox inspection and complete
semantic audit-category observation. Voice is explicitly disabled and is not
part of this phase.
