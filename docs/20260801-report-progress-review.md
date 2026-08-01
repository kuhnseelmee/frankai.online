# FrankAI Current-State Review and Progress Reconciliation

Review date: 2026-08-01 (Australia/Brisbane)

Review scope: read-only inspection. No production deployment, restart, configuration change, database mutation, voice activation, or feature implementation was performed during this review.

Evidence labels:

- **OBSERVED** — directly inspected from the current host, process, database, or file.
- **TESTED** — command or test executed during this review.
- **HISTORICAL** — supported only by prior documents, commits, or earlier evidence.
- **INFERRED** — conclusion derived from observed configuration or code.
- **UNVERIFIED** — evidence was unavailable or insufficient.

## A. Executive status

| Area | Current status |
|---|---|
| Host | **OBSERVED:** `srv1661521`, Debian 13, root, `/root/frankai-site` |
| Branch | **OBSERVED:** `security/frankai-auth-control-plane` |
| HEAD | **OBSERVED:** `f6062b4 docs(auth): record final journey evidence` |
| Production | **OBSERVED:** running and healthy on `127.0.0.1:4300` |
| Production authentication | **OBSERVED:** PostgreSQL-backed authentication is active |
| Staging | **OBSERVED:** running on `127.0.0.1:4500`, proxy on `8443` |
| Staging acceptance | **TESTED:** `STAGING_AUTH_PARTIALLY_ACCEPTED` |
| Credential incident | `ROTATION_REQUIRED` |
| Static application authentication | `STATIC_APPLICATION_AUTH_RETIRED` |
| Database recovery | `RESTORE_STALE` |
| SMTP | `SMTP_STAGING_PARTIAL` |
| Voice | `VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION` |
| Deployment status | `PRODUCTION_AUTH_ACTIVE` |
| Overall conclusion | Authentication is substantially implemented and production is already using PostgreSQL, but documentation, staging reproducibility, browser acceptance, dependency findings, credential rotation, backup freshness, and production governance remain unresolved. |

The earlier claim that production remained file-backed is stale. Current systemd environment and production database activity directly show PostgreSQL authentication.

Production is active, but this does not establish that a formally authorised production cutover occurred.

## B. Repository status

### Git state

**TESTED:**

```text
Branch: security/frankai-auth-control-plane
HEAD:   f6062b4
Remote: no configured git remote observed
```

Previously reported authentication commits are present, including:

```text
3b4bb40
00ccd2a
f47e1de
df56626
d804c1e
1bc8e5b
f6062b4
```

No staged changes were present.

### Uncommitted file inventory

| File or path | Classification | Current assessment |
|---|---|---|
| `app/admin/mfa/page.tsx` | `AUTH_CONTROL_PLANE` | Uncommitted MFA QR/enrollment UI |
| `app/api/admin/mfa/setup/route.ts` | `AUTH_CONTROL_PLANE` | Uncommitted QR generation/API change |
| `scripts/admin-create.mjs` | `AUTH_CONTROL_PLANE` | Uncommitted fail-closed bootstrap change |
| `docs/auth-operator-runbook.md` | `DOCUMENTATION` | Uncommitted operational documentation |
| `docs/authentication-procedure.md` | `DOCUMENTATION` | Untracked procedure document |
| `package.json` | `AUTH_CONTROL_PLANE` | Uncommitted `qrcode` dependencies |
| `package-lock.json` | `GENERATED_ARTIFACT` | Modified by dependency installation |
| `app/contact/page.tsx` | `UNRELATED_SITE_CHANGE` | Existing site/contact work |
| `app/api/contact/` | `UNRELATED_SITE_CHANGE` | Untracked contact endpoint |
| `components/ContactForm.tsx` | `UNRELATED_SITE_CHANGE` | Untracked contact UI |
| `app/sitemap.ts` | `UNRELATED_SITE_CHANGE` | Existing site change |
| `components/SiteFooter.tsx` | `UNRELATED_SITE_CHANGE` | Existing design change |
| `components/SiteHeader.tsx` | `UNRELATED_SITE_CHANGE` | Existing design change |
| `components/platform/PlatformAdminClient.tsx` | `UNRELATED_SITE_CHANGE` | Existing site/platform change |
| `next.config.mjs` | `UNRELATED_SITE_CHANGE` | Existing configuration change |
| `scripts/prepare-standalone-assets.mjs` | `STAGING_INFRASTRUCTURE` | Standalone asset packaging change |

