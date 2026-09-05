# Final SMTP verification — 2026-08-06

This is the final verification refresh after the previous partial acceptance.
Production SMTP was not activated and `frankai-site.service` was not restarted.

## Baseline

- Baseline directory: `/root/backups/frankai-smtp/20260806T172459+1000-final-verification-closure/`.
- Archive and manifest: `/root/backups/frankai-smtp/20260806T172459+1000-final-verification-closure.tar` and its SHA-256 sidecar.
- Production PID/start: `3183301`, active since `2026-08-05 02:32:24 AEST`.
- Production, staging, staging proxy, Postfix, Rspamd, Redis, and Caddy were active.
- Local production HTTP, staging HTTPS, and public HTTPS returned 200.
- Queue was empty.
- Postfix exposed only loopback `25` and `587`; Rspamd and Mailpit remained loopback-only.
- Staging has `VOICE_ENABLED=false`; production had no enabling voice value. No voice change was made.

## Tooling and repository validation

```text
DEPENDENCIES_RESTORED
REPOSITORY_VALIDATION_PASS
GITLEAKS_FINDINGS_DETECTED
```

`npm ci` restored the lockfile dependency graph; the package-lock checksum
remained `4cc3d9c66a91b55e8f8c8c6b426342f29a4335539b043509bff9c2b64a090cac`.
Lint passed. Full tests passed with 15 passes, 0 failures, and 3 explicit
skips. The isolated production build passed without modifying the active
`.next` tree.

Gitleaks v8.24.2 was run against the working tree and committed history. Both
scans identified one JWT-pattern finding in the pre-existing tracked
`docs/api-1.json` at line 13921. The finding was not suppressed or rewritten
as part of this SMTP-scoped pass.

## DNS and inbound

Authoritative servers and public resolvers agree on Hostinger MX, the VPS A,
PTR/FCrDNS, SPF, and DKIM. Current DMARC remains:

```text
v=DMARC1; p=none; pct=100; adkim=s; aspf=s
```

It still has no `rua`. The protected recipient file
`/root/.config/frankai-smtp-test-recipients.env` is absent. Hostinger MX is
reachable, but RCPT-only probes did not establish mailbox identity or actual
delivery; no external sender/account was available for receipt confirmation.

```text
HOSTINGER_INBOUND_PARTIAL
INBOUND_DELIVERY_PARTIAL
DMARC_REPORTING_PARTIAL
BOUNCE_PROCESSING_PARTIAL
```

No DMARC mailbox receipt, aggregate report, operational alias delivery, bounce
receipt, or unconfigured-address rejection was claimed.

## TLS and ACME

The Caddy mail-only block validates and serves a static response. Caddy is
active, the certificate is stored in Caddy ACME storage, and the Postfix sync
path is enabled. The current certificate is valid through `2026-10-31`, and
local STARTTLS returns OpenSSL verify code 0.

No completed renewal/replacement issuance for `mail.frankai.online` was
observed. Caddy renewal maintenance is active, but that is not equivalent to a
completed renewal proof.

```text
ACME_RENEWAL_PARTIAL
```

## External providers and staging

No Gmail, Outlook, Yahoo, or other controlled recipient was supplied. No
external message was sent, so delivery, placement, remote response, SPF, DKIM,
and DMARC results are all `NOT_RUN`.

The repository staging email integration tests remained skipped because
protected staging inspection inputs were absent. The staging service itself
returned 200.

```text
GMAIL NOT_RUN
OUTLOOK NOT_RUN
YAHOO NOT_RUN
OTHER_CONTROLLED NOT_RUN
SMTP_STAGING_PARTIAL
```

## Health and production decision

The fail-closed health check passed local service, listener, queue, DNS A/PTR/
FCrDNS/SPF/DKIM, TLS, HTTPS, and voice controls, but failed the missing DMARC,
Hostinger mailbox, inbound, bounce, ACME, and production-baseline evidence
flags.

```text
SMTP_LOG_REDACTION_PARTIAL
SMTP_HEALTH_CHECK_FAIL
PRODUCTION_SMTP_NOT_ACTIVATED
PRODUCTION_HEALTH_VERIFIED
VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION
ROLLBACK_READY
NOT_READY_FOR_PRODUCTION_SMTP
```

## Remaining demonstrated blockers

1. DMARC has no verified monitored `rua` destination.
2. Hostinger account/alias access and real inbound receipt are unproven.
3. Bounce receipt and correlation are unproven.
4. Controlled external recipients are absent; Gmail, Outlook, Yahoo, and other-provider tests are not run.
5. Completed mail-host ACME renewal is not proven.
6. Gitleaks reports the pre-existing JWT-pattern finding in `docs/api-1.json`.
7. Staging inspection inputs are absent, so the four external-path workflow tests remain skipped.

## Manual actions required

Ray must provide protected access/evidence for the Hostinger mailboxes or
aliases and controlled external test recipients. After those are available,
the monitored DMARC address can be published and the inbound, bounce,
provider, and staging gates rerun. The Gitleaks finding requires an explicit
security review before a no-leaks gate can be claimed.

Production SMTP remains inactive.
