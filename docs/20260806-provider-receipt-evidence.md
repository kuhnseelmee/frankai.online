# Provider Receipt Evidence — 2026-08-06

This record separates operator-confirmed mailbox receipt from provider header
authentication and placement evidence. Recipient addresses and raw headers are
intentionally excluded.

## Operator-confirmed receipt

| Provider | Evidence | Authentication | Placement |
|---|---|---|---|
| Gmail | Mailbox receipt confirmed at 22:17 AEST; `frankai.online` mailed-by indicator and TLS indicator were visible | Not supplied in protected headers | Not explicitly established |
| Outlook | Mailbox receipt confirmed at approximately 22:17 AEST | Not supplied in protected headers | Not explicitly established |
| Fastmail | Mailbox receipt confirmed at 22:17 AEST; message approximately 7 KB | Not supplied in protected headers | Not explicitly established |

The three messages were submitted through loopback Postfix with STARTTLS,
correlated to local queue IDs, and the queue drained without duplicates.
Accordingly:

```text
THREE_PROVIDER_RECEIPT_VERIFIED
GMAIL_MAILBOX_RECEIPT_CONFIRMED
OUTLOOK_MAILBOX_RECEIPT_CONFIRMED
FASTMAIL_MAILBOX_RECEIPT_CONFIRMED
```

The authoritative host health check also confirmed the queue was empty after
submission and that public SMTP remained closed. This correlation does not
replace provider-side authentication headers.

The evidence does not establish `spf=pass`, `dkim=pass`, `dmarc=pass`, or
precise inbox/junk/spam placement. The provider result remains partial until
protected headers and placement evidence are available:

```text
GMAIL_DELIVERY_PARTIAL
OUTLOOK_DELIVERY_PARTIAL
OTHER_CONTROLLED_DELIVERY_PARTIAL
```

## Protected evidence inputs

The optional protected evidence directory was checked at:

```text
/root/.config/frankai-smtp-evidence/
```

No provider header or placement files were available during this acceptance
run. Raw headers must be supplied only through protected files and must not be
copied into this repository.

## Yahoo exception

```text
YAHOO_TEST_UNAVAILABLE
```

The approved exception applies because a controlled Yahoo account could not be
created after repeated legitimate attempts from two devices. Fastmail is the
independent third-provider target; it is not classified as Yahoo.
