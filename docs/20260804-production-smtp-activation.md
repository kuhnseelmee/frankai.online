# Production SMTP activation package — 2026-08-04

Preparation only. This document does not authorize or execute production SMTP
activation. No production environment or service was changed during this
acceptance audit.

## Candidate identity

- Application candidate: current FrankAI standalone candidate on
  `frankai-site.service`, local port 4300.
- Candidate SMTP configuration: staging has the SMTP names below; production
  remains on its current protected environment. No production checksum is
  claimed without a pre-run baseline.
- DNS: A/PTR/FCrDNS, merged SPF, and the corrected DKIM key are present; missing
  DMARC reporting remains a blocker.
- Certificate: Let’s Encrypt certificate for `mail.frankai.online`, expiry
  2026-10-31; local STARTTLS verification passed.
- Postfix: 3.10.12. Rspamd: 3.12.1. Health-check source:
  `deploy/smtp/frankai-smtp-health-check`.
- Backup reference: `/root/backups/frankai-smtp/20260802T235600+1000/`.

## Proposed production environment change

Apply only after approval, using the actual names already present in the
protected environment:

```dotenv
EMAIL_PROVIDER=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_FROM=no-reply@frankai.online
SMTP_FROM_NAME=FrankAI
SMTP_SECURITY_FROM=security@frankai.online
```

Do not apply these values during the current phase.

Inbound prerequisite: approve and activate the selected external provider,
prove the four aliases, publish the monitored DMARC `rua`, and prove bounce
receipt. The provider comparison recommends Fastmail MX-only, with Forward
Email as fallback. This remains a preparation package only.

## Activation gates and sequence

1. Close the DNS/DMARC, Caddy/ACME, inbound-routing, recipient, bounce, and production
   baseline blockers in the acceptance report.
2. Record fresh production service, environment, build, Caddy, and database
   fingerprints; create a fresh protected production backup.
3. Start an alternate candidate if required and verify all four active email
   templates against controlled recipients.
4. Under explicit approval, edit only the protected production environment,
   restart `frankai-site.service`, and verify HTTP/HTTPS health.
5. Verify login, invitation, email verification, password reset, and password
   changed flows; inspect token-free outbox payloads and bounded failure state.
6. Verify queue age/count, external delivery, SPF/DKIM/DMARC, TLS, logging,
   and that voice remains disabled.
7. Monitor Postfix, Rspamd, application, and bounce/reporting signals.

## Rollback

Restore the prior protected environment and previous application build, return
the email provider to its previous value, and restart only with approval.
Preserve queued messages for review; do not delete them as a shortcut. Verify
public HTTPS, authentication, database health, email failure state, and voice
disabled status, then record any submitted-message consequences.

## Approval

Current decision: `NOT_READY_FOR_PRODUCTION_SMTP`.

The restricted phase repaired Caddy configuration readability and verified
public HTTPS without restarting the production application. The mail-host
renewal path remains partial, and inbound routing still requires provider/MX
approval.

Separate explicit authorization from Ray is required after the acceptance
report is updated with successful DNS-key, DMARC-reporting, ACME, controlled
provider delivery, bounce, and logging evidence.