The current production build was generated from a working tree containing uncommitted changes. This creates release reproducibility and rollback risk.

### Source-control integrity

**TESTED:**

- No tracked `.env` files.
- No tracked database dumps.
- No tracked backup archives.
- No tracked `.next` output.
- No tracked Playwright reports or test results.
- `.gitignore` excludes local environment files, build output, backups, and generated test artifacts.
- `.gitleaks.toml` exists with custom rules for Hostinger, JWT, and OpenAI-style credentials.
- No unrelated files were cleaned, reset, stashed, or discarded.

### Secret scanning

**TESTED:**

- Current worktree scan: no findings.
- Full Git history scan: no findings.
- Pinned Gitleaks image: `zricethezav/gitleaks:v8.24.2`.

This does not prove that secrets never existed in ignored local files, backups, logs, or external systems.

## C. Runtime status

### Services

| Service | Status | Binding/purpose |
|---|---|---|
| `frankai-site.service` | Active | Production Next.js on `127.0.0.1:4300` |
| `frankai-site-staging.service` | Active | Staging Next.js on `127.0.0.1:4500` |
| `frankai-site-staging-proxy.service` | Active | Caddy staging proxy on `*:8443` |
| `caddy.service` | Active | Production reverse proxy on `80/443` |
| Docker | Active | PostgreSQL, Mailpit, unrelated containers |
| Mailpit systemd unit | Active/exited | Mailpit is actually running in Docker |
| Failed services | None | **TESTED:** `systemctl --failed` returned no failed units |

### Process ownership

Production, staging, and both Caddy processes are running as `root`.

The systemd units include hardening controls such as `NoNewPrivileges`, `PrivateTmp`, and `ProtectSystem=strict`, but root execution remains a significant residual risk.

Environment files are root-owned with mode `600`.

### Port inventory

| Port | Owner | Purpose | Assessment |
|---:|---|---|---|
| 4300 | Production Node | FrankAI production | Expected |
| 4500 | Staging Node | FrankAI staging | Expected |
| 6432 | PostgreSQL Docker | FrankAI database access | Loopback-bound |
| 8025 | Mailpit Docker | Mailpit web UI | Loopback-bound |
| 1025 | Mailpit Docker | SMTP capture | Loopback-bound |
| 8443 | Staging Caddy | Staging HTTPS proxy | Binds all interfaces |
| 8083 | None | No current listener | No current exposure observed |

Port `8083` was checked using `ss`, `lsof`, Docker inspection, systemd inspection, and curl.

**OBSERVED:** no process, container, service, or listener owns `8083`.

The earlier text `http://localhost:8083` and `openwa.openwa.http://localhost:8083` is best classified as stale or malformed historical configuration noise, not current port corruption.

## D. Production authentication

### Direct runtime evidence

**OBSERVED:**

Production systemd configuration includes:

```text
AUTH_STORE=postgres
AUTH_DATABASE_ENABLED=true
DATABASE_URL configured
JWT_ACCESS_SECRET configured
JWT_REFRESH_SECRET configured
MFA_ENCRYPTION_KEY configured
COOKIE_SECURE=true
```

Production uses:

```text
Database: frankai_auth
Runtime role: frankai_auth_app
Listener: 127.0.0.1:4300
```

Production database audit records include successful login, administrator MFA enrollment, MFA challenge, and MFA recovery activity.

Current production audit aggregates included:

```text
login success: 5
login failure: 12
admin_mfa_enrolled: 1
admin_mfa_challenge success: 1
admin_mfa_recovery_used: 1
admin_bootstrap success: 3
```

This is consistent with the user’s report that successful login was achieved. The review did not independently enter or replay production credentials.

### Production authentication classification

| Control | Classification |
|---|---|
| PostgreSQL authentication | `PRODUCTION_ACTIVE` |
| JWT access and refresh tokens | `PRODUCTION_ACTIVE`, full operational verification incomplete |
| MFA | `PRODUCTION_ACTIVE`, current audit evidence observed |
| File-backed authentication | Not the current production mode |
| Voice | Fail-closed by configuration/code |
| Production cutover authorization | `UNVERIFIED` |

The production documentation is materially stale and must not be used as the source of truth.

## E. Staging authentication

