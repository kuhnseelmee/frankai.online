# Authentication

FrankAI uses short-lived HS256 access JWTs and rotating, server-side refresh sessions. Both tokens are `Secure`, `HttpOnly` cookies; the browser obtains session state from `GET /api/auth/me`. Refresh tokens are stored only as SHA-256 hashes under `AUTH_DATA_DIR` and are revoked on logout and reuse detection.

PostgreSQL is now the staged authoritative store when `DATABASE_URL` and `AUTH_DATABASE_ENABLED=true` are set. Migrations are explicit and run with `npm run db:migrate`; `npm run auth:migrate-file` imports the previous file-backed users, revokes old refresh sessions, quarantines malformed records, and writes a report. The file-backed store remains only as an emergency fallback and must not be used for production activation.

State-changing browser requests require the readable `frankai_csrf` cookie to match `X-CSRF-Token`. CORS is same-origin by default; do not add wildcard credentialed origins.

Public signup is disabled by default (`PUBLIC_SIGNUP_ENABLED=false`). Invitation-only signup is the intended production policy. Administrator MFA uses encrypted TOTP secrets and one-time hashed recovery codes; `MFA_ENCRYPTION_KEY` is required before enrollment.
