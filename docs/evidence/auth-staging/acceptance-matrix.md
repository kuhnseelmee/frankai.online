# Acceptance matrix — 2026-07-30

| CONTROL | IMPLEMENTED | UNIT_TEST | INTEGRATION_TEST | CONCURRENCY_TEST | BROWSER_TEST | STAGING_EVIDENCE | STATUS | BLOCKER |
|---|---:|---:|---:|---:|---:|---|---|---|
| JWT validation | Yes | Yes | Partial | No | No | JWT negative suite | PASS | — |
| Authoritative account state | Yes | No | Partial | No | No | PostgreSQL staging | PARTIAL | Full invalidation flows |
| Refresh rotation | Yes | No | Yes | Yes | No | One success/one rejection | PASS | Replacement assertion expansion |
| Replay detection | Yes | No | Partial | Partial | No | Audit path present | PARTIAL | Delayed replay suite |
| Cookies | Yes | No | No | No | Partial | HTTPS staging | PARTIAL | Authenticated browser inspection |
| CSRF | Yes | No | Partial | No | No | Smoke/login | PARTIAL | Negative workflow suite |
| Origin validation | Yes | No | Partial | No | No | Route contract | PARTIAL | Negative workflow suite |
| Invitations | Yes | No | No | Partial | No | Routes/schema | PARTIAL | Full redeem/browser flow |
| Verification | Yes | No | No | No | No | Routes/schema | PARTIAL | Capture and completion |
| Password recovery | Yes | No | Partial | No | No | Forgot email captured | PARTIAL | Reset completion |
| MFA enrollment | Yes | No | No | No | No | Routes/schema | PARTIAL | Controlled browser flow |
| MFA challenge/recovery | Yes | No | No | No | No | Routes/schema | PARTIAL | Controlled browser flow |
| Recent MFA | Yes | No | No | No | No | Route inventory | PARTIAL | Expiry/route contract tests |
| Final administrator | Yes | No | Yes | Yes | No | Advisory-lock demotion test | PARTIAL | Full destruction matrix |
| User-management APIs | Yes | No | No | No | No | Build/routes | PARTIAL | Authenticated API suite |
| Administrator UI | Partial | No | No | No | Partial | Protected pages | PARTIAL | Interactive workflows |
| Sessions | Yes | No | Partial | Partial | No | DB schema/routes | PARTIAL | Browser session lifecycle |
| Distributed rate limiting | Yes | No | Yes | Yes | No | Two-process 429 result | PASS | Broader categories |
| Account locking | Yes | No | No | No | No | Login implementation | PARTIAL | Threshold/restart suite |
| SMTP delivery | Yes | No | Partial | No | No | Mailpit password-reset capture | PARTIAL | All templates |
| Audit completeness | Partial | No | Partial | No | No | Redaction count zero | PARTIAL | Full event-category suite |
| Static-token retirement | Yes | No | Partial | No | Partial | No app token references | PASS | — |
| Secret scanning | Yes | Yes | N/A | N/A | N/A | Gitleaks source/history | PASS | — |
| Dependency security | Partial | N/A | N/A | N/A | N/A | 13 highs classified | PARTIAL | Transitive/major upgrades |
| Voice-disabled boundary | Yes | Yes | Partial | No | Yes | No mic/provider path | PARTIAL | Provider-throw assertion |
| Operational restore | Yes | No | Yes | No | No | Candidate/ACL smoke | PASS | Authenticated mutation |
| Rollback | Partial | No | Partial | No | No | Protected backup/runbook | PARTIAL | Full cutover rehearsal |
