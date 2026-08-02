# FrankAI authentication staging acceptance

This is an evidence ledger, not a production approval record. **OBSERVED
2026-08-01:** production is PostgreSQL-backed on `frankai-site.service` port
4300 using `frankai_auth`; the earlier file-backed statement is stale. Voice
remains disabled. Hostinger token rotation remains outstanding.

## Current staging evidence

- Branch: `security/frankai-auth-control-plane`.
- Permanent service: `frankai-site-staging.service` on `127.0.0.1:4500`.
- Local HTTPS boundary: `staging.localhost:8443` through a separate proxy unit.
- Database: `frankai_auth_staging`, with dedicated migration and runtime roles.
- Migrations applied: `001_auth`, `002_admin_mfa`, `003_control_plane`,
  `004_runtime_grants`, `005_admin_controls`.
- Runtime role is non-superuser, cannot create databases or roles, cannot create
  in `public`, and is denied `schema_migrations`.
- `npm run lint`, `npm test`, and `npm run build` pass.
- Pinned Gitleaks v8.24.2 finds no leaks in Git history. The raw working-tree
  scan also inspected ignored local `.env` and `.next` files and reported only
  those local/generated artifacts; those files are not tracked or staged.
- Playwright Chromium is installed locally. The latest default run before the
  reconciliation suite passed 2 tests and skipped 3 authentication journeys
  because explicit staging flags were not loaded.
- A protected staging test gate now rejects the production database and origin.
  Full authenticated acceptance remains pending the gated rerun.
- Production systemd, production environment, and production Caddy routing
  were not changed.

## Acceptance matrix

| Control | Implemented | Unit test | Integration test | Browser test | Staging evidence | Status | Blocker |
|---|---:|---:|---:|---:|---|---|---|
| JWT validation | Yes | Partial | Not run | No | Build and source review | PARTIAL | Negative JWT suite |
| Refresh rotation/replay | Yes | No | Not run | No | Source only | PARTIAL | Concurrent runtime flow |
| Secure cookies | Yes | No | No | Partial | HTTPS staging boundary | PARTIAL | Authenticated cookie inspection |
| CSRF and Origin | Yes | No | No | No | Source inventory | PARTIAL | Negative API/browser suite |
| PostgreSQL authority | Yes | Yes | Partial | No | Dedicated staging DB | PARTIAL | Full workflow run |
| Runtime grants | Yes | No | Yes | No | Role/privilege inspection | PASS | — |
| Invitations | Yes | No | No | No | Routes/schema present | PARTIAL | Mail capture/redemption |
| Verification | Yes | No | No | No | Routes/schema present | PARTIAL | Mail capture/workflow |
| Password recovery | Yes | No | No | No | Routes/schema present | PARTIAL | Mail capture/invalidation |
| MFA enrollment/challenge/recovery | Yes | No | Partial | No | Bootstrap and routes | PARTIAL | Full identity workflow |
| Recent MFA | Yes | No | Partial | No | Route inventory and guard | PARTIAL | Every sensitive route test |
| Final administrator protection | Yes | No | Yes | No | Advisory-lock concurrency test | PARTIAL | Broader operation matrix |
| User-management APIs | Yes | No | No | No | Routes/build | PARTIAL | Authenticated API suite |
| User-management UI | Partial | No | No | Partial | Protected pages/build | PARTIAL | Interactive UI flows |
| Session management | Yes | No | No | No | Existing routes | PARTIAL | Refresh/revocation flow |
| Distributed rate limiting | Yes | No | No | No | PostgreSQL buckets | PARTIAL | Two-process threshold tests |
| Account locking | Yes | No | No | No | Login implementation | PARTIAL | Runtime lockout suite |
| Static application auth retirement | Yes | No | Partial | Partial | Headers rejected; Caddy app route reviewed | PARTIAL | Production cutover verification |
| Secret scanning | Yes | Yes | N/A | N/A | History clean; local ignored artifacts reported | PASS | Remove local artifacts before release |
| Audit completeness | Partial | No | No | No | Audit helpers/routes | PARTIAL | Event-by-event assertions |
| Voice-disabled boundary | Yes | Yes | Partial | Yes | `VOICE_ENABLED=false`; no mic request | PARTIAL | Provider-invocation test |
| Operational restore | Yes | No | Yes | No | Disposable candidate, runtime grants, and privilege-denial checks | PASS | Full authenticated restore mutation |
| Rollback | Partial | No | Partial | No | Protected backups/docs | PARTIAL | Full cutover rehearsal |

