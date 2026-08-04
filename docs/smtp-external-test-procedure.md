# FrankAI external SMTP acceptance procedure

Preparation only. No external message is sent until Ray supplies controlled
recipient accounts. Do not use customer addresses or fabricate recipients.

## Protected inputs

Create the file only when controlled accounts are supplied:

```text
/root/.config/frankai-smtp-test-recipients.env
```

```dotenv
SMTP_TEST_GMAIL=<controlled-address>
SMTP_TEST_OUTLOOK=<controlled-address>
SMTP_TEST_YAHOO=<controlled-address>
SMTP_TEST_OTHER=<controlled-address>
```

Protect it with root ownership, directory mode 0700, and file mode 0600. Do
not commit it, print it, or retain it in browser artifacts.

## Test sequence

For each provider independently, send a harmless plain-text message from an
approved sender with no links, attachments, tokens, or credentials. Record
only sanitized evidence: queue ID, provider response, delay, inbox/spam
placement, SPF, DKIM, DMARC, TLS, HELO/PTR, and any reputation warning.

Inspect provider authentication results and redact recipient identifiers and
raw headers before saving evidence. Test bounce routing separately with a
controlled invalid recipient only after an approved monitored bounce address
exists. Do not run password-reset, invitation, MFA, or recovery workflows in
the first delivery test.

Required result for a provider: `spf=pass`, `dkim=pass`, `dmarc=pass`, with
placement and delay reviewed. Current status:
`EXTERNAL_TEST_READY_PENDING_RECIPIENTS`.

Inbound aliases are a separate gate. Do not send the bounce or DMARC tests
until Ray approves a provider, the aliases exist, and receipt is proven.
