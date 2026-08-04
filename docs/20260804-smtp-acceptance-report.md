# FrankAI SMTP acceptance report — 2026-08-04

This report records the restricted read-only acceptance audit. Production SMTP was
not activated, the production application was not restarted, no public SMTP
listener was added, no VPS mailbox was created, and voice remains disabled.

## Current evidence

- Host: `srv1661521`; IPv4 `76.13.180.125`; IPv6 present on `eth0`.
- Production, staging, and staging proxy were active during the audit and
  returned HTTP 200 on their local health endpoints. Production PID was 789,
  started at `2026-08-04 04:41:36 AEST`; no earlier baseline for this run was
  available, so production-unchanged is not claimed from PID evidence alone.
- Postfix, Rspamd, and Redis were active. Postfix listeners were only
  `127.0.0.1:25` and `127.0.0.1:587`; Rspamd and Mailpit were loopback-only;
  no IMAP, POP3, or webmail listener was observed. The Postfix queue was empty.
- Postfix identity was `mail.frankai.online`, domain/origin
  `frankai.online`, with a one-message-per-concurrency and 15-second
  destination delay policy, one-day queue lifetimes, and a 2 MiB message cap.
- Local submission TLS verified with hostname `mail.frankai.online`, Let’s
  Encrypt issuer, TLS 1.3, and OpenSSL verification code 0. The certificate
  expires 2026-10-31 and the key is root-owned mode 0600.

## DNS classification

Both `ns1.dns-parking.com` and `ns2.dns-parking.com`, plus 1.1.1.1, 8.8.8.8,
and 9.9.9.9, agreed on the following records:

- A: `mail.frankai.online -> 76.13.180.125` — PRESENT.
- AAAA: no record — MISSING (the VPS has IPv6, but the mail hostname does not
  publish it).
- PTR: `76.13.180.125 -> mail.frankai.online` — PRESENT.
- SPF: exactly one SPF record,
  `v=spf1 include:_spf.mail.hostinger.com a:mail.frankai.online -all` —
  PRESENT and syntactically within normal lookup limits.
- DKIM: selector `mail` is published and now matches the active
  `/var/lib/rspamd/dkim/frankai.online.mail.key` (2048-bit RSA) — PRESENT and
  VERIFIED after the Hostinger DNS update.
- DMARC: one record with `p=none`, `pct=100`, `adkim=s`, and `aspf=s`, but no
  `rua` tag — PARTIAL; reporting is not configured.
- MX: Hostinger `mx1.hostinger.com` and `mx2.hostinger.com`; the VPS is not an
  MX target — PRESENT. Hostinger DKIM CNAME selectors were retained.

The public forward-confirmed reverse DNS result is `FCRDNS_VERIFIED`. The
local resolver intentionally maps `mail.frankai.online` to loopback through
`/etc/hosts`; health checks therefore use explicit public DNS resolvers.

## Blockers

1. Add an approved monitored `rua=mailto:` address to DMARC and verify the
   Hostinger mailbox and retention policy. The Hostinger `frankai.online` mail
   order is currently suspended, so mailbox operational status is not proven.
2. Prove mail-host ACME renewal. Caddy is operational, but the active Caddyfile
   has no `mail.frankai.online` site block; the mail certificate is present in
   Caddy storage and copied by the Postfix sync path, but Caddy ownership of
   renewal for that hostname is not proven.
3. Supply root-only controlled Gmail, Outlook, Yahoo, and other-recipient
   inputs. The protected recipient file was absent, so no external message was
   submitted and no provider authentication or spam placement can be claimed.
4. Establish a pre-run historical production baseline if a historical
   continuity claim is required. During this run, PID 789 and its start time
   remained unchanged; the application was not restarted.

## Tests not claimed

External provider delivery, provider SPF/DKIM/DMARC headers, bounce receipt,
DMARC aggregate reports, and externally exercised staging action templates are
`NOT_RUN` or `BLOCKED`. Existing local test coverage is Mailpit/capture-based;
the repository email acceptance tests skipped because the protected staging
inspection environment was not enabled. Inactive templates remain
`INACTIVE_RESERVED` and the application rejects dispatch for them.

## Health check

`deploy/smtp/frankai-smtp-health-check` was enhanced and installed at
`/usr/local/sbin/frankai-smtp-health-check`. It now checks explicit-resolver
DNS, FCrDNS, DKIM public-key equivalence without printing key material, DMARC
reporting, certificate hostname and remaining lifetime, ACME integration,
loopback/public listeners, queue age/count, local health endpoints, and voice
   state. It returns non-zero for the current DMARC, Caddy/ACME, or missing
   production-baseline failures.

## Decision

