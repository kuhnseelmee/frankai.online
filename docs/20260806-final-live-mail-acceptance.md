# Final live mail acceptance — 2026-08-06

Fresh acceptance was run under Ray’s current authorization. Production SMTP was
not activated and `frankai-site.service` was not restarted because mandatory
gates remain unproven.

## Baseline

- Baseline: `/root/backups/frankai-smtp/20260806T175114+1000-final-live-mail-acceptance/`.
- Verified archive: `/root/backups/frankai-smtp/20260806T175114+1000-final-live-mail-acceptance.tar`.
- Production PID/start: `3183301`, active since `2026-08-05 02:32:24 AEST`.
- Production, staging, staging proxy, Postfix, Rspamd, Redis, and Caddy were active.
- Production, staging, and public HTTPS returned HTTP 200.
- Queue was empty.
- Postfix listeners were only loopback `25` and `587`; Rspamd and Mailpit remained loopback-only.
- Voice remained disabled.

## Protected recipients

```text
CONTROLLED_RECIPIENTS_INVALID
```

The file exists with `root:root` mode `0600` after correcting its insecure
initial mode. It does not contain the required four keyed variables; it
contains only two bare values. No provider mapping was inferred and no missing
recipient was invented. Provider delivery tests therefore did not run.

## DNS and mail identity

Authoritative servers and 1.1.1.1, 8.8.8.8, and 9.9.9.9 agree on the live
records. A, PTR/FCrDNS, Hostinger MX, SPF, VPS DKIM, Hostinger DKIM CNAMEs,
and autodiscover/autoconfig are present. AAAA remains absent.

DMARC is now:

```text
v=DMARC1; p=none; pct=100; adkim=s; aspf=s; rua=mailto:dmarc@frankai.online
```

```text
DMARC_DNS_VERIFIED
SPF_VERIFIED
DKIM_SIGNING_VERIFIED
```

## Hostinger inbound, reporting, and bounce

Ray’s confirmation was recorded, but no protected Hostinger mailbox/alias
access evidence or controlled external sender was available to prove real
receipt. RCPT-only diagnostics also did not establish configured-recipient
acceptance; an unconfigured-address rejection was observed, but this is not
delivery proof.

```text
HOSTINGER_INBOUND_PARTIAL
INBOUND_DELIVERY_PARTIAL
DMARC_REPORTING_PARTIAL
BOUNCE_PROCESSING_PARTIAL
```

No DMARC mailbox receipt, aggregate report, operational-address delivery, or
bounce arrival was claimed.

## TLS and ACME

The Caddy mail-only static site validates, Caddy is active, certificate storage
and the Postfix sync path are present, and local STARTTLS returns verify code 0
with TLS 1.3. The certificate is valid through `2026-10-31`.

No completed renewal or isolated issuance exercising the full deployment path
was observed. Configuration and maintenance evidence alone are insufficient.

```text
SMTP_TLS_VERIFIED
ACME_RENEWAL_PARTIAL
```

## Gitleaks and repository validation

The official Gitleaks v8.24.2 working-tree and history scans still report one
JWT-pattern finding in the pre-existing tracked `docs/api-1.json`. It was not
suppressed or rewritten without a safe remediation patch.

```text
GITLEAKS_FINDINGS_DETECTED
REPOSITORY_VALIDATION_PASS
```

Lint passed. Tests passed with 15 passes, 0 failures, and 3 explicit skips. The
isolated production build passed. The skipped tests require protected staging
inspection inputs.

## Staging and external providers

`STAGING_E2E` and `STAGING_INSPECTION_DATABASE_URL` are not configured for the
staging service. The staging endpoint is healthy, but authenticated workflow
acceptance cannot be performed.

```text
STAGING_INSPECTION_BLOCKED
SMTP_STAGING_PARTIAL
GMAIL NOT_RUN
OUTLOOK NOT_RUN
YAHOO NOT_RUN
OTHER_CONTROLLED NOT_RUN
```

## Health and decision

The fail-closed health check passes local services, listener restrictions,
queue, DNS, DKIM, TLS, HTTPS, and voice controls. It fails the missing
Hostinger/mailbox, bounce, controlled-recipient, ACME, Gitleaks, staging, and
activation-evidence gates.

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

1. Protected recipient file is invalid and lacks the four required keyed values.
2. Real Hostinger inbound receipt for the four operational addresses is unproven.
3. DMARC mailbox receipt and bounce receipt are unproven.
4. Gmail, Outlook, Yahoo, and other-provider tests are not run.
5. Staging inspection inputs are absent; external workflow tests remain skipped.
6. Completed `mail.frankai.online` ACME renewal proof is absent.
7. Gitleaks reports the pre-existing JWT-pattern finding.

Production SMTP remains inactive.

## Three-provider verification refresh

The later live pass supersedes the earlier invalid-recipient result:

```text
CONTROLLED_RECIPIENTS_READY
YAHOO_TEST_UNAVAILABLE
```

Gmail, Microsoft/Outlook, and an independent provider are configured with
distinct valid mappings. One harmless message was accepted by loopback
Postfix for each and the queue drained, but provider mailbox placement and
SPF/DKIM/DMARC headers were not accessible, so all three remain
`DELIVERY_PARTIAL`. Yahoo was not tested and remains unavailable under Ray’s
approved exception. Production was not restarted.
