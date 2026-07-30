# Rollback

The latest durable rollback package is `/root/backups/frankai-site/20260729T232635Z.tar` with its extracted directory and SHA-256 checksums. Restore the prior source archive, service/Caddy configuration, and environment file only after review; rebuild standalone output and restart `frankai-site.service`. A PostgreSQL native dump was not captured because PostgreSQL on `127.0.0.1:6432` was unavailable during backup; create and verify that dump before any production migration. Never delete the active database as a rollback shortcut. Preserve `/var/lib/frankai-site/auth` unless a deliberate file-store rollback is approved.
# Authentication rollback boundary

Keep the protected source/file-store backup and PostgreSQL dump together. A
rollback restores the previous application build, systemd environment, and
Caddy routing; it does not delete the migrated PostgreSQL database. Preserve
the PostgreSQL copy for comparison and forensic review. Staging rollback tests
do not constitute a production rollback rehearsal.
