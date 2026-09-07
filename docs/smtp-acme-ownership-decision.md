# FrankAI SMTP ACME ownership decision

Status: `ACME_OWNERSHIP_CONFIGURED_RENEWAL_NOT_YET_PROVEN`.

The active certificate for `mail.frankai.online` is currently stored in Caddy’s
ACME storage and synchronised to Postfix by
`/usr/local/sbin/frankai-postfix-cert-sync`; the sync path is enabled and local
TLS validates. The active Caddyfile now contains a mail-only
`mail.frankai.online` HTTPS site block that returns a static response. It does
not proxy SMTP or expose an internal service. Caddy validation and reload
succeeded, and Caddy reports automatic certificate management for the
hostname. A supported forced-renewal command is not available in the installed
Caddy build, so a completed renewal event is not yet proven and production
activation remains gated.

## Recommended method

Use one explicit, non-overlapping owner for the mail certificate. Preferred
future implementation is a dedicated DNS-01 workflow with a least-privilege DNS
token created specifically for ACME, stored outside Git, and a deployment hook
that atomically installs the certificate/key, checks the pair, runs `postfix
check`, and reloads Postfix. Do not reuse the general Hostinger API key for a
new automation scope without Ray’s approval.

Alternative: an explicit harmless Caddy HTTPS site block for
`mail.frankai.online`, with no SMTP proxy and no production route changes, if
Ray approves Caddy as the sole owner. Validate, dry-run, sync, reload, and
verify the final Caddyfile checksum.

No force issuance or DNS-token creation was performed in this phase.
