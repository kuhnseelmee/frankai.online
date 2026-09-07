# FrankAI DMARC operations

Status: `DMARC_DNS_VERIFIED` and `DMARC_REPORTING_PARTIAL`. The strict
alignment record now has `rua=mailto:dmarc@frankai.online`, but mailbox receipt
and real aggregate-report receipt are not proven.

## Record to publish after receipt proof

```text
v=DMARC1; p=none; pct=100; adkim=s; aspf=s; rua=mailto:dmarc@frankai.online
```

Publish one record only. Keep monitoring policy at `p=none`; do not add `ruf`
or move to `quarantine`/`reject` in this phase.

## Review process

Review aggregate XML reports on a scheduled operational cadence (at least
weekly initially). Parse source IP, SPF result/alignment, DKIM result/alignment,
volume, and unknown senders. Compare expected VPS Postfix/Rspamd traffic with
Hostinger traffic during migration. Escalate unexpected sources or alignment
failures before any future policy change.

Retain reports according to the approved mailbox retention policy, restrict
access, and avoid committing report attachments or recipient identifiers.
