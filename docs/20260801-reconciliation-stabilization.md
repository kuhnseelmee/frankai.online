# FrankAI Authentication Release Reconciliation and Stabilisation

Date: 2026-08-01 (Australia/Brisbane)

Scope: production release capture, protected backup, authentication release
reconciliation, staging repair, security acceptance, database isolation, and
restore evidence. Production was not restarted or redeployed. Voice was not
enabled.

## A. Executive reconciliation status

| Item | Result |
|---|---|
| Host | **OBSERVED:** `srv1661521`, Debian 13, `/root/frankai-site`, root |
| Branch | `security/frankai-auth-control-plane` |
| Original observed HEAD | `f6062b4` |
| Reconciled release commit | `f55c972 fix(auth): reconcile active production authentication release` |
| Production runtime | **OBSERVED:** active, PostgreSQL-backed, port 4300 |
| Staging runtime | **OBSERVED:** candidate `f55c972`, port 4500, proxy 8443 |
| Production restart | **TESTED:** none; service start time remained 03:34:54 AEST |
| Hostinger status | `ROTATION_REQUIRED` |
| Voice status | `VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION` |
| Static application authentication | `STATIC_APPLICATION_AUTH_RETIRED` |
| SMTP status | `SMTP_STAGING_PARTIAL` |
| Database isolation | `DATABASE_ISOLATION_VERIFIED` |
| Database recovery | `OPERATIONAL_RESTORE_VERIFIED` |
| Production status | `BLOCKED` |

The authentication candidate is functional and reviewable in staging, but the
live production process is still running the previously active build. It was
deliberately not restarted because the production remediation gate is not
closed.

## B. Production release capture

### Active production process

**OBSERVED:**

```text
Service: frankai-site.service
PID: 3621929
Executable: /usr/bin/node
Entry point: /root/frankai-site/.next/standalone/server.js
Working directory: /root/frankai-site
User: root
Group: root
Port: 127.0.0.1:4300
Start: 2026-08-01 03:34:54 AEST
```

Production health checks returned HTTP 200 for `/` and `/api/health`.

Production environment names confirmed PostgreSQL authentication, secure
cookies, JWT secrets, and MFA encryption configuration. Environment values were
not printed.

### Reproducibility

The clean pre-reconciliation commit passed lint, tests, and build, but emitted
the standalone server under a worktree-derived nested path. Production starts
the root standalone server. The active production build therefore depended on
the uncommitted `outputFileTracingRoot` packaging change.

The reconciled commit `f55c972` builds a root:

```text
.next/standalone/server.js
```

The candidate was built in `/root/worktrees/frankai-reconciliation-rc1` and
staged without overwriting the production build.

Production release reproducibility classification:

```text
REPRODUCIBLE_WITH_IDENTIFIED_PATCH
```

The intended reconciliation candidate itself is reproducible from `f55c972`.
The currently running production build is not identical to that candidate until
an explicitly approved production remediation is performed.

### Protected backup

Pre-change backup:

```text
/root/backups/frankai-site/20260801T063142Z-reconciliation/
```

It contains protected copies of the source working tree, Git metadata, active
build, service and proxy configuration, environment files, PostgreSQL dumps,
role/grant metadata, checksums, and archive listings.

Post-remediation evidence:

```text
/root/backups/frankai-site/20260801T063142Z-reconciliation/post-remediation/
```

Post-remediation checksum manifest:

```text
98f24bba344f210c2ad85ab36c3c6d3a970f0e92b5c2df245701eb2a9396330f
```

The untracked Hostinger artifact identified by Gitleaks was quarantined at:

```text
/root/backups/frankai-site/20260801T063142Z-reconciliation/quarantine/
```

It was removed from the repository tree without printing its contents and was
not committed.

## C. Source control

### Committed

Commit `f55c972` contains only reviewed authentication, staging packaging/unit,
test, and documentation changes, including:

- MFA QR generation and enrollment UI.
- Fail-closed administrator bootstrap.
- Administrator GET-route rate limiting.
- MFA setup audit coverage.
- Staging test safety assertions.
- Standalone packaging correction.
- Staging systemd template.
- Current authentication, deployment, dependency, restore, and browser docs.

### Preserved and excluded

The following remain unstaged and were not included in the authentication
commit:

```text
app/contact/page.tsx
app/globals.css (unrelated design hunks remain unstaged)
app/sitemap.ts
components/SiteFooter.tsx
components/SiteHeader.tsx
components/platform/PlatformAdminClient.tsx
.env.example
app/api/contact/
components/ContactForm.tsx
test-results/
```

The untracked contact, navigation, design, and generated test artifacts remain
preserved for separate review.

### Secret scanning

**TESTED:** committed candidate source scan with Gitleaks v8.24.2 returned no
findings. Earlier full Git history scanning also returned no findings.

