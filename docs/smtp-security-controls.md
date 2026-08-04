# SMTP security controls

Hostinger inbound is suspended. Fastmail MX-only is the prepared recommendation
for monitored `dmarc`, `bounce`, `security`, and `support` addresses, with
Forward Email as fallback. No provider activation, MX change, or VPS inbound
service has been performed.

| Control | Result |
| --- | --- |
| Public submission | Loopback-only `127.0.0.1:587`; no public bind |
| Public SMTP listener | No public Postfix listener; port 25 is loopback-only |
| Rspamd controller/milter | `127.0.0.1` and `::1` only |
| Open relay | Local external-recipient test is relay-safe; arbitrary sender rejected |
| Approved senders | `no-reply@`, `security@`, `support@frankai.online` only |
| Mailboxes | None; `mydestination` and `relay_domains` empty |
| DKIM | 2048-bit RSA, selector `mail`, key mode `0600`, `_rspamd` owner |
| Rate limiting | 15-second destination delay, concurrency 1, queue lifetime 1 day |
| Message size | 2 MiB |
| TLS | Let’s Encrypt certificate verified for `mail.frankai.online`; Postfix sync hook is installed, but renewal issuance is not yet authorized/proven |
| Credentials | No SMTP credentials configured; localhost is the trust boundary |
| Logging | No application bodies/tokens intentionally logged; metadata retention target 14–30 days |
| Inbound handling | No MX/mailbox service added; bounce processing is not implemented |
| Production | `PRODUCTION_ACTIVE_UNCHANGED` |
| Voice | `VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION` |

The A record is present, but PTR/FCRDNS, SPF authorization, DKIM publication, and aligned DMARC remain demonstrated DNS/provider blockers. Bounce processing and monitored DMARC reporting are not implemented.

## 2026-08-04 acceptance update

PTR/FCrDNS, merged SPF, and DKIM are now externally consistent. DMARC reporting
is absent, Caddy renewal is not
operationally proven, and external provider delivery was not run. Voice remains
disabled.

The Caddy permission repair was least-privilege and did not weaken systemd or
security policy. Caddy runs as `caddy:caddy`, reads only the restricted
configuration, and public HTTPS now returns 200. Hostinger inbound is
suspended; replacement inbound routing is documented but not activated.
