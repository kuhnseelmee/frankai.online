# Deployment

This app deploys as Next.js standalone output through systemd service `frankai-site.service` on `127.0.0.1:4300`, behind Caddy. PostgreSQL is staged in the existing localhost-only `ray-postgres` container on port 6432 with a dedicated database/role; the production service is not yet configured to use it. Copy approved variables from `deploy/frankai-site.env.example` into the root-readable service environment, generate secrets with `openssl rand -hex 32`, set `AUTH_DATA_DIR=/var/lib/frankai-site/auth`, `DATABASE_URL`, `AUTH_DATABASE_ENABLED=true`, and keep the file mode `0600`.

Run `npm run db:migrate`, `npm run lint`, `npm test`, `npm run build`, restart only after review, then run `READINESS_BASE_URL=http://127.0.0.1:4300 npm run readiness` and HTTPS smoke tests. Do not enable public signup or voice until MFA, migration, recovery, privacy, and cost-control gates pass.