Ignored local `.env` files remain outside the candidate and were not printed or
committed. Their presence does not resolve the Hostinger provider-side incident.

## D. Staging repairs

### Standalone entrypoint

The staging unit previously referenced a missing nested server path. The unit
template and the active staging unit now use:

```text
/root/frankai-site/.next/standalone/server.js
```

For acceptance, staging was run from the isolated candidate worktree:

```text
/root/worktrees/frankai-reconciliation-rc1/.next/standalone/server.js
```

**TESTED:** staging restart passed, application HTTP returned 200, and proxy
HTTP returned 200.

### Caddy

The staging Caddyfile is valid when tested with the adapter declared by its
systemd unit:

```text
caddy validate --config /etc/caddy/frankai-staging.Caddyfile --adapter caddyfile
```

No production Caddy configuration was changed.

## E. Authentication acceptance

### Candidate tests

| Test | Result |
|---|---|
| `npm run lint` | PASS |
| Default candidate `npm test` | 8 passed, 1 skipped without staging flags |
| Guarded staging `npm test` | 9 passed, 0 skipped |
| Guarded `npm run test:browser` | 5 passed, 0 skipped |
| Candidate `npm run build` | PASS |
| Candidate source Gitleaks | PASS |
| Production dependency audit | 3 high, 0 critical |

### Browser journeys passed

- Protected and public staging boundaries.
- No microphone permission request.
- Invitation redemption and email verification.
- Password reset with old-session invalidation.
- Administrator MFA enrollment and recovery-code acknowledgement.

The staging test guard requires `STAGING_E2E=true`,
`AUTH_DATABASE_ENABLED=true`, and a database named exactly
`frankai_auth_staging`. It rejects the production origin and production
database before test data is created.

Administrator mutation, recent-MFA, session-management, and final-admin browser
journeys remain outside the current Playwright suite.

## F. Administrator security

The candidate includes:

- Encrypted TOTP secret storage.
- Hashed recovery codes.
- MFA setup audit events.
- MFA enrollment and challenge events.
- Recent-MFA assurances.
- Final-administrator invariant checks.
- Transaction-scoped administrator locking.
- Explicit rate limiting on administrator read routes declared by the route inventory.
- CSRF and Origin enforcement on sensitive mutations.

The guarded integration test passed concurrent administrator-demotion
serialization. Full browser acceptance for administrator mutations and recent
reauthentication remains pending.

## G. Email status

```text
SMTP_STAGING_PARTIAL
```

Staging uses Mailpit capture and the current outbox contains password-reset and
password-change evidence. The current browser suite does not verify every
enabled email template or delivery failure path. Production SMTP readiness is
not established.

## H. Database isolation

```text
DATABASE_ISOLATION_VERIFIED
```

The review found and corrected an actual ACL defect: `frankai_auth_app` had
staging table privileges and public database access.

Corrective actions:

- Revoked public `CONNECT` on both authentication databases.
- Revoked `frankai_auth_app` staging schema/table/sequence privileges.
- Granted production database access only to production roles.
- Granted staging database access only to staging roles.

Final checks:

```text
production role → production database: PASS
production role → staging data: DENIED
staging role → staging database: PASS
staging role → production data: DENIED
```

Runtime and migration roles remain non-superuser, `NOCREATEDB`, and
`NOCREATEROLE`.

## I. Database recovery

```text
OPERATIONAL_RESTORE_VERIFIED
```

The exact current staging dump was restored into a disposable database. The
reconciled candidate then:

- Started on loopback port 4590.
- Returned health HTTP 200.
- Allowed the staging runtime role to read application data.
- Denied runtime access to `schema_migrations`.
- Cleaned up the disposable database; zero restore databases remained.

The dump generated by the available PostgreSQL client contained an unsupported
`SET transaction_timeout` statement. The original dump was not modified; the
temporary restore SQL stream removed only that unsupported session-setting line.
This compatibility requirement is recorded in the protected evidence.

## J. Dependency security

Candidate production-only audit:

```text
0 critical
3 high
0 moderate
0 low
```

The high findings involve the Next.js/PostCSS/sharp dependency chain. They were
not automatically dismissed as unreachable. No forced upgrade was performed.

Dependency status: `PRODUCTION_BLOCKER` until reachability is resolved through a
controlled upgrade or formally accepted by Ray.

## K. Static authentication

```text
STATIC_APPLICATION_AUTH_RETIRED
```

No FrankAI application administrator Basic/Bearer gate remains. Infrastructure
authentication for Mailpit and unrelated service endpoints is separate.

## L. Credential incident

```text
ROTATION_REQUIRED
```

No provider-side Hostinger revocation or replacement evidence was available.
The token incident remains a production blocker.

## M. Voice status

