# FrankAI production authentication deployment decision

Date: 2026-08-01 (Australia/Brisbane)
Decision scope: pre-deployment closure only. Production was not restarted,
redeployed, or reconfigured.

## Decision

```text
Candidate: f55c972
Documentation: ede276f
PRODUCTION_STATUS=PRODUCTION_ACTIVE_UNCHANGED
VOICE=VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION
CREDENTIAL_STATUS=ROTATION_CONFIRMED
SMTP_STATUS=SMTP_STAGING_PARTIAL
DECISION=NOT_READY_FOR_PRODUCTION
```

The candidate remains blocked by incomplete workflow/audit acceptance and the
fact that production still runs the prior build. No production change is
authorized by this document.

## Candidate identity

- Source: `f55c972c8bec67854d8c5cc715c912cbc47e75ec`; tree
  `a106ed7325dbe61aa262e02ae2c5041b81d3d16d`.
- Evidence documentation: `ede276f36574d021ff23d0f0fbc0ea92ba2d1950`.
- Final acceptance evidence commits: `f11c941` and `aa2fbbb`; application
  candidate remains `f55c972` because these commits contain only tests,
  staging guard/configuration, and documentation.
- Package checksum: `f51253d7bdb1fbf994c16522806535ab43f2f1f2babf9d9fe89a7796cc607747`.
- Lockfile checksum: `4cc3d9c66a91b55e8f8c8c6b426342f29a4335539b043509bff9c2b64a090cac`.
- Candidate standalone tree checksum: recorded in
  `final-candidate/manifest.txt`; the candidate is the exact staging
  worktree at `/root/worktrees/frankai-reconciliation-rc1`.
- Migrations: `001_auth`, `002_admin_mfa`, `003_control_plane`,
  `004_runtime_grants`, `005_admin_controls`; individual checksums are in
  the manifest.
- Backup/evidence: `/root/backups/frankai-site/20260801T063142Z-reconciliation/`.
- Restore evidence: `OPERATIONAL_RESTORE_VERIFIED` for the unchanged
  `f55c972` candidate.
- Runtime: Node `v24.18.0`, npm `11.16.0`, Next.js `16.2.12`, Gitleaks
  `v8.24.2`.

## Verification completed

- Production service active and public/local health HTTP 200; staging and
  staging proxy active and HTTPS health HTTP 200.
- Guarded Playwright staging suite: 8 passed, 0 failed; no traces/screenshots
  were retained by the configured suite.
- The new staging acceptance suite covers MFA enrollment/challenge/recovery,
  recent reauthentication, administrator mutation authorization, MFA reset,
  final-administrator protection, multi-session listing/revocation,
  logout-all, cross-user denial, lock threshold, and administrator unlock.
- The fail-closed staging guard now requires `STAGING_E2E=true`,
  `AUTH_DATABASE_ENABLED=true`, `DATABASE_NAME=frankai_auth_staging`,
  `APP_BASE_URL=https://staging.localhost:8443`, and `VOICE_ENABLED=false`;
  its production-configuration rejection test passes.
- Lint passed; the guarded unit/integration suite passed `10/10`, including
  concurrent administrator demotion serialization. The isolated candidate
  build passed without modifying the production active build path.
- Staging Caddy validated with the declared `caddyfile` adapter.
- Database isolation: `DATABASE_ISOLATION_VERIFIED`; production role CONNECT
  to staging is denied and staging role CONNECT to production is denied.
  Runtime roles are non-superuser, `NOCREATEDB`, and `NOCREATEROLE`; public
  schema CREATE and migration-table access are denied.
- Voice remains fail-closed with `VOICE_ENABLED=false`,
  `TRANSCRIPT_RETENTION_ENABLED=false`, and `AUDIO_RETENTION_ENABLED=false`.
- Hostinger local scans found no token value in committed source, Git history,
  candidate build, staging configuration, recent staging logs, or evidence.
- Ray confirmed provider-side deletion of the old `HOSTINGER-API-TOKEN` on
  2026-08-01; no replacement token is recorded here.

## SMTP acceptance

