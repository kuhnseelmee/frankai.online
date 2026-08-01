# Authentication operator runbook

This runbook is for the controlled staging-to-production approval step. It contains no secret values. Do not perform production activation until every acceptance-matrix blocker is closed and Hostinger rotation is confirmed.

## Hostinger incident

1. Revoke the exposed Hostinger token in hPanel.
2. Create a replacement only if the mail integration still requires one.
3. Store it only in the root-owned production environment or secret manager.
4. Verify the old token is invalid or record provider confirmation of revocation.
5. Record only the rotation date and incident reference.

## Administrator bootstrap

Load the same protected environment used by the production service before
running the interactive command. Do not type or paste any secret values into
the command itself:

```bash
set -a
. /etc/frankai-site.env
set +a
npm run admin:create -- --email <administrator-address>
```

The command now refuses to select a store implicitly. It must print that the
administrator was created in PostgreSQL. If it reports the file store, stop;
the environment was not loaded and the account is not usable by production.

Enter the password interactively. Do not place it in arguments, shell history,
tickets, logs, or chat. Confirm the command creates a new PostgreSQL
administrator and refuses duplicate or existing-user modification.

## MFA

1. Log in with the bootstrap password.
2. Open the MFA setup route.
3. Scan the provisioning QR or use the manual key only during setup.
4. Confirm the first TOTP code.
5. Store the one-time recovery codes offline.
6. Log out and complete a fresh MFA login.
7. Test one recovery code once, then confirm reuse fails.

Never copy QR data, TOTP secrets, or recovery codes into a report.

## SMTP

Set SMTP values in the protected environment file, then send test invitation, verification, reset, and password-change messages to controlled addresses. Confirm SPF, DKIM, DMARC, sender, reply-to, and failure handling with the provider. Do not use real external recipients in staging without approval.

## Production approval

Ray must separately approve invitation wording, verification wording, recovery wording, privacy terms, and the authentication cutover. Voice remains disabled and requires a separate future activation decision.