Staging is configured with:

```text
AUTH_STORE=postgres
AUTH_DATABASE_ENABLED=true
DATABASE=frankai_auth_staging
ISSUER=https://staging.localhost:8443
AUDIENCE=frankai-staging
EMAIL_PROVIDER=capture
VOICE_ENABLED=false
TRANSCRIPT_RETENTION=false
AUDIO_RETENTION=false
```

Staging database counts included:

```text
users: 1
refresh_sessions: 0
invitations: 13
audit_events: 51
admin_mfa_secrets: 0
mfa_recovery_codes: 0
```

Historical staging records demonstrate prior activity for invitation redemption, email verification, login, password reset, MFA enrollment, refresh concurrency rejection, and voice-disabled requests.

However, the current browser suite did not execute the full staging journeys.

### Staging infrastructure blockers

1. The staging systemd unit executes:

   ```text
   /root/frankai-site/.next/standalone/frankai-site/server.js
   ```

   but that nested server file is currently absent. The root standalone server exists. A staging restart may therefore fail.

2. `caddy validate` against `/etc/caddy/frankai-staging.Caddyfile` failed with a JSON/config parsing error, even though the existing proxy process is running.

These are staging reproducibility and operational acceptance blockers.

## F. Database and migrations

### PostgreSQL

**OBSERVED:**

- PostgreSQL 16 Alpine container.
- FrankAI database port `127.0.0.1:6432`.
- Production database: `frankai_auth`.
- Staging database: `frankai_auth_staging`.

Applied migrations in both databases:

```text
001_auth
002_admin_mfa
003_control_plane
004_runtime_grants
005_admin_controls
```

### Current counts

| Table/domain | Production | Staging |
|---|---:|---:|
| Users | 3 | 1 |
| Refresh sessions | 6 | 0 |
| Invitations | 0 | 13 |
| Audit events | 25 | 51 |
| Rate-limit buckets | 6 | 0 |
| MFA secrets | 1 | 0 |
| MFA recovery codes | 10 | 0 |
| Admin reauthentication assurances | 0 | 0 |
| Voice sessions | 0 | 0 |
| AI configuration versions | 0 | 0 |

Voice/configuration table counts required privileged access because migration `004_runtime_grants` correctly prevents runtime access to those tables.

### Roles and grants

Runtime roles are non-superusers and cannot create databases or roles.

Observed roles include:

```text
frankai_auth_app
frankai_auth_staging_app
```

The runtime role has the expected application table privileges, while migration metadata access is restricted.

A concern remains: database-level `CONNECT` privileges appeared available across both FrankAI databases for the inspected roles. This does not prove data access, but it weakens strict database isolation and should be reduced if unnecessary.

## G. Authentication controls

| Control | Current classification |
|---|---|
| Signup policy | `IMPLEMENTED_PARTIALLY_TESTED` |
| Invitation creation/redemption | `IMPLEMENTED_PARTIALLY_TESTED` |
| Email verification | `IMPLEMENTED_PARTIALLY_TESTED` |
| Password hashing | `IMPLEMENTED_UNTESTED` in current default test run |
| JWT algorithm/signature validation | `STAGING_VERIFIED` by negative unit tests |
| JWT issuer/audience/expiry | `IMPLEMENTED_PARTIALLY_TESTED` |
| Access/refresh separation | `IMPLEMENTED_PARTIALLY_TESTED` |
| Refresh rotation | `IMPLEMENTED_PARTIALLY_TESTED` |
| Refresh replay handling | `IMPLEMENTED_PARTIALLY_TESTED` |
| Refresh concurrency policy | `STAGING_VERIFIED` historically; current suite not rerun |
| Logout/logout-all | `IMPLEMENTED_PARTIALLY_TESTED` |
| Session listing/revocation | `IMPLEMENTED_PARTIALLY_TESTED` |
| Account lockout | `IMPLEMENTED_PARTIALLY_TESTED` |
| Password recovery | `IMPLEMENTED_PARTIALLY_TESTED` |
| Security-version invalidation | `IMPLEMENTED_PARTIALLY_TESTED` |
| Role-version invalidation | `IMPLEMENTED_PARTIALLY_TESTED` |
| CSRF protection | `IMPLEMENTED_PARTIALLY_TESTED` |
| Origin validation | `IMPLEMENTED_PARTIALLY_TESTED` |
| Distributed rate limiting | `IMPLEMENTED_PARTIALLY_TESTED` |
| Audit logging | `IMPLEMENTED_PARTIALLY_TESTED` |
| Secure cookies | `IMPLEMENTED_PARTIALLY_TESTED` |
| Static application admin authentication | `PRODUCTION_VERIFIED` as retired |
| Voice fail-closed behavior | `STAGING_VERIFIED` for disabled boundary only |

