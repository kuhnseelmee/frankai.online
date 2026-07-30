# Acceptance matrix — 2026-07-30

| CONTROL | IMPLEMENTED | UNIT_TEST | INTEGRATION_TEST | CONCURRENCY_TEST | BROWSER_TEST | STAGING_EVIDENCE | STATUS | BLOCKER |
|---|---:|---:|---:|---:|---:|---|---|---|
| JWT validation | Yes | Yes | Partial | No | No | JWT negative suite | PASS | — |
| Authoritative account state | Yes | No | Yes | No | Partial | PostgreSQL staging and reset invalidation | PARTIAL | Full role/session invalidation flows |
| Refresh rotation | Yes | No | Yes | Yes | No | One success/one rejection | PASS | Replacement assertion expansion |
| Replay detection | Yes | No | Partial | Partial | No | Audit path present | PARTIAL | Delayed replay suite |
| Cookies | Yes | No | Partial | No | Partial | HTTPS staging journey | PARTIAL | Complete authenticated cookie inspection |
| CSRF | Yes | No | Partial | No | No | Smoke/login | PARTIAL | Negative workflow suite |
| Origin validation | Yes | No | Partial | No | No | Route contract | PARTIAL | Negative workflow suite |
| Invitations | Yes | No | Partial | Partial | Yes | 5/5 Playwright journey | PARTIAL | Admin creation/resend/revocation |
| Verification | Yes | No | Partial | No | Partial | Browser completion and DB state | PARTIAL | SMTP issuance/resend/expiry |
| Password recovery | Yes | No | Partial | No | Partial | Browser reset and session invalidation | PARTIAL | Generic/timing/full mail matrix |
| MFA enrollment | Yes | No | Partial | Yes | Partial | Browser setup and one-time codes | PARTIAL | Full challenge/recovery/reset |
| MFA challenge/recovery | Yes | No | Partial | Partial | Partial | Enrollment assurance only | PARTIAL | Challenge/recovery journey |
| Recent MFA | Yes | No | No | No | No | Route inventory | PARTIAL | Expiry/route contract tests |
| Final administrator | Yes | No | Yes | Yes | No | Advisory-lock demotion test | PARTIAL | Full destruction matrix |
| User-management APIs | Yes | No | Partial | No | No | Build/routes and route contract | PARTIAL | Authenticated mutation suite |
| Administrator UI | Partial | No | No | No | Partial | Protected pages | PARTIAL | Interactive workflows |
| Sessions | Yes | No | Partial | Partial | No | DB schema/routes | PARTIAL | Browser session lifecycle |
| Distributed rate limiting | Yes | No | Yes | Yes | No | Two-process 429 result | PASS | Broader categories |
| Account locking | Yes | No | No | No | No | Login implementation | PARTIAL | Threshold/restart suite |
| SMTP delivery | Yes | No | Partial | No | Partial | Mailpit reset capture | PARTIAL | All enabled templates |
| Audit completeness | Partial | No | Partial | No | No | Redaction count zero | PARTIAL | Full event-category suite |
| Static-token retirement | Yes | No | Partial | No | Partial | No app token references | PASS | — |
| Secret scanning | Yes | Yes | N/A | N/A | N/A | Gitleaks source/history | PASS | — |
| Dependency security | Partial | N/A | N/A | N/A | N/A | 13 highs classified | PARTIAL | Transitive/major upgrades |
| Voice-disabled boundary | Yes | Yes | Partial | No | Yes | 5/5 browser suite and disabled route | PARTIAL | Authenticated provider-throw assertion |
| Operational restore | Yes | No | Yes | No | No | Candidate/ACL smoke | PASS | Authenticated mutation |
| Rollback | Partial | No | Partial | No | No | Protected backup/runbook | PARTIAL | Full cutover rehearsal |
