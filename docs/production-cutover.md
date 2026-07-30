# Production authentication cutover plan

Prepared only; not executed.

1. Confirm Hostinger token rotation.
2. Confirm SMTP credentials and controlled delivery tests.
3. Create and verify a fresh root-only source, environment, and PostgreSQL backup.
4. Confirm the restore rehearsal and clean authentication checkpoint.
5. Apply migrations using the migration role.
6. Run the file-auth dry run, review collisions, then import users transactionally.
7. Revoke legacy refresh sessions and archive the file store read-only.
8. Bootstrap the first administrator interactively.
9. Start an alternate-port candidate with PostgreSQL authority and voice disabled.
10. Run local API and browser smoke tests, including MFA, invitation, reset, sessions, grants, and rate limiting.
11. Switch Caddy/systemd only after the candidate passes.
12. Enroll administrator MFA and verify recovery.
13. Verify static-token rejection, HTTPS cookies, email workflows, and the disabled voice boundary.
14. Monitor logs and health before ending maintenance.

Rollback immediately for lost administrator access, authentication errors, secret exposure, migration corruption, restart loops, persistent proxy errors, or any final-administrator safeguard failure. Restore the previous build, unit, proxy routing, environment, and file-backed authority if necessary; preserve PostgreSQL for comparison and forensics.