## Release decision

Staging is isolated and partially accepted. The service restart path has been
reconciled to `.next/standalone/server.js` and the Caddyfile validates with its
declared adapter. It is not production-ready because the credential incident
is unresolved and the full authenticated/browser, mail, refresh-concurrency,
and current-release restore suites remain incomplete.

## New acceptance evidence — 2026-07-30

- JWT negative coverage now runs through the TypeScript test loader: eight tests
  pass when the staging integration flag is enabled.
- Refresh rotation is transactionally serialized with row locks in PostgreSQL;
  the disposable staging race produced one success and one rejection.
- The email outbox no longer stores token/password/secret/code payload fields.
  A password-reset message was captured by the local Mailpit sink.
- Two isolated staging processes shared login rate limiting and produced 429
  after the configured threshold.
- A disposable standalone candidate successfully ran against a restored
  database with runtime privilege-denial checks. Restore classification is now
  `OPERATIONAL_RESTORE_VERIFIED`.
- Next.js, Nodemailer, and Playwright were upgraded to reviewed patched releases.
  The remaining npm advisories are documented in
  [dependency-security-review.md](dependency-security-review.md).
- The standalone asset preparation now copies client assets beside the nested
  server entrypoint; staging browser hydration was previously failing with
  static-asset 404s.
- The staging issuer is aligned to `https://staging.localhost:8443`, allowing
  Origin and CSRF validation to operate correctly through the staging proxy.
- MFA TOTP generation uses RFC 6238-compatible Base32 encoding, and the setup
  page requires explicit acknowledgement after displaying recovery codes.

The release remains `STAGING_AUTH_PARTIALLY_ACCEPTED`: administrator mutation
browser flows, all enabled SMTP templates, complete audit-category coverage,
and final dependency reachability disposition have not been exercised
end-to-end.

## Final gate reconciliation — 2026-08-02

- Email registry is authoritative in `lib/auth/email.ts`: `INVITATION`,
  `EMAIL_VERIFICATION`, `PASSWORD_RESET`, and `PASSWORD_CHANGED` are
  `ACTIVE_TRIGGERED`; `MFA_DISABLED`, `ADMIN_SECURITY_ALERT`, and `NEW_LOGIN`
  are `INACTIVE_RESERVED` because no approved trigger or recipient policy exists.
- Inactive templates fail closed at dispatch. Active templates require a
  recipient and token-bearing templates require an action token; staging action
  URLs are restricted to `staging.localhost`.
- Recursive audit redaction and an audit registry are now unit-tested. The
  sanitized coverage matrix is [audit-coverage-matrix.json](evidence/auth-staging/audit-coverage-matrix.json).
- Playwright remains 8/8 against isolated staging. SMTP delivery and live audit
  database observation remain unproven because the expected Mailpit API endpoint
  returned 404 and staging is still running the prior candidate runtime.

## Final acceptance-gate rerun — 2026-08-01

- Hostinger provider-side deletion was confirmed by Ray; status is
  `ROTATION_CONFIRMED`. No token value is retained.
- The fail-closed staging guard now requires the staging database name,
  staging origin, and `VOICE_ENABLED=false`, and a production-configuration
  rejection test passes.
- The complete serialized Playwright suite passed **8/8**. New coverage
  includes administrator MFA challenge and recovery-code reuse rejection,
  recent reauthentication, administrator mutation authorization, MFA reset,
  final-administrator protection, multi-session revocation/logout-all,
  cross-user denial, account-lock threshold, and administrator unlock.
- Database isolation remains verified; production and staging runtime roles are
  non-superuser, `NOCREATEDB`, and `NOCREATEROLE`. Voice environment flags are
  false and no active voice session or AI configuration rows exist.
- SMTP remains `SMTP_STAGING_PARTIAL`: all seven renderer templates and the
  bounded failure path have Mailpit evidence, but three defined templates have
  no current application trigger and complete browser/error-policy coverage is
  not established.
- Audit acceptance remains partial: tested actions are recorded, but complete
  registry coverage, rejected final-admin audit events, and recursive value
  redaction are not yet proven.