Enabled template implementation contains: `INVITATION`,
`EMAIL_VERIFICATION`, `PASSWORD_RESET`, `PASSWORD_CHANGED`,
`MFA_DISABLED`, `ADMIN_SECURITY_ALERT`, and `NEW_LOGIN`. All seven controlled
template sends reached local Mailpit with the staging sender and no production
hostname. Action tokens appeared only in the three intended action URLs and
were absent from outbox payloads. Delivery rows recorded `SENT` with one
attempt. A controlled unavailable-SMTP test recorded `FAILED`, one attempt,
and a bounded retry timestamp with no token in the payload.

Status remains `SMTP_STAGING_PARTIAL`: browser proof covers invitation
redemption, verification, and password reset, but does not yet cover every
mail-triggering administrator workflow, resend/revocation, expiry, or the
complete failure policy through the browser. Production SMTP provider and
credentials are not configured.

The seven template identifiers are present in the mail renderer. Only
invitation, verification, password-reset, and password-changed are currently
triggered by application workflows; `MFA_DISABLED`, `ADMIN_SECURITY_ALERT`,
and `NEW_LOGIN` have no current application trigger. Direct Mailpit renderer
acceptance exists for all seven, but that is not equivalent to an end-to-end
application workflow, so the status is intentionally not promoted.

## Final staging acceptance results

- MFA enrollment, invalid challenge, valid challenge, recovery-code first use,
  recovery-code reuse rejection, and recent reauthentication: PASS.
- Administrator status mutation, unlock, MFA reset, secondary-admin demotion,
  and final-admin demotion rejection: PASS.
- User session listing, current-session identification, individual revocation,
  refresh rejection after revocation, logout-all, and cross-user denial: PASS.
- Account-lock threshold, generic failure responses, authoritative lock state,
  and administrator unlock: PASS. Fifteen-minute expiry was not waited out in
  this run and remains PARTIAL.
- Browser artifacts are not retained by configuration; the failed intermediate
  run artifact was removed.

## Audit acceptance results

The acceptance suite observed successful and rejected login, MFA, reauth,
administrator mutation, MFA reset, session revocation, logout-all, refresh,
lock, unlock, invitation, verification, and password-reset events. Rejected
final-administrator mutation was verified at the state boundary, but the
current backend does not emit a corresponding rejected-action audit event.
The audit schema contains request/source fields, while the current helper does
not perform recursive key/value redaction. Complete registry coverage and
value-pattern redaction therefore remain PARTIAL and are production blockers.

## Dependency disposition

The current audit reports 3 high findings, 0 critical: PostCSS
`GHSA-6g55-p6wh-862q` (<=8.5.11), PostCSS `GHSA-r28c-9q8g-f849` (<=8.5.17),
and sharp/libvips `GHSA-f88m-g3jw-g9cj` (<0.35.0). The first two are
`NOT_INCLUDED_IN_STANDALONE` / `NOT_RUNTIME_REACHABLE`: PostCSS is used only
by the controlled build over trusted repository CSS, and no user CSS pipeline
exists. The sharp finding is `MITIGATED_BY_CONFIGURATION`: sharp is present
for Next image optimization, but the app has no uploads, arbitrary remote
images, image API, or attacker-controlled image body/URL; configured image
inputs are fixed local assets. This reachability disposition is supported by
the source/configuration and standalone inspection, not severity alone.

A focused temporary override candidate using PostCSS 8.5.18 and sharp 0.35.3
produced a 0-high audit and passed lint, tests, and build, but it was not
promoted because its npm-generated lockfile churn requires a separate focused
review and staging restart. No dependency change was applied to this final
`f55c972` candidate.

## Production comparison and deployment plan

Current production fingerprint is the protected `f6062b4` capture and its
existing standalone build/service/Caddy checksums. The candidate changes the
authentication control plane, PostgreSQL migrations/grants, standalone
packaging, secure route behavior, and related evidence. Production remains on
the prior process/build; no session, database, configuration, or user-visible
change has been applied. Expected session impact is reauthentication/session
invalidations only under an approved cutover plan.

