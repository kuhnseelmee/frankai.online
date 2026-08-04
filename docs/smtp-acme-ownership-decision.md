# FrankAI SMTP ACME ownership decision

Status: `ACME_OWNERSHIP_PARTIAL`.

The active certificate for `mail.frankai.online` is currently stored in Caddy’s
ACME storage and synchronised to Postfix by
`/usr/local/sbin/frankai-postfix-cert-sync`; the sync path is enabled and local
TLS validates. However, the active Caddyfile has no `mail.frankai.online` site
block, so automatic renewal ownership for the mail hostname is not fully
proven.

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

