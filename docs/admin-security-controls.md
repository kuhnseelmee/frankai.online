# Administrator security controls

Administrator state changes run through PostgreSQL transactions. An
transaction-scoped advisory lock serializes administrator membership changes;
the target row is locked and the resulting recoverable-administrator count is
checked before commit. The stable rejection code is
`FINAL_ADMINISTRATOR_REQUIRED`.

Final-administrator rejections are recorded after the protecting transaction
rolls back as `admin_final_admin_action_rejected`, with actor, target, exact
operation, reason code, and request ID. No success event is emitted for the
rejected mutation. The implementation is present in the reconciliation working
tree and was observed after the staging-only rebuild: the rejection returns
`FINAL_ADMINISTRATOR_REQUIRED`, rolls back state, and produces the rejected
audit event with a request ID.

A recoverable administrator is active, verified, MFA-enrolled, not permanently
locked, and has an unused recovery code. This is intentionally stricter than a
role count. Demotion, disablement, deletion, MFA reset, and administrator
session revocation are guarded.

Sensitive administrator routes use `requireRecentAdmin`, which validates the
current session assurance record and its JTI. Access-token issuance time is not
used as a substitute. The configured default window is 600 seconds. The
reauthentication challenge accepts TOTP or a single recovery code, applies
rate limiting, updates only the current assurance, and audits success/failure.

The machine-readable route inventory is [admin-route-security.json](admin-route-security.json).
Read-only routes require an administrator MFA session; state-changing routes
also require CSRF, Origin validation, recent MFA, rate limiting, and audit
handling.

The administrator UI pages are staging-grade protected shells for the dashboard,
users, invitations, security, and audit areas. Full interactive workflow
coverage remains a staging acceptance item, not a production claim.
