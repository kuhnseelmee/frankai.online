# FrankAI authentication staging acceptance

This is an evidence ledger, not a claim that production is active. The reviewed checkpoint is commit `3b4bb40` on `security/frankai-auth-control-plane`. Production remains on its existing service and file-backed mode.

## Verified evidence

- PostgreSQL migrations `001_auth`, `002_admin_mfa`, `003_control_plane`, and `004_runtime_grants` apply idempotently to the protected staging database.
- Staging contains zero users before identity acceptance testing.
- Runtime role inspection showed `frankai_auth_app` is non-superuser, `NOCREATEDB`, and `NOCREATEROLE`.
- Migration 004 removes runtime access to `schema_migrations`, AI configuration, and voice-session tables, then grants only explicit application-table privileges.
- Native PostgreSQL dump is readable, root-only, checksum verified, and restored into a pre-created temporary database. The restored database contained 14 public tables, zero users, and migrations through 004. ACLs were omitted from the application-schema rehearsal because the dump contains default privileges owned by another role; source grants were inspected separately.
- `npm run lint` passes without warnings.
- `npm test` passes (4 tests).
- `npm run build` passes and produces the standalone route set.
- Pinned Gitleaks `v8.24.2` passes working-tree, staged-content, and complete Git-history scans with zero findings.
- Voice remains disabled in code and configuration templates; the disabled route returns before provider setup.
- An alternate-port standalone candidate ran at `http://127.0.0.1:4500` against the protected staging database with ephemeral process secrets, secure cookies, PostgreSQL authority, and voice disabled. It was stopped after smoke testing; production port 4300 was not touched.
- Candidate smoke checks returned: `/` 200, `/login` 200, `/signup` 200, `/admin` 307, `/voice` 200, `/api/auth/me` 401, `/api/voice/capabilities` 401, public signup POST 403, and unauthenticated voice POST 401.
- Candidate rejected dummy Basic and Bearer administration headers with 401. CSRF bootstrap returned 200.
- Two controlled administrator identities were created interactively in staging. Duplicate bootstrap for the primary identity was rejected without modification.
- Runtime-role verification returned zero users and denied `schema_migrations` access after migration 004.

## Acceptance matrix

| Control | Implemented | Automated test | Staging test | Evidence | Status | Blocker |
|---|---:|---:|---:|---|---|---|
| JWT validation and issuer/audience checks | Yes | Partial | Not run | `lib/auth/jwt.ts`, build | PARTIAL | Dedicated auth tests needed |
| Refresh rotation | Yes | No | Not run | `/api/auth/refresh` | PARTIAL | Concurrent runtime test |
| Refresh replay detection | Yes | No | Not run | refresh family logic | PARTIAL | Concurrent runtime test |
| Secure cookies | Yes | No | Not run | `lib/auth/http.ts` | PARTIAL | HTTPS browser test |
| CSRF and Origin validation | Yes | No | Not run | `csrfOk` | PARTIAL | Negative browser/API tests |
| PostgreSQL authority | Yes in candidate | No | Schema only | staging migrations | PARTIAL | Candidate runtime not cut over |
| Database grants | Yes after 004 | Query inspection | Query inspection | role/grant inspection | PASS |
| Backup | Yes | Checksum | N/A | backup archive and dump | PASS |
| Restore | Yes | Restore command | Temporary DB | 14 tables, 0 users, migrations 001–004 | PASS |
| Invitations | Yes | No | Not run | invitation routes/schema | PARTIAL | Test identities and mail sink |
| Email verification | Yes | No | Not run | verification routes/schema | PARTIAL | Mail sink workflow |
| Password recovery | Yes | No | Not run | reset routes/schema | PARTIAL | Mail sink and invalidation tests |
| MFA enrollment | Yes | No | Not run | MFA routes/schema | PARTIAL | Controlled admin identities |
| MFA challenge/recovery | Yes | No | Not run | MFA routes/schema | PARTIAL | Controlled admin identities |
| Recent MFA | Partial | No | Not run | reauth route only | FAIL | Wire every sensitive action |
| Final administrator protection | No | No | Not run | No locking implementation | FAIL | Implement transaction locks and APIs |
| User management APIs/UI | Partial | No | Not run | Existing limited admin surface | FAIL | Required routes/UI absent |
| Session management | Partial | No | Not run | list/revoke routes | PARTIAL | Runtime ownership/replay tests |
| Distributed rate limiting | Yes | No | Not run | migration 003/rate-limit service | PARTIAL | Two-process test |
| Account lockout | Partial | No | Not run | login route | PARTIAL | Configurable policy/runtime tests |
| Static-token retirement | Partial | No | No | code path removed | PARTIAL | Production/Caddy inspection |
| Secret scanning | Yes | Yes | N/A | Gitleaks v8.24.2, three scopes | PASS |
| Browser tests | No | No | Not run | No browser framework configured | NOT_RUN | Add/run browser harness |
| Audit logging | Partial | No | Not run | audit inserts/routes | PARTIAL | Event completeness test |
| Voice disabled | Yes | No | Not run | fail-closed route/code | PARTIAL | Provider-invocation assertion |
| Rollback | Partial | No | Restore only | backup and rollback docs | PARTIAL | Candidate cutover rehearsal |

## Known limitations

The current repository does not yet contain the complete administrator user-management API/UI or database-locked final-administrator operations. Recent-MFA assurance exists as an endpoint but is not enforced across every sensitive route. Email delivery currently queues an outbox record; a production SMTP worker and staging browser acceptance flow remain required. These are release blockers.