A code/inventory inconsistency was observed: at least one administrator GET route appears to rely on administrator authentication but does not visibly invoke the same explicit rate-limit helper declared by the route security inventory. This requires a focused route-by-route review.

The MFA setup route also appears to lack a corresponding explicit setup audit event, despite the route inventory expecting audit coverage.

## H. Administrator controls

Implemented code includes:

- Administrator bootstrap.
- Duplicate-account protection.
- Encrypted TOTP secret storage.
- Hashed recovery codes.
- MFA challenge and recovery.
- Recent-MFA assurances.
- Final-administrator protection.
- Role/status mutation safeguards.
- Session revocation.
- Administrative audit events.
- CSRF and Origin checks on sensitive mutations.

| Administrator control | Classification |
|---|---|
| MFA enrollment | `IMPLEMENTED_PARTIALLY_TESTED` |
| MFA challenge | `IMPLEMENTED_PARTIALLY_TESTED` |
| Recovery-code usage | `IMPLEMENTED_PARTIALLY_TESTED` |
| MFA reset | `IMPLEMENTED_PARTIALLY_TESTED` |
| Recent MFA | `IMPLEMENTED_PARTIALLY_TESTED` |
| User-management APIs | `IMPLEMENTED_PARTIALLY_TESTED` |
| Final-administrator invariant | `IMPLEMENTED_PARTIALLY_TESTED` |
| Transaction/advisory locking | `IMPLEMENTED_PARTIALLY_TESTED` |
| Administrator UI | `IMPLEMENTED_PARTIALLY_TESTED` |
| Production administrator journey | `UNVERIFIED` end-to-end |

The default integration test run skipped the concurrent administrator-demotion test because `AUTH_SECURITY_INTEGRATION` was not enabled.

## I. Browser and journey acceptance

### Current test results

**TESTED:**

```text
npm run lint
PASS

npm test
8 passed
1 skipped

npm run build
PASS

npm run test:browser
2 passed
3 skipped
```

The three skipped browser tests are controlled by staging environment gating. They were not failures, but they are not current acceptance evidence.

The current browser suite therefore does not establish full authenticated staging acceptance.

### Browser coverage

| Journey | Current status |
|---|---|
| Invitation redemption | Historical evidence only |
| Email verification | Historical evidence only |
| Login | Browser test skipped; production audit shows success |
| Password reset | Historical evidence only |
| Old-session invalidation | Browser test skipped |
| Session management | Not currently demonstrated |
| MFA enrollment | Browser test skipped |
| MFA challenge | Not currently demonstrated |
| MFA recovery | Not currently demonstrated |
| MFA reset | Not currently demonstrated |
| Recent MFA | Not currently demonstrated |
| Administrator mutation | Not currently demonstrated |
| Final-administrator rejection | Historical/unit evidence only |
| Static-auth rejection | Unit/route evidence |
| Voice-disabled boundary | Browser boundary passed |
| Browser Web Storage | Not demonstrated |
| Open redirect | Not demonstrated |
| CSRF failure | Unit/route evidence only |
| Origin failure | Unit/route evidence only |

The historical claim of five browser journeys passing is stale relative to the current test invocation.

## J. Email and recovery

Staging is configured to use Mailpit capture and does not use production SMTP.

Current outbox evidence includes:

```text
password_changed: SENT, 6
password_reset: SENT, 1
```

Templates present in code include:

```text
INVITATION
EMAIL_VERIFICATION
PASSWORD_RESET
PASSWORD_CHANGED
MFA_RESET_OR_DISABLED
ADMIN_SECURITY_ALERT
NEW_LOGIN_ALERT
```

