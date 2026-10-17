# FRA-DOM-001 — Integration baseline

This is a non-executing, non-publishing additive integration into the canonical PostgreSQL FrankAI repository. It does not authorize DNS publication, migration deployment, role grants, or agent invocation.

## State
- 32 logical domains and 33 proposed hostnames; hostname assignment is provisional and must be reviewed.
- All hostnames seeded as UNPUBLISHED / UNVERIFIED / PROPOSED.
- Migration 006 is intentionally **not** added to the active migration runner pending database isolation and access-control review.
- The existing repository authenticates users via its own PostgreSQL store. Do not copy the standalone Python loader from the initial planning package into production.

## Before activating
1. Review tenant model and per-tenant row-level ownership; current seed records are platform-global proposals only.
2. Implement API handlers with existing ADMIN session, MFA recency, CSRF, origin and audit controls. Deny writes by default.
3. Add transactional update checks (expected version), idempotency, append-only event creation and dual-party approval policy for network exposure.
4. Ensure the database application role cannot mutate event history or publish infrastructure.
5. Add integration tests using disposable PostgreSQL and validate rollback and permissions.
6. Request independent Auditor review before enabling migration 006 in scripts/migrate-db.mjs.

## Invariants
- No DNS or Cloudflare automation is invoked by this package.
- Database catalogue changes never change actual DNS or Cloudflare Access policies.
- Public hostnames require independent evidence of access protection, health and rollback.
- Migration, API publication and external execution are separate release approvals.
