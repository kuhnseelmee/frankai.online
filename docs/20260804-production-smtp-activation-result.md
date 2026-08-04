# FrankAI authorised mail cutover result — 2026-08-04

## Decision

`PRODUCTION_SMTP_NOT_ACTIVATED`

Ray authorised the gated cutover, but mandatory gates were not satisfied. No
Fastmail account was available to configure, no controlled recipient accounts
were available, and no human-only account, payment, MFA, or CAPTCHA step was
bypassed.

## Baseline

- Production PID/start: `789`, `2026-08-04 04:41:36 AEST`.
- Production/local HTTP: 200. Public HTTPS: 200. Staging: 200.
- Production environment checksum:
  `477c290fb3c18fb59e49d5475496463ce91b3d7b313c4f29e3ee58e9c299a2eb`.
- Production unit checksum:
  `933fd397844b3b7b6f374e60491c383ee1ad4ecffd62206bca489a08d7772802`.
- Caddy checksum:
  `8940cc26e5a3c20024d48a1751b59128c8e7c63d5ede100c2ea30d5093de3718`.
- Queue empty; SMTP submission, Rspamd, and Mailpit remained loopback-only.
- Voice remained disabled.

Protected backup:
`/root/backups/frankai-smtp/20260804T065154+1000-authorised-mail-cutover/`

## Current gate results

| Gate | Result |
|---|---|
| Fastmail account/MFA/domain | `NOT_RUN` — account access unavailable |
| Fastmail MX migration | `NOT_RUN` — DNS unchanged |
| Inbound aliases/delivery | `NOT_RUN` |
| DMARC reporting | `DMARC_REPORTING_PENDING` |
| Bounce receipt | `BOUNCE_PROCESSING_NOT_RUN` |
| Gmail/Outlook/Yahoo delivery | `NOT_RUN` — recipients unavailable |
| ACME ownership | `ACME_RENEWAL_PARTIAL` |
| Production SMTP | `PRODUCTION_SMTP_NOT_ACTIVATED` |

The production application was not restarted and `/etc/frankai-site.env` was
not modified.

## Required continuation inputs

Ray must complete or provide the Fastmail account’s human-only steps and
protected access, then provide controlled recipient addresses in
`/root/.config/frankai-smtp-test-recipients.env`. After that, the DNS,
inbound-delivery, bounce, external-acceptance, and production gates can be
resumed in order.
