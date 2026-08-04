# FrankAI Platform

## Overview

FrankAI is a first-party Next.js platform for a public product website, authenticated
operator capabilities, governed platform configuration, and protected memory ingest and
retrieval. The public website is served at [frankai.online](https://frankai.online).
The canonical repository is
[`kuhnseelmee/frankai.online`](https://github.com/kuhnseelmee/frankai.online).

Public pages describe the platform and its release, governance, trust, memory, and proof
surfaces. Account and operator functions are private. The application does not treat the
public pages as an authentication boundary.

## Current capabilities

Implemented in the current repository:

- PostgreSQL-backed account, refresh-session, invitation, verification, password-reset,
  MFA, rate-limit, email-outbox, reauthentication, and audit persistence.
- Short-lived signed access tokens and rotating refresh sessions.
- Secure cookie, CSRF, origin, password-hashing, lockout, audit, and role/version checks.
- Administrator bootstrap, TOTP MFA, one-time recovery codes, email verification, password
  recovery, invitation provisioning, and final-recoverable-administrator protection.
- Private platform draft, validation, and approval-publish operations.
- Protected memory ingest and lexical retrieval backed by filesystem operational data.
- An optional Hostinger Agentic Mail webhook that accepts bounded event metadata.
- An optional realtime voice boundary that is fail-closed unless explicitly enabled and
  provider-configured. It is disabled in the approved production template.

The application also contains an explicit file-backed authentication store for development
and migration compatibility. Production configuration rejects that mode.

## Architecture

The application uses Next.js `16.2.12`, React `18.3.1`, TypeScript/TSX scripts, Node.js,
`pg` for PostgreSQL, Nodemailer for optional SMTP delivery, and Playwright for browser
tests. The package lockfile is authoritative for dependency installation.

Production is built with Next.js standalone output. The systemd service runs
`.next/standalone/server.js` on `127.0.0.1:4300`; Caddy terminates public HTTPS and
reverse-proxies the public domain to that loopback service. The service is
`frankai-site.service`, its working directory is `/root/frankai-site`, and its production
environment file is `/etc/frankai-site.env`. The service runs with `NODE_ENV=production`,
`NoNewPrivileges=true`, `PrivateTmp=true`, and a restricted filesystem policy that permits
writes only to the required application build and `/var/lib/frankai-site` paths.

The standalone build hook copies `public` and `.next/static` into the standalone layout and
removes nested environment files. Runtime secrets are supplied by systemd, not bundled into
the build.

## Security model

Authentication is a database-backed control plane when production mode is enabled. Access
tokens are HS256 JWTs with issuer, audience, expiry, token ID, role, and security-version
claims. Access sessions are short-lived; refresh sessions are stored by token hash and are
rotated on refresh. Reuse or replay of a refresh token revokes its token family. Logout and
security changes can revoke active refresh sessions.

Authentication cookies are `__Host-frankai_access` and `__Host-frankai_refresh`; they are
HTTP-only, Secure in production, SameSite-controlled, and path-scoped. A separate CSRF
cookie is checked against the request header for mutating requests. The request origin must
also be absent or match the configured application origin.

Passwords use Node scrypt with a per-password salt and the repository's explicit parameters.
Production requires non-placeholder access and refresh signing secrets, PostgreSQL mode,
`DATABASE_URL`, and Secure cookies. MFA encryption requires a separately configured
32-byte hexadecimal key. MFA secrets are encrypted at rest with AES-256-GCM; recovery codes
are returned during enrollment and stored as hashes. Administrator routes require an active
`ADMIN` account and, where configured, completed MFA. Sensitive administrator mutations also
require recent MFA assurance.

Login, signup, invitation, refresh, password recovery, MFA, voice, and sensitive admin
operations use PostgreSQL-backed rate-limit buckets. Security-sensitive events are audited
with registered actions and redacted metadata. The final recoverable administrator invariant
is checked transactionally under a PostgreSQL advisory lock.

The former README's HTTP Basic authentication, static `FRANKAI_PLATFORM_ADMIN_TOKEN`, and
fallback from that credential to `MEMORY_INGEST_SECRET` are not the current platform-console
control plane. No such fallback was found in the active route or authentication code. The
current platform console uses the signed administrator session, CSRF protection, origin
validation, rate limiting, and audit controls. `lib/platform/auth.ts` remains a legacy helper
but is not the route's active authentication path.

## Repository safety

Do not commit `.env` files, production credentials, JWT keys, MFA keys, webhook secrets,
SMTP passwords, recovery codes, user data, or generated operational data. `.gitignore`
excludes environment files, build output, dependencies, test artifacts, backups, and common
secret locations. Use the tracked example files as templates and put real values only in the
intended local or service environment.

## Prerequisites

- Node.js compatible with Next.js 16 and npm. The reviewed production host currently runs
  Node.js `v24.18.0` and npm `11.16.0`.
- PostgreSQL for the production authentication control plane. The repository does not declare
  a PostgreSQL server-version minimum; validate the selected server against the migrations.
- A configured environment file for any operation that accesses PostgreSQL, sends mail, or
  uses protected memory endpoints.

## Local development

```bash
cp .env.example .env
npm ci
npm run dev
```

The development server binds to `127.0.0.1:4300`. Set an explicit development-only file
store and local data directory if PostgreSQL is not being used. Do not copy production
secrets into `.env` or use a production database for local testing.

For a production-shaped local configuration, use
[`deploy/frankai-site.env.example`](deploy/frankai-site.env.example) as the variable
reference and provide real values through an untracked environment file. `.env.example`
contains local/compatibility defaults and must not be treated as a production approval.

## Environment configuration

The production template documents the important variable groups: JWT signing, cookie and
origin policy, PostgreSQL authentication, MFA encryption, signup/invitation policy,
rate-limits, email, memory, platform storage, contact storage, and voice feature gates.
Production must use `AUTH_STORE=postgres`, `AUTH_DATABASE_ENABLED=true`, a `DATABASE_URL`,
`COOKIE_SECURE=true`, and non-placeholder JWT secrets. Public signup is disabled by the
approved template; invitation signup is separately controlled.

The production service reads `/etc/frankai-site.env` with mode `0600`. Staging uses a separate
`frankai-site-staging.service` and `/etc/frankai-site-staging.env`; staging must never point
at production data or the production origin. Environment values are intentionally not
documented here.

## Database setup and migrations

Apply migrations in repository order:

```bash
npm run db:migrate
```

The migration runner requires `DATABASE_URL`, creates `schema_migrations`, and applies
`001_auth`, `002_admin_mfa`, `003_control_plane`, `004_runtime_grants`, and
`005_admin_controls` transactionally. The schema covers users, refresh sessions, invitations,
verification and reset tokens, audit events, MFA, rate limits, email outbox, reauthentication
assurances, runtime grants, and related control-plane data.

The file-store migration is a separate, deliberate operation:

```bash
npm run auth:migrate-file
```

It imports legacy users and audit events into PostgreSQL, revokes existing refresh sessions,
quarantines invalid records in its report, and writes a protected migration report. Review
the result before treating the migration as complete. It is not a substitute for the normal
database migration order and must not be run casually against production.

## Administrator bootstrap

Use the interactive bootstrap command with the approved service environment:

```bash
npm run admin:create -- --email admin@example.com
```

The password is read interactively and is never supplied on the command line. The command
refuses to modify an existing account. In PostgreSQL mode it creates an active, verified
administrator with MFA required and records an audit event. The first login must complete
MFA enrollment; recovery codes must be handled as one-time secrets.

## Testing and quality gates

```bash
npm run lint
npm test
npm run test:browser
npm run security:benchmark
```

`npm test` runs the Node test suite. Database and authentication integration tests are
guarded by explicit environment flags and isolated staging configuration. Browser tests use
Playwright and a staging-oriented base URL; they must not be pointed at production. Tests
that require unavailable infrastructure may report skips; a skip is not a passing production
acceptance result.

`security:benchmark` measures the configured scrypt workload and reports timing only. It
does not prove deployment security. Review the test output and environment gates before
calling a release accepted.

## Production build

```bash
npm run build
```

This creates the standalone Next.js build and runs the standalone asset preparation hook.
The build does not provision PostgreSQL, create administrators, install system services, or
load production secrets.

## Production deployment

The guarded deployment script is:

```bash
npm run deploy:production
```

It runs lint, builds the standalone application, restarts `frankai-site.service`, waits for
the local health endpoint, and runs the readiness check. Restarting the service and reading
the systemd environment require root or `sudo`; the script is an operator command, not a
normal unprivileged developer command. Run database migrations separately, after review and
before a release that requires them.

This task did not run the deployment script and did not restart production.

## Readiness and health checks

The health endpoint is `GET /api/health`. The non-mutating readiness script checks health,
the public HTML pages, content types, and discovered CSS assets. If a memory secret is
available through the selected environment file, it also checks authenticated search and
invalid ingest validation without writing a valid memory event.

```bash
READINESS_BASE_URL=http://127.0.0.1:4300 \
READINESS_ENV_FILE=/etc/frankai-site.env \
npm run readiness
```

The default target is `https://frankai.online`. Readiness is evidence for the checked target
and time; it is not a substitute for database migration review, mail-provider approval, or
browser acceptance.

## Rollback and recovery

Follow [`docs/rollback.md`](docs/rollback.md). Restore a reviewed source/build and service
configuration backup, rebuild standalone assets, and restart only under the production
remediation gate. Preserve the PostgreSQL database and `/var/lib/frankai-site/auth`; never
delete the active database as a rollback shortcut. A staging rollback test is not proof of a
production rollback rehearsal.

## Memory ingest and retrieval

`POST /api/memory/ingest` and `POST /api/memory/search` require the dedicated
`MEMORY_INGEST_SECRET` Bearer credential. The endpoints fail closed when the secret is
missing, bound payload sizes are enforced, and requests are validated. Ingest appends
events to `MEMORY_INGEST_DIR` (default `/var/lib/frankai-site/memory-ingest/events.jsonl`).

Rebuild the local lexical index with:

```bash
npm run memory:rebuild-index
```

The index defaults to `/var/lib/frankai-site/memory-index/index.json`. The rebuild process
uses bounded searchable text and excludes sensitive metadata keys such as message bodies and
raw content. Memory files are operational data, not repository assets.

## Platform administration

The private console is `/admin/platform`. Its API is `/api/admin/platform`. GET requires an
active administrator session and MFA when required; draft and publish mutations additionally
require recent administrator reauthentication, CSRF/origin checks, rate limiting, payload
validation, an approval phrase for publishing, and audit records. Configuration is
file-backed by default at `/var/lib/frankai-site/platform/config.json` (or the configured
`FRANKAI_PLATFORM_CONFIG_FILE`).

## Optional Hostinger Agentic Mail webhook

`POST /api/webhooks/hostinger-mail` is implemented in the repository. It requires the
dedicated `HOSTINGER_MAIL_WEBHOOK_SECRET`, accepts the supported `message.received` event,
limits payload size, and logs only bounded event metadata. With
`MEMORY_INGEST_FROM_HOSTINGER_MAIL=true`, accepted metadata is appended as private memory;
raw email bodies are not stored by this integration.

The repository proves endpoint implementation and provides an environment template. It does
not, by itself, prove that a Hostinger webhook is registered, that a Hostinger test request
passed, that inbound production delivery has occurred, or that production mail activation
has been approved. Current mail documentation records SMTP/inbound-provider activation as
incomplete. Treat provider registration, test delivery, DMARC, bounce processing, and mailbox
migration as separate operational gates.

## Operational data locations

The following defaults are implemented; production values may override them through the
service environment:

- `/var/lib/frankai-site/auth` — legacy file-backed auth and audit data.
- `/var/lib/frankai-site/auth-migration` — file-auth migration report.
- `/var/lib/frankai-site/memory-ingest` — append-only memory events.
- `/var/lib/frankai-site/memory-index` — rebuilt memory search index.
- `/var/lib/frankai-site/platform` — platform configuration.
- `/var/lib/frankai-site/contact` — contact enquiry storage when configured.
- `/etc/frankai-site.env` — production environment file, mode `0600`.
- `/etc/frankai-site-staging.env` — staging environment file, mode `0600`.

PostgreSQL is the production identity/session store. Filesystem locations remain relevant for
memory, platform configuration, contact data, migration artifacts, and explicit legacy or
development paths.

## Service boundaries

- Required runtime: the Next.js application, Caddy reverse proxy, and PostgreSQL for the
  production auth control plane.
- Optional: SMTP email delivery, Hostinger Agentic Mail webhook delivery, and OpenAI-backed
  realtime voice.
- Voice is fail-closed unless `VOICE_ENABLED=true` and its provider/configuration gates pass;
  the approved production template keeps it disabled and disables audio/transcript retention.
- Memory endpoints are separate secret-protected service boundaries and do not use the admin
  credential.
- Caddy and systemd are host-managed infrastructure. Repository scripts can invoke them, but
  their configuration and restart state are not stored in Git.

## Production status

During this documentation review, read-only host checks found `frankai-site.service` active,
the application bound on `127.0.0.1:4300`, Caddy listening on public HTTP/HTTPS ports, and
the active Caddy configuration syntactically valid. The production service environment file
exists with restrictive ownership and mode. No secret values were read.

This README does not claim that every optional integration is active. In particular, the
Hostinger mail webhook's provider-side registration and inbound delivery are not proven by
the repository, and voice remains an explicit feature gate. Production readiness must be
established by the current deployment and acceptance evidence, not by this document alone.

## Documentation index

- [Deployment](docs/deployment.md)
- [Rollback](docs/rollback.md)
- [Authentication](docs/authentication.md)
- [Authentication procedure](docs/authentication-procedure.md)
- [Administrator operations](docs/admin-operations.md)
- [Admin security controls](docs/admin-security-controls.md)
- [Browser acceptance](docs/browser-acceptance.md)
- [Memory and security threat model](docs/security-threat-model.md)
- [Realtime voice security](docs/realtime-voice-security.md)
- [Hostinger and SMTP operations](docs/hostinger.md)
- [SMTP operations and inbound-provider gate](docs/smtp-operations.md)
- [Production authentication deployment decision](docs/20260801-production-auth-deployment-decision.md)

## Historical notes

Older documents may refer to the former Base44 landing-site replacement, `Frank-2.0`, or
transitional cutover work. Those references describe project history and must not be used as
the current deployment or authentication procedure. The current repository is the canonical
FrankAI application repository; use the current code, environment templates, deployment
documentation, and host verification for operational decisions.

## License

See [`LICENSE`](LICENSE).