```text
VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION
```

Voice was not enabled. The candidate retains fail-closed voice behavior, no
active voice sessions, no microphone request, disabled transcript/audio
retention, and deny-all tool authority.

## N. Production status

```text
BLOCKED
```

The candidate is not deployed to production. The live production process still
uses its prior build fingerprint and was intentionally not restarted.

Blocking conditions:

- Hostinger token rotation is unconfirmed.
- Three high production dependency findings remain unresolved.
- SMTP staging acceptance is partial.
- Current production runtime does not yet exactly match `f55c972`.
- Formal production remediation approval is absent.

## O. Acceptance matrix

| Control | Code | Committed | Unit | Integration | Concurrency | Browser | SMTP | Audit | Staging | Production | Restore | Evidence | Status | Blocker |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| Production release reproducibility | Y | Y | Y | Y | — | — | — | — | Y | N | Y | Candidate build | PARTIAL | Yes |
| JWT validation | Y | Y | Y | — | — | — | — | — | Y | Y | Y | Candidate tests | PASS | No |
| Authoritative account state | Y | Y | P | P | — | — | — | P | Y | Y | Y | Runtime/code | PARTIAL | Yes |
| Refresh rotation | Y | Y | — | P | P | — | — | P | Y | Y | Y | Code/history | PARTIAL | Yes |
| Concurrent refresh | Y | Y | — | P | Y | — | — | P | P | Y | Y | Historical/current | PARTIAL | Yes |
| Refresh replay | Y | Y | P | P | P | — | — | P | P | Y | Y | Code/history | PARTIAL | Yes |
| Cookies | Y | Y | — | P | — | P | — | — | Y | Y | Y | Config/browser | PARTIAL | Yes |
| CSRF | Y | Y | P | P | — | P | — | P | Y | Y | Y | Candidate routes | PARTIAL | Yes |
| Origin validation | Y | Y | P | P | — | P | — | P | Y | Y | Y | Candidate routes | PARTIAL | Yes |
| PostgreSQL authority | Y | Y | — | Y | — | — | — | — | Y | Y | Y | Runtime/restore | PASS | No |
| Database grants | Y | Y | — | Y | — | — | — | — | Y | Y | Y | ACL checks | PASS | No |
| Cross-database isolation | Y | Y | — | Y | — | — | — | — | Y | Y | Y | Four role tests | PASS | No |
| Invitations | Y | Y | — | P | — | Y | P | P | Y | Y | Y | Browser/outbox | PARTIAL | Yes |
| Verification | Y | Y | — | P | — | Y | P | P | Y | Y | Y | Browser/outbox | PARTIAL | Yes |
| Password recovery | Y | Y | — | P | — | Y | P | P | Y | Y | Y | Browser/outbox | PARTIAL | Yes |
| Old-session invalidation | Y | Y | — | Y | — | Y | — | P | Y | Y | Y | Browser/restore | PASS | No |
| MFA enrollment | Y | Y | — | Y | — | Y | — | Y | Y | Y | Y | Browser/audit | PASS | No |
| MFA challenge | Y | Y | — | P | — | P | — | Y | Y | Y | Y | Code/audit | PARTIAL | Yes |
| MFA recovery | Y | Y | — | P | — | P | — | Y | Y | Y | Y | Code/audit | PARTIAL | Yes |
| MFA reset | Y | Y | — | P | — | — | P | P | P | Y | Y | Code only | NOT_RUN | Yes |
| Recent MFA | Y | Y | — | P | — | — | — | P | P | Y | Y | Code only | PARTIAL | Yes |
| Final administrator | Y | Y | — | Y | Y | — | — | P | Y | Y | Y | Concurrency test | PARTIAL | Yes |
| Administrator APIs | Y | Y | P | P | P | — | — | P | Y | Y | Y | Route review | PARTIAL | Yes |
| Administrator UI | Y | Y | — | P | — | Y | — | — | Y | Y | Y | MFA browser | PARTIAL | Yes |
| Session management | Y | Y | — | P | — | — | — | P | P | Y | Y | Code only | NOT_RUN | Yes |
| Distributed rate limiting | Y | Y | — | P | P | — | — | P | P | Y | Y | Historical/code | PARTIAL | Yes |
| Account locking | Y | Y | P | P | P | — | — | P | P | Y | Y | Code only | PARTIAL | Yes |
| SMTP templates | Y | Y | — | P | — | P | P | P | P | — | — | Mailpit/outbox | PARTIAL | Yes |
| Audit completeness | Y | Y | P | P | — | — | — | P | P | Y | Y | Event review | PARTIAL | Yes |
| Static-auth retirement | Y | Y | Y | — | — | P | — | P | Y | Y | Y | Runtime/Caddy | PASS | No |
| Secret scanning | Y | Y | — | — | — | — | — | — | Y | Y | — | Candidate Gitleaks | PASS | No |
| Dependency security | Y | Y | — | — | — | — | — | — | Y | Y | — | npm audit | FAIL | Yes |
| Staging restart | Y | Y | — | — | — | — | — | — | Y | — | — | systemd/HTTP | PASS | No |
| Staging Caddy validation | Y | Y | — | — | — | — | — | — | Y | — | — | adapter validation | PASS | No |
| Voice-disabled boundary | Y | Y | — | P | — | Y | — | P | Y | Y | Y | Browser/config | PASS | No |
| Operational restore | Y | Y | — | Y | — | — | — | — | Y | — | Y | Disposable restore | PASS | No |
| Rollback readiness | Y | Y | — | — | — | — | — | — | P | P | Y | Protected backup | PARTIAL | Yes |
| Hostinger rotation | — | — | — | — | — | — | — | — | — | — | — | No provider evidence | BLOCKED | Yes |
| Documentation accuracy | Y | Y | — | — | — | — | — | — | Y | P | — | Updated docs | PARTIAL | Yes |