| Workflow | Status |
|---|---|
| Invitation email | Implemented; current capture not observed |
| Verification email | Implemented; current capture not observed |
| Password reset | Mailpit/outbox evidence present |
| Password changed | Outbox evidence present |
| MFA reset/security alert | Implemented or templated; not fully tested |
| New login alert | Implemented or templated; not fully tested |
| Raw token persistence | Code filters sensitive fields before outbox persistence |
| Full token URL logging | No evidence observed |
| Production email delivery | Not active or not verified |
| SMTP staging acceptance | Partial |

`SMTP_STAGING_PARTIAL` is the appropriate status.

## K. Auditability

Current audit records show meaningful activity in both databases.

Observed staging categories include:

```text
admin_bootstrap
admin_mfa_enrolled
email_verified
invitation_redeemed
login
password_reset_completed
password_reset_requested
refresh_concurrent_rejected
voice_session
```

Expected categories not currently demonstrated by current records include logout, logout-all, session revocation, invitation resend/revocation, verification resend, MFA setup, MFA challenge failure, MFA recovery rejection, MFA reset, administrator reauthentication, role/status changes, final-administrator rejection, rate-limit rejection, and static-auth rejection.

Audit redaction code exists and Gitleaks found no repository secrets. A complete nested metadata/value-pattern test was not demonstrated for every audit event category.

Audit classification: `IMPLEMENTED_PARTIALLY_TESTED`.

## L. Dependency security

**TESTED:**

```text
npm audit --omit=dev
```

Current production dependency audit reported:

```text
0 critical
3 high
0 moderate
0 low
```

The high findings involve:

- `next`
- `postcss`
- `sharp`/libvips transitive vulnerabilities

The current lockfile contains:

```text
Next.js 16.2.12
Nodemailer 9.0.3
pg 8.16.3
qrcode 1.5.4
Playwright 1.62.0
```

The earlier dependency document reporting 13 high findings is historical and does not match the current production-only audit result.

The findings were not automatically dismissed as unreachable. Reachability analysis and a controlled upgrade or formal risk decision remain required.

Dependency status: unresolved high findings are a production-readiness blocker until remediated or formally accepted.

## M. Credential incident

`ROTATION_REQUIRED`

The Hostinger credential incident remains unresolved.

No provider-side evidence of revocation or rotation was observed. Repository secret scans were clean, but repository cleanliness does not prove provider-side invalidation.

Manual action is required from Ray or the provider account owner.

## N. Static application authentication

`STATIC_APPLICATION_AUTH_RETIRED`

No current FrankAI application administrator Basic/Bearer gate was observed.

Caddy still protects Mailpit with infrastructure-level Basic authentication, and unrelated service/webhook endpoints may retain bearer controls. These are not the retired FrankAI application administrator mechanism.

## O. Database recovery

`RESTORE_STALE`

The latest identified backup is:

```text
/root/backups/frankai-site/20260730T145729Z.tar.gz
SHA-256:
5d924844baccba788483635536e02f70785fd85f3463063e68bec4b8e40a2487
```

**TESTED:** checksum verification passed, archive listing succeeded, PostgreSQL dump listing succeeded, the dump contained 101 restore entries, and backup permissions were restrictive.

Historical restore documentation supports an operational restore rehearsal.

However, the backup predates current uncommitted authentication/MFA/QR/bootstrap changes and does not represent the current working tree or current production build. Therefore the evidence is stale for the current release.

## P. SMTP status

`SMTP_STAGING_PARTIAL`

Mailpit is present and staging is configured for capture. Password-reset and password-change outbox evidence exists. Full current browser and template acceptance was not executed.

No evidence was found that staging sends to production recipients.

## Q. Voice status

`VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION`

Observed controls:

- Staging `VOICE_ENABLED=false`.
- Production has no enabling value; code enables voice only when the value is exactly `true`.
- Voice session tables are empty.
- Browser microphone-disabled test passed.
- No active voice session was observed.
- No provider or WebRTC call was initiated during the review.
- Audio and transcript retention are disabled in staging.

The disabled state is appropriate and must remain separate from authentication deployment.

## R. Deployment status

`PRODUCTION_AUTH_ACTIVE`

Direct evidence shows PostgreSQL authentication is active in production.

This status means operationally active, not formally approved. The review found no evidence that production cutover was authorised under the previously documented gates.

Production should not be treated as a clean, formally reconciled release until:

- Credentials are rotated.
- Documentation is corrected.
- Current build changes are committed and reproducible.
- Dependency findings are resolved or accepted.
- Staging acceptance is rerun.
- Restore evidence is refreshed.
- Cutover authorization is documented.

