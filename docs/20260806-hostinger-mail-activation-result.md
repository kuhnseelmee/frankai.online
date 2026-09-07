# Hostinger mail activation result — 2026-08-06

Ray authorised the restricted SMTP acceptance work. This report records the
fresh host baseline and the current acceptance result. Production SMTP was not
activated and `frankai-site.service` was not restarted.

## Baseline

- Host: `srv1661521`; IPv4 `76.13.180.125`; IPv6 present.
- Production PID before the pass: `3183301`; active since `2026-08-05 02:32:24 AEST`.
- Production, staging, staging proxy, Postfix, Rspamd, Redis, and Caddy were active.
- Production local HTTP, staging HTTPS, and public HTTPS returned HTTP 200.
- Postfix queue was empty.
- Postfix listeners were only `127.0.0.1:25` and `127.0.0.1:587`; Rspamd and Mailpit remained loopback-only.
- Voice remained disabled: staging explicitly has `VOICE_ENABLED=false`; production has no enabling value and remains default-disabled.
- Protected baseline directory: `/root/backups/frankai-smtp/20260806T163826+1000-hostinger-mail-final-acceptance/`.
- Protected archive: `/root/backups/frankai-smtp/20260806T163826+1000-hostinger-mail-final-acceptance.tar`.

## DNS

Authoritative servers `ns1.dns-parking.com` and `ns2.dns-parking.com`, plus
1.1.1.1, 8.8.8.8, and 9.9.9.9, agreed on the observed records.

- A: `mail.frankai.online -> 76.13.180.125` — `PRESENT`.
- AAAA: absent — `MISSING`; no change made.
- PTR: `76.13.180.125 -> mail.frankai.online` — `PRESENT`.
- FCrDNS: verified — `FCRDNS_VERIFIED`.
- MX: `mx1.hostinger.com` and `mx2.hostinger.com` — `PRESENT`.
- SPF: one record, `v=spf1 include:_spf.mail.hostinger.com a:mail.frankai.online -all` — `SPF_VERIFIED`.
- VPS DKIM: selector `mail` matches the local 2048-bit key — `DKIM_SIGNING_VERIFIED`.
- Hostinger DKIM: `hostingermail-a/b/c` CNAMEs resolve — `PRESENT`; Hostinger outbound signing was not exercised.
- Autodiscover/autoconfig CNAMEs resolve to Hostinger — `PRESENT`.
- DMARC: one record with `p=none`, `pct=100`, `adkim=s`, and `aspf=s`, but no `rua` — `DMARC_REPORTING_FAILED`.

## Hostinger inbound and mailbox evidence

DNS and MX presence prove Hostinger is the inbound MX provider, but do not
prove the active subscription, mailbox access, MFA, aliases, monitoring, or
delivery. No protected Hostinger account evidence or external sender was
available. The protected recipient file was absent.

```text
HOSTINGER_INBOUND_PARTIAL
INBOUND_DELIVERY_PARTIAL
DMARC_REPORTING_PARTIAL
BOUNCE_PROCESSING_PARTIAL
EXTERNAL_TEST_BLOCKED_NO_CONTROLLED_RECIPIENTS
```

The required logical addresses `dmarc@`, `bounce@`, `security@`, and `support@`
were not claimed as verified. No catch-all was enabled or added. Real DMARC
aggregate receipt and bounce receipt were not observed.

## TLS and ACME

- Local Postfix STARTTLS: `SMTP_TLS_VERIFIED`; hostname verification passed with OpenSSL verify code 0.
- Certificate: Let’s Encrypt certificate for `mail.frankai.online`, valid through `2026-10-31`.
- A mail-only Caddy site block was added, validated, and reloaded. It returns a static response and does not proxy SMTP.
- Caddy automatic certificate management now lists `mail.frankai.online`; the Postfix certificate sync path is enabled and the sync hook completed successfully.
- The installed Caddy build has no forced renewal command, and no completed renewal event was observed: `ACME_RENEWAL_PARTIAL`.

## Staging and external delivery

Staging remained healthy, but protected staging inspection variables and the
inspection database input were absent. The repository email tests could not
start because the local `tsx` dependency is unavailable. No Gmail, Outlook,
Yahoo, or other controlled recipient file existed, so no external message was
submitted and no provider SPF/DKIM/DMARC or placement result is claimed.

```text
SMTP_STAGING_PARTIAL
GMAIL NOT_RUN
OUTLOOK NOT_RUN
YAHOO NOT_RUN
OTHER_CONTROLLED NOT_RUN
```

## Health check and logging

`deploy/smtp/frankai-smtp-health-check` and
`/usr/local/sbin/frankai-smtp-health-check` now fail closed unless Hostinger
activity, operational addresses, DMARC mailbox verification/report monitoring,
bounce readiness, inbound delivery, ACME proof, and a production PID baseline
are explicitly evidenced. The current run correctly fails on those missing
gates and on the missing DMARC `rua`.

Gitleaks was not installed, so a Gitleaks result cannot be claimed. No secrets,
recipient addresses, private keys, or raw mail headers were added to the
repository. The application supports `EMAIL_FROM` and `EMAIL_REPLY_TO`; the
unsupported proposed envelope/from variables were not added.

## Final decision

```text
PRODUCTION_SMTP_NOT_ACTIVATED
PRODUCTION_HEALTH_VERIFIED
SMTP_LOG_REDACTION_PARTIAL
VOICE_DISABLED_PENDING_SEPARATE_ACTIVATION
ROLLBACK_READY
NOT_READY_FOR_PRODUCTION_SMTP
```

Production SMTP remains inactive. No production environment value was changed,
no production restart occurred, and no unrelated application, database, DNS,
voice, or infrastructure change was made.

## Remaining blockers and Ray actions

1. Confirm Hostinger subscription/account state, MFA, and the four protected operational mailbox/alias destinations.
2. Send controlled external messages to each configured address and one unconfigured address; record delivery, rejection, delay, duplicates, and loops.
3. Publish `rua=mailto:dmarc@frankai.online` only after that mailbox is confirmed monitored; then verify mailbox receipt and later real aggregate reports.
4. Confirm monitored bounce handling with a harmless invalid-recipient test.
5. Create `/root/.config/frankai-smtp-test-recipients.env` with controlled Gmail, Outlook, Yahoo, and other-recipient values, mode 0600, without exposing them.
6. Provide protected staging inspection inputs and install the repository test dependencies, then rerun staging acceptance.
7. Obtain a safe, supported ACME renewal proof for `mail.frankai.online`; configuration is owned by Caddy but renewal is not yet observed.
8. Run Gitleaks or provide an approved scanner before claiming `SMTP_LOG_REDACTION_VERIFIED`.

Until all mandatory gates pass, the correct decision is `NOT_READY_FOR_PRODUCTION_SMTP`.
