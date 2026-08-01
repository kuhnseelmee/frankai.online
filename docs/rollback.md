# Rollback

The current reconciliation backup is under `/root/backups/frankai-site/20260801T063142Z-reconciliation/` with protected source, active build, service/Caddy configuration, environment-file copies, PostgreSQL dumps, checksums, and archive verification. Restore the source/build and service configuration only after review; rebuild standalone output and restart `frankai-site.service` only under the production remediation gate. Never delete the active database as a rollback shortcut. Preserve `/var/lib/frankai-site/auth` unless a deliberate file-store rollback is approved.
# Authentication rollback boundary

Keep the protected source/file-store backup and PostgreSQL dump together. A
rollback restores the previous application build, systemd environment, and
Caddy routing; it does not delete the migrated PostgreSQL database. Preserve
the PostgreSQL copy for comparison and forensic review. Staging rollback tests
do not constitute a production rollback rehearsal.
