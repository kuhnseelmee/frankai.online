# Three-provider SMTP acceptance — 2026-08-06

Ray’s approved Yahoo exception was applied. Yahoo account creation remains
unavailable after repeated operator attempts from two devices; no Yahoo account
was created, borrowed, duplicated, or substituted.

## Recipient policy

```text
CONTROLLED_RECIPIENTS_READY
YAHOO_TEST_UNAVAILABLE
```

The protected file is `root:root` mode `0600`. Required mappings are present,
syntactically valid, distinct, and classify as Gmail, Microsoft/Outlook, and an
independent provider. Yahoo is absent and was not treated as a pass.

## Submission tests

One harmless plain-text message was submitted through loopback Postfix with
STARTTLS to each required provider mapping. Postfix accepted all three, and
the queue drained. No links, attachments, tokens, personal data, or action
URLs were included.

Mailbox placement and provider authentication headers were not accessible
from the protected recipient file, so these results are not claimed as full
delivery passes:

```text
GMAIL_DELIVERY_PARTIAL
OUTLOOK_DELIVERY_PARTIAL
OTHER_CONTROLLED_DELIVERY_PARTIAL
```

No Yahoo message was sent.

## Operator mailbox receipt evidence

Ray confirmed visible receipt of the acceptance message at Gmail, Outlook,
and Fastmail on 2026-08-06 at approximately 22:17 AEST. Gmail showed a
`frankai.online` mailed-by indicator and TLS indicator. The Outlook receipt
was confirmed at approximately the same time. Fastmail receipt was confirmed
at 22:17 AEST with an approximately 7 KB message.

This confirms mailbox receipt only. Protected provider headers and explicit
placement evidence were not available, so SPF, DKIM, DMARC, and inbox/junk/spam
placement are not claimed. See
`docs/20260806-provider-receipt-evidence.md` for the evidence boundary.

```text
THREE_PROVIDER_RECEIPT_VERIFIED
GMAIL_MAILBOX_RECEIPT_CONFIRMED
OUTLOOK_MAILBOX_RECEIPT_CONFIRMED
FASTMAIL_MAILBOX_RECEIPT_CONFIRMED
YAHOO_TEST_UNAVAILABLE
```

## Other gates

```text
DMARC_DNS_VERIFIED
SPF_VERIFIED
DKIM_SIGNING_VERIFIED
SMTP_TLS_VERIFIED
ACME_RENEWAL_PARTIAL
GITLEAKS_REMEDIATION_PARTIAL
REPOSITORY_VALIDATION_PASS
STAGING_INSPECTION_BLOCKED
SMTP_STAGING_PARTIAL
SMTP_HEALTH_CHECK_FAIL
PRODUCTION_SMTP_NOT_ACTIVATED
```

DMARC DNS is correct and resolver-consistent, but mailbox receipt, inbound
delivery, bounce monitoring, completed ACME renewal, staging inspection, and
provider SPF/DKIM/DMARC evidence remain unproven.

Gitleaks found no leaks in current tracked working-tree content after replacing
the JWT-shaped documentation example with a synthetic value. The historical
Git scan still reports the old committed value; history was not rewritten.

Production SMTP remains inactive.
