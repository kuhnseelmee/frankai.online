# Staging SMTP acceptance

Staging only uses `/etc/frankai-site-staging.env` with `EMAIL_PROVIDER=smtp`, `SMTP_HOST=mail.frankai.online`, `SMTP_PORT=587`, `SMTP_SECURE=false`, and `EMAIL_FROM=no-reply@frankai.online`. The hostname resolves to `127.0.0.1` through the protected local hosts mapping, so submission remains local-only while TLS hostname validation uses `mail.frankai.online`. The protected file remains mode `0600`. Staging no longer uses the interim `NODE_EXTRA_CA_CERTS` override; it now validates the trusted Let’s Encrypt certificate through the normal Node trust store. Production was not restarted or reconfigured.

The authoritative registry contains four `ACTIVE_TRIGGERED` templates: `INVITATION`, `EMAIL_VERIFICATION`, `PASSWORD_RESET`, and `PASSWORD_CHANGED`. `MFA_DISABLED`, `ADMIN_SECURITY_ALERT`, and `NEW_LOGIN` remain `INACTIVE_RESERVED` and were not activated.

Completed infrastructure evidence:

- staging endpoint returned HTTP 200 after the SMTP environment update;
- approved envelope sender accepted at local submission RCPT;
- arbitrary sender rejected with `554 5.7.1`;
- sanitized invalid-domain queue message received a DKIM signature (`d=frankai.online`, `s=mail`);
- captured test message and generated bounce were removed; final queue was empty;
- Postfix, Rspamd, Redis, staging, and production services were active;
- Let’s Encrypt TLS validated with hostname verification and OpenSSL verify code 0;
- all four active templates passed again over the trusted certificate;
- Mailpit remains available for isolated comparison/rollback.

Not yet claimed: recipient-provider delivery to Gmail/Outlook/Yahoo, SPF/DMARC recipient results, bounce processing, and aggregate-report monitoring. Those require controlled recipients, SPF/DKIM/PTR publication, and a monitored reporting address.

Non-delivery provider checks reached Gmail, Outlook, and Yahoo MX hosts and
completed SMTP greeting/STARTTLS negotiation using the outbound VPS network.
No message was submitted because no controlled recipient accounts were
provided and PTR/authentication publication is incomplete; inbox/spam and
provider authentication results therefore remain `NOT_RUN`.

## 2026-08-04 final-phase result

Public A/PTR/FCrDNS, merged SPF, and the corrected DKIM key are present, but
DMARC has no `rua` address. No controlled
recipient file was present; Gmail, Outlook, Yahoo, bounce, DMARC reporting, and
external staging-template delivery remain `NOT_RUN`. The repository acceptance
tests skipped because the protected staging inspection database was disabled.
