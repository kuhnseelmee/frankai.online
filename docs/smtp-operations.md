# SMTP operations

All commands below are operator-sensitive. `postcat` can expose message bodies; never use it casually on authentication mail.

```bash
postqueue -p
mailq
postcat -q <QUEUE_ID>       # sanitized evidence only; may reveal content
postsuper -d <QUEUE_ID>    # preserve evidence before removal
postsuper -r <QUEUE_ID>

systemctl status postfix
systemctl status rspamd
systemctl status redis-server
journalctl -u postfix
journalctl -u rspamd
```

The health check is `/usr/local/sbin/frankai-smtp-health-check`. It reports queue count and age without printing bodies or keys. Logs contain delivery metadata and addresses, not application payloads by design. Retain Postfix/Rspamd logs for 14–30 days according to the host logrotate policy; review before extending retention.

## TLS renewal

The current Postfix certificate was obtained from Let’s Encrypt through a
temporary validated Caddy ACME route; the original production Caddyfile was
restored afterward. The systemd units `frankai-postfix-cert-sync.path` and
`frankai-postfix-cert-sync.service` watch Caddy's certificate and key, copy them
to `/etc/postfix/tls/` with modes `0644`/`0600`, run `postfix check`, and reload
Postfix. Verify with:

```bash
systemctl is-active frankai-postfix-cert-sync.path
systemctl status frankai-postfix-cert-sync.service
openssl s_client -connect 127.0.0.1:587 -starttls smtp -servername mail.frankai.online -verify_return_error
```

Automatic certificate issuance/renewal for this hostname is not proven because
the production Caddyfile must remain unchanged. Choose and authorize a dedicated
ACME renewal workflow before the certificate expires. Do not copy Caddy private
keys into Git or expose the Caddy certificate store.

## Inbound-provider gate

The health check fails closed while inbound-provider approval and inbound
delivery are unproven; the current non-zero result is intentional. Fastmail
MX-only is recommended, with Forward Email as fallback.

## Rollback

1. Restore the backed-up `/etc/frankai-site-staging.env` and switch `EMAIL_PROVIDER` back to Mailpit (`127.0.0.1:1025`); restart `frankai-site-staging` only.
2. Preserve queue evidence, then stop/disable Postfix and Rspamd if required.
3. Restore `/etc/postfix`, `/etc/rspamd`, `/etc/hosts`, `/etc/mailname`, and sender maps from `/root/backups/frankai-smtp/20260802T235600+1000/` and its `post-install-generated` snapshot.
4. Remove only SMTP-specific firewall changes if any are later added; current UFW policy already denies public SMTP ports.
5. Verify public ports, production health, database isolation, and `VOICE_ENABLED=false`.

Do not delete queues without capturing sanitized evidence. Do not alter `/etc/frankai-site.env` or restart `frankai-site.service` during this phase.

## 2026-08-04 acceptance update

The enhanced health check is installed at `/usr/local/sbin/frankai-smtp-health-check`.
It fails closed for missing DMARC `rua`, failed ACME integration,
and an absent production PID baseline. Current queue evidence is empty and all
SMTP/scanner/Mailpit listeners remain loopback-only.

The 2026-08-04 Caddy repair changed only `/etc/caddy` traversal/read modes:
`root:caddy 0750` and `root:caddy 0640` for `Caddyfile`. Validation and public
HTTPS passed. The Postfix certificate sync service ran successfully and
reloaded Postfix. ACME renewal for the mail hostname remains unproven because
the active Caddyfile has no mail site block.