After all gates are approved: recheck fingerprints, back up production, start
the exact candidate on an alternate loopback port, run local authentication
smoke tests, perform the reviewed systemd/proxy switch, verify public HTTPS,
administrator/session/email behavior, confirm voice-disabled behavior, and
monitor logs/health. This sequence is a future plan, not an action taken here.

## Rollback

Rollback thresholds are any failed health check, authentication boundary,
database isolation check, secret-scan result, email safety check, or
administrator verification. Restore the previous process/build, systemd and
Caddy declarations, and environment from the protected backup; do not use a
destructive database shortcut. Database rollback is policy-controlled because
authentication mutations may have occurred. After rollback, verify public
HTTPS, auth/session behavior, database connectivity, email safety, and voice
disabled state, and document session consequences.

## Acceptance matrix

| CONTROL | IMPLEMENTED | AUTOMATED_TEST | CONCURRENCY_TEST | BROWSER_TEST | SMTP_TEST | AUDIT_TEST | STAGING_ACTIVE | PRODUCTION_ACTIVE | RESTORE_TEST | EVIDENCE_CURRENT | STATUS | BLOCKER |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Candidate reproducibility | PASS | PASS | NOT_RUN | NOT_RUN | NOT_RUN | PASS | PASS | PARTIAL | PASS | PASS | PARTIAL | active build differs |
| Hostinger rotation | PASS | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | PASS | NOT_RUN | PARTIAL | NOT_RUN | CURRENT | PASS | none |
| JWT / refresh / cookies / CSRF / origin | PASS | PASS | PASS | PARTIAL | NOT_RUN | PARTIAL | PASS | PASS | PASS | PASS | PARTIAL | broader browser matrix |
| Invitations / verification / recovery | PASS | PASS | NOT_RUN | PASS | PARTIAL | PARTIAL | PASS | NOT_RUN | PASS | CURRENT | PARTIAL | complete mail/browser coverage |
| MFA / recent MFA / final administrator | PASS | PASS | PASS | PASS | PARTIAL | PARTIAL | PASS | NOT_RUN | PASS | CURRENT | audit rejection coverage |
| User management / sessions / locking / rate limits | PASS | PASS | PARTIAL | PASS | NOT_RUN | PARTIAL | PASS | NOT_RUN | PASS | CURRENT | lock expiry/concurrency/audit categories |
| SMTP templates and failure path | PASS | PASS | NOT_RUN | PARTIAL | PARTIAL | PARTIAL | PASS | NOT_RUN | NOT_RUN | CURRENT | production provider and full journeys |
| Audit completeness/redaction | PARTIAL | PASS | NOT_RUN | PARTIAL | PASS | PARTIAL | PASS | NOT_RUN | PASS | CURRENT | recursive redaction and rejected-action events |
| Database isolation | PASS | PASS | NOT_RUN | NOT_RUN | NOT_RUN | PASS | PASS | PASS | PASS | PASS | PASS | none |
| Static-auth retirement / secret scanning | PASS | PASS | NOT_RUN | PASS | NOT_RUN | PASS | PASS | PASS | PASS | PASS | PASS | none |
| Next/PostCSS advisories | PASS | PASS | NOT_RUN | NOT_RUN | NOT_RUN | PASS | PASS | PARTIAL | NOT_RUN | CURRENT | disposition review |
| Sharp/libvips advisory | PASS | PASS | NOT_RUN | PASS | NOT_RUN | PASS | PASS | PARTIAL | NOT_RUN | CURRENT | configuration mitigation |
| Voice-disabled boundary | PASS | PASS | NOT_RUN | PASS | NOT_RUN | PASS | PASS | PASS | PASS | PASS | PASS | none |
| Operational restore / restart / Caddy | PASS | PASS | NOT_RUN | PASS | NOT_RUN | PASS | PASS | NOT_RUN | PASS | PASS | PASS | none |
| Rollback readiness / deployment approval | PARTIAL | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | PARTIAL | PARTIAL | PASS | CURRENT | Ray approval |

## Approval gates

- [x] Hostinger rotation confirmed
- [ ] SMTP staging accepted and production provider decided
- [ ] Dependency findings closed by the documented dispositions or separately
      accepted by Ray