## Restricted-phase update — 2026-08-04

Caddy’s root cause was `/etc/caddy/Caddyfile` mode `0600` owned by `root:root`
while the service runs as `caddy:caddy`. The fix is `/etc/caddy` `root:caddy`
mode `0750` and the Caddyfile `root:caddy` mode `0640`. Caddy validation passed,
the service is active, public HTTPS returns 200 with TLS verification 0, local
production and staging remain 200, and the production application PID/start
time remained unchanged during this run. The final Caddyfile checksum is
recorded in the run evidence and the protected backup is under
`/root/backups/frankai-smtp/20260804T060355+1000-caddy-inbound-routing/`.

The Postfix certificate sync hook ran successfully and local STARTTLS returned
verify code 0. ACME renewal for `mail.frankai.online` remains PARTIAL: the
active Caddyfile contains no mail site block, although the current mail
certificate is present in Caddy storage and the sync path is enabled.

Hostinger inbound is `HOSTINGER_INBOUND_SUSPENDED`. The recommended replacement
is an external custom-domain mailbox provider with dmarc/bounce/security/support
aliases, pending provider and MX approval. No MX or mailbox changes were made.

`VPS_SMTP_PARTIALLY_READY`

`NOT_READY_FOR_PRODUCTION_SMTP`

The current provider-selection result is `INBOUND_PROVIDER_RECOMMENDED` with
Fastmail as the recommendation and Forward Email as fallback. The exact DNS
and rollback plans are prepared but not applied. DMARC reporting is
`DMARC_REPORTING_READY_FOR_ACTIVATION`, bounce routing is
`BOUNCE_ROUTING_READY_FOR_ACTIVATION`, and inbound delivery is
`INBOUND_DELIVERY_NOT_RUN`.

Production activation remains prohibited until all blockers above are closed
and Ray gives separate explicit approval.

## Acceptance matrix

| CONTROL | CONFIGURED | DNS | LOCAL_TEST | EXTERNAL_TEST | GMAIL | OUTLOOK | YAHOO | STAGING | PRODUCTION | STATUS | BLOCKER |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A | yes | PRESENT | pass | not run | — | — | — | partial | unchanged not proven | PARTIAL | no baseline for production claim |
| PTR / FCrDNS | yes | PRESENT | pass | pass via public resolvers | — | — | — | partial | — | PASS | — |
| SPF | yes | PRESENT | pass | not run | NOT_RUN | NOT_RUN | NOT_RUN | partial | — | PASS | provider headers not observed |
| DKIM | configured | PRESENT | PASS | not run | NOT_RUN | NOT_RUN | NOT_RUN | partial | — | PASS | provider headers not observed |
| DMARC | partial | INCORRECT | fail | not run | NOT_RUN | NOT_RUN | NOT_RUN | partial | — | FAIL | no `rua` |
| DMARC reporting | no | MISSING | not run | not run | — | — | — | NOT_RUN | — | BLOCKED | mailbox/tag not supplied |
| Trusted TLS | yes | — | PASS | not run | — | — | — | PASS | — | PASS | — |
| ACME renewal | Caddy-managed | — | partial | NOT_RUN | — | — | — | partial | HTTPS PASS | PARTIAL | mail hostname not in active Caddyfile |
| HELO / identity | yes | — | PASS | not run | — | — | — | partial | — | PASS | external session not observed |
| Open relay | yes | — | PASS | incomplete | — | — | — | PASS | — | PASS | remote probe unavailable |
| Sender restrictions | yes | — | PASS | not run | — | — | — | PASS | — | PASS | — |
| Rate limits / queue | yes | — | PASS | not run | — | — | — | partial | — | PASS | external burst not run |
| External delivery | — | — | — | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | — | NOT_RUN | no controlled recipients |
| Bounce handling | partial | — | not run | NOT_RUN | — | — | — | partial | — | NOT_RUN | mailbox/invalid recipient not supplied |
| Log redaction | yes | — | PASS | — | — | — | — | partial | partial | PASS | full template SMTP run not run |
| Active templates | yes | — | capture/local only | NOT_RUN | — | — | — | PARTIAL | — | PARTIAL | inspection DB/test recipients unavailable |
| Inactive templates | fail closed | — | PASS by code inspection | — | — | — | — | PASS by code inspection | — | PASS | — |
| Production unchanged | — | — | PID/start unchanged during run | — | — | — | — | — | — | PASS | historical baseline unavailable |
| Voice | disabled | — | PASS | — | — | — | — | PASS | PASS | PASS | — |
| Production SMTP approval | no | — | — | — | — | — | — | — | — | BLOCKED | Ray approval and blockers outstanding |
