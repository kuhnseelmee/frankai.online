# FrankAI inbound-provider security requirements

Before activation, Ray must control the provider account and recovery email.

- Use a unique password and MFA; do not share credentials.
- Store recovery codes offline under Ray’s control.
- Use the minimum number of administrators and review login/audit history.
- Prefer aliases forwarding to one or two protected operator mailboxes.
- Disable catch-all and public alias discovery where the provider supports it.
- Do not create an API token unless required. If required, use least privilege,
  store it outside Git, and document revocation.
- Set retention for DMARC XML and bounce/NDR messages; restrict access.
- Do not forward DMARC or bounce mail to unapproved recipients.
- Confirm provider TLS and account-recovery controls before MX migration.
- Test alias delivery and forwarding-loop prevention before publishing DMARC `rua`.

No provider credentials, MFA seeds, recovery codes, or tokens are stored in
this repository.

