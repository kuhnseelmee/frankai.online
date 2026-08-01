# Deployment

This app deploys as Next.js standalone output through systemd service `frankai-site.service` on `127.0.0.1:4300`, behind Caddy. **OBSERVED 2026-08-01:** production authentication is PostgreSQL-backed using the `frankai_auth` database and a dedicated runtime role. Copy approved variables from `deploy/frankai-site.env.example` into the root-readable service environment, generate secrets with `openssl rand -hex 32`, set `AUTH_STORE=postgres`, `DATABASE_URL`, `AUTH_DATABASE_ENABLED=true`, and keep the file mode `0600`.

Run `npm run db:migrate`, `npm run lint`, `npm test`, `npm run build`, restart only after review, then run `READINESS_BASE_URL=http://127.0.0.1:4300 npm run readiness` and HTTPS smoke tests. Do not enable public signup or voice until MFA, migration, recovery, privacy, and cost-control gates pass.
# Authentication staging boundary

The staging candidate uses `frankai-site-staging.service` on port 4500 and a
dedicated PostgreSQL database. Its standalone service entrypoint is
`.next/standalone/server.js`; the versioned template is
`deploy/frankai-site-staging.service`. Do not switch the production service or
Caddy route during staging acceptance. Production remediation additionally
requires provider-side Hostinger token rotation confirmation, SMTP readiness,
migration and current-release restore evidence, administrator MFA enrollment,
and explicit approval.