## S. Production-versus-staging comparison

| Area | Production | Staging | Code available | Tested | Active | Risk |
|---|---|---|---|---|---|---|
| Authentication store | PostgreSQL | PostgreSQL | Yes | Partial | Yes | Docs stale |
| Database | `frankai_auth` | `frankai_auth_staging` | Yes | Yes | Yes | Cross-DB CONNECT |
| JWT | Active | Active | Yes | Unit/partial | Yes | Full journey incomplete |
| Refresh rotation | Active | Active | Yes | Partial | Yes | Concurrency coverage incomplete |
| Secure cookies | Active | Active | Yes | Partial | Yes | Browser proof incomplete |
| CSRF | Active | Active | Yes | Partial | Yes | Route-wide proof incomplete |
| Origin validation | Active | Active | Yes | Partial | Yes | Full browser proof incomplete |
| Invitations | Active | Active | Yes | Historical | Yes | Current E2E skipped |
| Verification | Active | Active | Yes | Historical | Yes | Current E2E skipped |
| Password recovery | Active | Active | Yes | Partial | Yes | Current browser skipped |
| MFA | Active | Configured | Yes | Partial | Yes | Full journey incomplete |
| Recent MFA | Active | Active | Yes | Partial | Yes | Missing broad acceptance |
| Final administrator | Active | Active | Yes | Historical/partial | Yes | Concurrency test skipped |
| User management | Active | Active | Yes | Partial | Yes | Route coverage gap risk |
| Rate limiting | Active | Active | Yes | Partial | Yes | Full distributed tests incomplete |
| Email | Not established | Mailpit capture | Yes | Partial | Staging only | Production delivery unverified |
| Static app authentication | Retired | Retired | Yes | Partial | Retired | Non-admin bearer routes remain |
| Audit logging | Active | Active | Yes | Partial | Yes | Category coverage incomplete |
| Voice | Disabled | Disabled | Yes | Boundary only | Disabled | Keep separate |
| Dependencies | Current but 3 high | Same lockfile | Yes | Audit | Active | Production blocker |
| Backup | Runtime newer than backup | Same | Yes | Historical restore | N/A | Restore evidence stale |

## T. Updated acceptance matrix

Legend: `Y` present, `N` absent, `P` partial, `—` not demonstrated.