- [x] Operational restore verified for the unchanged candidate
- [x] Candidate fingerprint complete
- [ ] Production comparison reviewed
- [x] Voice disabled
- [ ] Ray approval recorded

## Manual actions required from Ray

- Decide the production SMTP provider and provide credentials only through the
  protected service environment process.
- Formally accept any production-reachable dependency risk if the disposition
  changes after review.
- Review and approve this deployment decision package.
- Provide separate explicit authorization before any production deployment.

Final decision: `NOT_READY_FOR_PRODUCTION`.

## Final closure attempt — 2026-08-02

- `ROTATION_CONFIRMED`; production remains active and unchanged.
- Four active email templates are registry-controlled. Three renderer-only
  templates are explicitly `INACTIVE_RESERVED` and fail closed.
- Lint, registry/redaction tests, and the staging Playwright suite passed 8/8.
- The staging build was rebuilt and restarted only on staging. Protected
  production build identity, health, isolation, and voice-disabled checks
  remain verified.
- The final-admin rejection was observed as a rejected
  `admin_final_admin_action_rejected` audit event.
- SMTP remains `SMTP_STAGING_PARTIAL`: protected Mailpit evidence covers active
  renderer delivery and the bounded failure path, but privileged outbox
  reinspection and complete browser-trigger/error-policy proof are not current.
- Audit redaction is `AUDIT_REDACTION_VERIFIED` by recursive key/value tests;
  semantic staging category coverage remains partial.

Final closure status: `RECONCILIATION_RELEASE_CANDIDATE_PARTIAL`.
Deployment decision: `NOT_READY_FOR_PRODUCTION`.

## Final reconciliation update — 2026-08-02

The current working-tree change adds a fail-closed email registry and recursive
audit redaction. Four templates are `ACTIVE_TRIGGERED`; `MFA_DISABLED`,
`ADMIN_SECURITY_ALERT`, and `NEW_LOGIN` remain `INACTIVE_RESERVED` pending an
approved policy and trigger. Registry/redaction unit tests pass and the
isolated staging Playwright suite passes 8/8. SMTP message inspection, active
workflow delivery proof, live audit-category observation, and final-admin
rejection observation are not current because staging is still running the
prior candidate and the expected Mailpit API returned 404. Recommendation
remains `NOT_READY_FOR_PRODUCTION`; no production action was taken.

## SMTP phase status — 2026-08-02

The VPS outbound-only Postfix/Rspamd stack is installed for staging preparation.
Local submission is loopback-only, approved envelope senders are enforced, and
a sanitized queue test verified Rspamd DKIM signing. Production remains
unchanged and no production SMTP switch was performed.

Direct-delivery readiness is pending manual DNS/PTR alignment
(`mail.frankai.online` A, Hostinger PTR, merged SPF, DKIM TXT, and aligned
DMARC) and a trusted ACME certificate. See `docs/smtp-dns-required.md` and
`docs/smtp-staging-acceptance.md`.

## SMTP DNS/TLS acceptance phase — 2026-08-03

The authoritative and public A record now resolve `mail.frankai.online` to
`76.13.180.125`. A temporary validated Caddy ACME route obtained a Let’s
Encrypt certificate without stopping Caddy or changing the production
application; the original production Caddyfile was restored. Postfix TLS
verification succeeds with TLS 1.3 and OpenSSL verify code 0. Renewal issuance
is not yet authorized/proven.

PTR still resolves to `srv1661521.hstgr.cloud`; SPF remains Hostinger-only;
DKIM TXT is absent; DMARC remains the previous `p=none` record; and no
controlled Gmail/Outlook/Yahoo recipients were provided. Status remains
`VPS_SMTP_PARTIALLY_READY`; production remains `PRODUCTION_ACTIVE_UNCHANGED`.

## 2026-08-04 SMTP acceptance decision

The final-phase audit confirms public A/PTR/FCrDNS, merged SPF, and corrected
DKIM, but DMARC has no monitored `rua`, Caddy is failed
on a file-permission error, and no controlled provider recipients were
available. The decision remains `NOT_READY_FOR_PRODUCTION_SMTP`; see
`docs/20260804-smtp-acceptance-report.md` and
`docs/20260804-production-smtp-activation.md`.