## P. Risk register

| ID | Risk | Severity | Environment | Current mitigation | Residual risk | Required action | Owner | Production blocker |
|---|---|---|---|---|---|---|---|---|
| R1 | Hostinger token not provider-rotated | CRITICAL | External/production | Candidate/source scans clean; artifact quarantined | Old credential may remain valid | Provider-side revoke and rotate | Ray | Yes |
| R2 | Live production build differs from candidate | HIGH | Production | Process left running; exact build fingerprint captured | Restart may reintroduce uncommitted behavior | Approve and deploy only after gate | Ray/Codex | Yes |
| R3 | Three high dependency findings | HIGH | Production | Findings recorded; no forced upgrade | Runtime reachability unresolved | Controlled remediation or formal acceptance | Ray/Codex | Yes |
| R4 | SMTP acceptance incomplete | HIGH | Staging/production | Mailpit and partial outbox evidence | Recovery/template failures may remain | Verify every enabled template and failure path | Codex | Yes |
| R5 | Current-release restore initially required compatibility workaround | MEDIUM | Recovery | Exact restore passed after removing unsupported session setting from temporary SQL | Tool/version mismatch could recur | Pin/document compatible pg_dump/restore tooling | Codex | Yes |
| R6 | Services run as root | HIGH | Production/staging | Systemd hardening present | Larger compromise impact | Migrate staging first, then approved production change | Ray/Codex | Recommended |
| R7 | Staging proxy binds `*:8443` | MEDIUM | Staging | Application remains loopback; firewall needs confirmation | Proxy exposure depends on firewall | Confirm and document external policy | Ray/Codex | Potential |
| R8 | Administrator mutation/recent-MFA browser gaps | HIGH | Production/staging | Code and route contract present | Sensitive journeys not fully demonstrated | Add and run browser journeys | Codex | Yes |
| R9 | Unrelated working-tree changes | MEDIUM | Repository | Excluded from commit and preserved | Future accidental mixed release | Review separately | Ray/Codex | Yes |
| R10 | Ignored local environment files | HIGH | Host/repository | Not tracked or printed; permissions protected | Local secrets remain on host | Maintain permissions and rotate affected external credentials | Ray | Yes |
| R11 | Voice code remains present | LOW | Both | Explicitly disabled and fail-closed | Future accidental activation | Keep separate activation gate | Ray/Codex | No |

## Q. Remaining blockers

Only demonstrated blockers remain:

1. Provider-side Hostinger token rotation is unconfirmed.
2. Three high production dependency findings remain unresolved.
3. SMTP template and failure-path acceptance is partial.
4. The active production build does not yet exactly match `f55c972`.
5. Administrator mutation, recent-MFA, session-management, and final-admin
   browser acceptance remains incomplete.
6. Production remediation approval is not recorded.

## R. Manual actions required from Ray

- Confirm provider-side Hostinger token revocation and replacement, without
  recording the token value.
- Confirm whether the existing PostgreSQL production activation was authorised.
- Decide the production SMTP provider and provide credentials only through the
  protected service environment process.
- Formally accept or reject any unresolved production-reachable dependency risk.
- Approve a future production remediation only after the mandatory gate passes.
- Enter production administrator credentials and MFA only if an explicitly
  approved remediation requires it.

## Final decision

```text
RECONCILIATION_RELEASE_CANDIDATE=f55c972
PRODUCTION_STATUS=BLOCKED
PRODUCTION_RESTART=NOT_PERFORMED
VOICE=DISABLED
```

The active production authentication system has been captured and the
reconciliation candidate is reproducible, staged, tested, isolated, and
restorable. It must not be deployed or used to restart production until the
remaining blockers and explicit approval are closed.
