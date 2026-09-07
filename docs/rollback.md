# Rollback

The current reconciliation backup is under `/root/backups/frankai-site/20260801T063142Z-reconciliation/` with protected source, active build, service/Caddy configuration, environment-file copies, PostgreSQL dumps, checksums, and archive verification. Restore the source/build and service configuration only after review; rebuild standalone output and restart `frankai-site.service` only under the production remediation gate. Never delete the active database as a rollback shortcut. Preserve `/var/lib/frankai-site/auth` unless a deliberate file-store rollback is approved.
# FrankAI vertical-slice rollback boundary

For a later, explicitly approved Caddy activation, record the exact backup path
before editing:

```bash
CADDY_BACKUP="/etc/caddy/Caddyfile.bak-$(date -u +%Y%m%dT%H%M%SZ)"
sudo cp -p /etc/caddy/Caddyfile "$CADDY_BACKUP"
printf 'Caddy backup: %s\n' "$CADDY_BACKUP"
```

Rollback must use the exact value printed by that command:

```bash
sudo cp -p "$CADDY_BACKUP" /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

These commands are documentation only for this task; Caddy was not edited,
validated, reloaded, or restarted.

For a FrankAI runtime rollback, stop only this Compose project:

```bash
cd /root/frankai-site
docker compose down
```

Then verify that `127.0.0.1:8081` is free, `127.0.0.1:8080` is still owned by
`openwa-traefik`, the frontend on `127.0.0.1:4300` is healthy, and Caddy remains
active. Do not remove the secret files during an ordinary runtime rollback.

For the 2026-08-10 OpenAI 502 investigation, the exact diagnostic backup is
`/root/backups/frankai-api/20260810T025056Z-openai-502-diagnosis/`. It contains
source/configuration evidence and checksums only; secret contents were not
copied. The private runtime remains stopped because the original provider cause
was not determined and no blind retry is permitted.

The 2026-08-10 protected attempt also remains rolled back. Its classifier was
`OPENAI_UNKNOWN_FAILURE` with no provider status/type/code available. The smoke
wrapper accidentally made two valid requests; no further request was made.
The protected sanitised record is under
`/root/.config/frankai-openai-diagnostics/`.

The existing frontend, Caddy, public HTTPS, and `openwa-traefik` were verified
healthy after rollback; `127.0.0.1:8081` was free and `127.0.0.1:8080` remained
untouched.

The 2026-08-13 single-request diagnostic also rolled back successfully. It
returned normalized HTTP 502 with protected class `OPENAI_UNKNOWN_FAILURE` and
no provider status/type/code/request ID. No retry or account-side change was
made; root cause remains `ROOT_CAUSE_NOT_DETERMINED`.

The 2026-08-13 layer-isolation run stopped at container DNS failure
(`EAI_AGAIN`) before any provider request. Layers 2–5 were not run. The runtime
was rolled back successfully; root cause is `ROOT_CAUSE_CONTAINER_NETWORK`.

# Authentication rollback boundary

Keep the protected source/file-store backup and PostgreSQL dump together. A
rollback restores the previous application build, systemd environment, and
Caddy routing; it does not delete the migrated PostgreSQL database. Preserve
the PostgreSQL copy for comparison and forensic review. Staging rollback tests
do not constitute a production rollback rehearsal.