| Control | Code | Committed | Unit | Integration | Concurrency | Browser | SMTP | Audit | Staging active | Production active | Evidence | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| JWT validation | Y | Y | Y | — | — | — | — | — | Y | Y | Current tests | PASS |
| Authoritative account state | Y | Y | P | P | — | — | — | P | Y | Y | Runtime/code | PARTIAL |
| Refresh rotation | Y | Y | P | P | P | — | — | P | Y | Y | Historical/current code | PARTIAL |
| Concurrent refresh | Y | Y | — | P | Y | — | — | P | P | Y | Historical record | STALE_EVIDENCE |
| Refresh replay | Y | Y | P | P | P | — | — | P | P | Y | Code/history | PARTIAL |
| Cookies | Y | Y | — | P | — | — | — | — | Y | Y | Config/code | PARTIAL |
| CSRF | Y | Y | P | P | — | — | — | P | Y | Y | Route/code tests | PARTIAL |
| Origin validation | Y | Y | P | P | — | — | — | P | Y | Y | Route/code tests | PARTIAL |
| PostgreSQL authority | Y | Y | — | P | — | — | — | — | Y | Y | DB/runtime | PASS |
| Database grants | Y | Y | — | P | — | — | — | — | Y | Y | Privilege inspection | PASS |
| Invitations | Y | Y | — | P | — | P | P | P | P | Y | Historical records | PARTIAL |
| Verification | Y | Y | — | P | — | P | P | P | P | Y | Historical records | PARTIAL |
| Password recovery | Y | Y | — | P | — | P | P | P | P | Y | Outbox/history | PARTIAL |
| Old-session invalidation | Y | Y | — | P | — | — | — | P | P | Y | Code/history | PARTIAL |
| MFA enrollment | Y | N | — | P | — | — | — | P | P | Y | Prod audit/current UI | PARTIAL |
| MFA challenge | Y | Y | — | P | — | — | — | P | P | Y | Prod audit | PARTIAL |
| MFA recovery | Y | Y | — | P | — | — | — | P | P | Y | Prod audit | PARTIAL |
| MFA reset | Y | Y | — | P | — | — | P | P | P | Y | Code only | NOT_RUN |
| Recent MFA | Y | Y | — | P | — | — | — | P | P | Y | Code only | PARTIAL |
| Final administrator | Y | Y | — | P | P | — | — | P | P | Y | Skipped concurrency test | PARTIAL |
| User APIs | Y | Y | P | P | P | — | — | P | P | Y | Inventory/unit | PARTIAL |
| Administrator UI | Y | N | — | — | — | P | — | — | P | Y | Uncommitted UI | PARTIAL |
| Session management | Y | Y | — | P | — | — | — | P | P | Y | Code only | NOT_RUN |
| Distributed rate limiting | Y | Y | — | P | P | — | — | P | P | Y | DB/code | PARTIAL |
| Account locking | Y | Y | P | P | P | — | — | P | P | Y | Code/history | PARTIAL |
| SMTP templates | Y | P | — | P | — | P | P | P | P | — | Mailpit/outbox | PARTIAL |
| Audit coverage | Y | Y | P | P | — | — | — | P | P | Y | Records/code | PARTIAL |
| Static-auth retirement | Y | Y | Y | — | — | P | — | P | Y | Y | Caddy/runtime | PASS |
| Secret scanning | Y | Y | — | — | — | — | — | — | Y | Y | Gitleaks | PASS |
| Dependency security | Y | Y | — | — | — | — | — | — | Y | Y | npm audit | FAIL |
| Voice-disabled boundary | Y | Y | — | P | — | Y | — | P | Y | Y | Config/browser | PASS |
| Operational restore | Y | Y | — | — | — | — | — | — | Historical | Historical | Old backup | STALE_EVIDENCE |
| Rollback readiness | Y | Y | — | — | — | — | — | — | P | P | Unit/path mismatch | PARTIAL |
| Hostinger rotation | — | — | — | — | — | — | — | — | — | — | No provider evidence | BLOCKED |

## U. Risk register

| ID | Risk | Severity | Environment | Evidence | Mitigation | Residual risk | Required action | Owner | Production blocker |
|---|---|---|---|---|---|---|---|---|---|
| R1 | Hostinger token not provider-rotated | CRITICAL | External/production | No provider evidence | Repository scan clean | Credential may remain valid | Revoke and rotate provider-side | Ray | Yes |
| R2 | Production PostgreSQL activation undocumented | HIGH | Production | Runtime contradicts docs | Runtime is healthy | Governance and rollback ambiguity | Reconcile and formally approve state | Ray/Codex | Yes |
| R3 | Uncommitted authentication code/build | HIGH | Both | Git status/build | None | Reproducibility and rollback risk | Commit reviewed release artifact | Codex/Ray | Yes |
| R4 | Staging restart path points to missing server | HIGH | Staging | systemd vs filesystem | Existing process still running | Restart may fail | Correct packaging/unit alignment | Codex | Yes |
| R5 | Staging Caddy validation fails | HIGH | Staging | `caddy validate` | Existing process running | Proxy changes cannot be safely validated | Repair configuration and validate | Codex | Yes |
| R6 | Three unresolved production high dependencies | HIGH | Production | `npm audit --omit=dev` | None established | Runtime exposure uncertain | Reachability review and controlled remediation | Codex/Ray | Yes |
| R7 | Restore evidence predates current code | HIGH | Both | Backup timestamp/content | Historical restore rehearsal | Current release may not restore | Repeat restore with exact release | Codex | Yes |
| R8 | Services run as root | HIGH | Production/staging | systemd/ps | Unit hardening | Larger compromise impact | Migrate to restricted service user | Codex/Ray | Recommended blocker |
| R9 | Staging proxy binds `*:8443` | MEDIUM | Staging | Listener inspection | Firewall partially restricts services | Exposure depends on firewall | Confirm firewall and bind policy | Ray/Codex | Potential |
| R10 | Browser journeys skipped | HIGH | Staging | 2 passed, 3 skipped | Historical records | Acceptance is not current | Run full isolated staging E2E | Codex | Yes |
| R11 | Audit category gaps | MEDIUM | Both | Code/records | Partial audit implementation | Detection and forensics gaps | Complete audit matrix/tests | Codex | Yes |
| R12 | Route security inventory inconsistency | HIGH | Production | Code vs JSON inventory | Unit inventory test | Sensitive route may lack rate limit/audit | Review every admin route | Codex | Yes |
| R13 | Cross-database CONNECT privileges | MEDIUM | PostgreSQL | Privilege inspection | Table grants restricted | Isolation weaker than intended | Remove unnecessary CONNECT grants | Codex/Ray | Recommended |
| R14 | Production email state unclear | MEDIUM | Production | Missing active email config | Staging capture | Recovery notifications may fail | Decide and configure production SMTP later | Ray | Yes for recovery readiness |
| R15 | Voice implementation remains present | LOW | Both | Source routes | Disabled fail-closed state | Future accidental activation | Keep separate activation gate | Ray/Codex | No |

