# FrankAI outbound SMTP architecture

Inbound provider update (2026-08-06): Hostinger MX is currently published.
Account, mailbox, alias, and delivery evidence remains incomplete, so this is
not yet an accepted inbound configuration.

Status: staging-only preparation; production SMTP is not active. A-record
propagation, SPF/DKIM/PTR and FCrDNS are verified. The approved three-provider
recipient policy is configured with Yahoo unavailable; external authentication,
inbound-mailbox, DMARC-reporting, bounce, staging, and renewal acceptance
remain pending.

Postfix runs as an outbound-only MTA. It binds SMTP on `127.0.0.1:25` for the local MTA and submission on `127.0.0.1:587` for FrankAI. `inet_protocols=ipv4`, `mydestination=` and empty `relay_domains` prevent mailbox hosting. `mynetworks` is loopback only and sender access permits only `no-reply@frankai.online`, `security@frankai.online`, and `support@frankai.online`.

Postfix sends through DNS MX discovery directly to recipient domains. Rspamd's milter is `127.0.0.1:11332`; its normal and controller workers are loopback-only. Redis is local support state. Mailpit remains available on `127.0.0.1:1025`/`8025` for comparison and rollback.

The DKIM selector is `mail`. The private key is root-host state at `/var/lib/rspamd/dkim/frankai.online.mail.key`, owned by `_rspamd` with mode `0600`; it is not stored in Git. Postfix now uses the Let’s Encrypt certificate for `mail.frankai.online`, copied from Caddy’s ACME store by `/usr/local/sbin/frankai-postfix-cert-sync`. A systemd path unit reloads Postfix after renewal. No Dovecot, IMAP, POP3, webmail, catch-all, or user mailbox service was installed.

Staging uses `/etc/frankai-site-staging.env` with `SMTP_HOST=mail.frankai.online`; `/etc/hosts` maps that name to `127.0.0.1`, preserving loopback-only submission while allowing certificate hostname validation. `/etc/frankai-site.env`, `frankai-site.service`, production application build, production Caddy configuration, and production database are unchanged in the final state. A trusted certificate was obtained through a temporary validated ACME route, then the original Caddyfile was restored. Voice remains disabled.

## Current readiness boundary

Local relay restriction, DKIM queue signing, A-record propagation,
PTR/FCRDNS, SPF authorization, DKIM publication, and trusted TLS are verified.
Controlled-recipient delivery, inbound mailbox delivery, DMARC reporting,
bounce monitoring, and completed ACME renewal proof remain pending. Production
switch is prohibited until those items are complete.

## 2026-08-04 acceptance update

Local STARTTLS and loopback exposure passed. Public acceptance remains blocked
by the missing DMARC reporting address and unproven mail-host renewal,
and unavailable controlled recipients. Production SMTP was not activated.

## Restricted-phase update

Caddy is now active after restoring secure readability (`root:caddy`, directory
0750; Caddyfile 0640). Public HTTPS is healthy. The mail certificate remains
in Caddy storage and the Postfix sync path is active, but the active Caddyfile
does not configure `mail.frankai.online`, so mail-host renewal is not yet
proven. Inbound Hostinger mail is suspended; no VPS inbound service was added.