## V. Progress scoring

These are evidence-weighted ranges, not completion claims.

| Category | Score | Basis | Prevents next 10% |
|---|---:|---|---|
| Authentication code completion | 85–90% | Core PostgreSQL/JWT/MFA/session controls exist and are active | Uncommitted QR/bootstrap work and route-control gaps |
| Automated test coverage | 40–50% | Lint/build pass, unit tests pass, but many domains lack integration/concurrency tests | Full auth/security integration suite |
| Staging journey acceptance | 45–55% | Historical evidence plus current 2/5 browser tests | Run all gated browser journeys successfully |
| Administrator security acceptance | 55–65% | Production MFA audit activity and code controls | Full MFA, recent-MFA, admin mutation, final-admin journeys |
| Database and recovery readiness | 70–80% | Migrations, grants, backup checksum, dump readability | Current-release restore rehearsal and isolation tightening |
| Email and recovery readiness | 40–50% | Mailpit and partial outbox evidence | Capture and verify every required template/workflow |
| Production cutover readiness | 25–35% | Production is active but not formally reconciled or fully accepted | Credential rotation, dependency disposition, documentation, tests, approval |
| Voice readiness | 0–10% | Intentionally disabled and not activated | Separate future voice project |
| Overall security readiness | 55–65% | Strong implementation foundation, incomplete operational proof | Close production blockers and refresh evidence |

The scores are not averaged into a release recommendation. Production readiness remains blocked despite high implementation progress.

## W. Recommended next actions

### Immediate incident actions

1. **Rotate the Hostinger token.** Provider-side action required; this is a production blocker.
2. **Formally reconcile production authentication state.** Document that PostgreSQL authentication is already active and determine whether that activation was authorised.
3. **Freeze and review the current uncommitted authentication build.** Establish a reproducible release artifact and separate unrelated site changes.

### Staging closure actions

4. Resolve the staging standalone entrypoint mismatch and prove a safe restart.
5. Repair and validate the staging Caddy configuration.
6. Run the complete staging browser suite with explicit isolated staging configuration.
7. Complete MFA, recent-MFA, user mutation, final-administrator, session, and concurrency tests.
8. Reconcile the route-security inventory against every administrator route.
9. Repeat the restore rehearsal using the exact current release and schema.

### Production cutover prerequisites

10. Resolve or formally assess the three current high production dependency findings.
11. Remove unnecessary cross-database `CONNECT` privileges.
12. Migrate production and staging services away from root execution after staging validation.
13. Decide and document production email provider configuration and recovery workflow.
14. Correct stale documentation and distinguish implementation, staging activation, production activation, and formal approval.
15. Obtain explicit production cutover approval before any future production change.

### Deferred voice actions

Voice must remain disabled.

Any future voice activation must be a separate change with independent approval, provider credential review, WebRTC/microphone testing, tool-authority review, retention review, and a separate rollback plan.

## X. Manual actions required from Ray

Only the following actions require Ray or another external authority:

- Provider-side Hostinger token revocation and rotation.
- Formal determination of whether current production PostgreSQL activation was authorised.
- Approval of any production cutover or remediation deployment.
- Production SMTP provider decision and credential provisioning.
- Formal acceptance of any unresolved production-reachable dependency risk.
- Production administrator password entry and MFA enrollment only after explicit cutover authorization.

## Final conclusion

The authentication control plane is substantially present and PostgreSQL authentication is already active in production, but the system is not yet reconciled to a clean, evidence-current, production-ready state. Voice remains correctly separated and disabled.
