# FrankAI inbound-provider DNS plan

Status: `INBOUND_DNS_PLAN_READY`. Prepared only; no DNS changes were made.

## Current records captured on 2026-08-04

- MX: `5 mx1.hostinger.com.`, `10 mx2.hostinger.com.`
- SPF: one record, `v=spf1 include:_spf.mail.hostinger.com a:mail.frankai.online -all`
- VPS DKIM: `mail._domainkey.frankai.online`, selector `mail`; preserve it.
- DMARC: `v=DMARC1; p=none; pct=100; adkim=s; aspf=s`; no `rua` yet.
- Hostinger DKIM CNAME selectors, `autodiscover`, and `autoconfig` remain present.
- `mail.frankai.online` A/PTR/FCrDNS remain VPS outbound records.

## Approved-candidate records (Fastmail MX-only)

After Ray approves an account and Fastmail supplies the domain verification
value, publish only the values confirmed in that account. The official
MX-only setup specifies:

```text
@  MX  10  in1-smtp.messagingengine.com.
@  MX  20  in2-smtp.messagingengine.com.
```

These must be the only apex MX records. Add the Fastmail-provided domain
verification TXT record exactly as displayed by Fastmail. Do not invent a
verification token. Fastmail’s setup also supplies provider-specific SPF/DKIM
records for sending; they are not required for this inbound-only migration and
must not replace the VPS outbound records.

Create four aliases or mailboxes: `dmarc`, `bounce`, `security`, and `support`.
Disable catch-all. Keep `mail._domainkey.frankai.online`, the VPS SPF
mechanism `a:mail.frankai.online`, the root A record, and all website records.

After inbound receipt is proven, publish exactly one DMARC record:

```text
v=DMARC1; p=none; pct=100; adkim=s; aspf=s; rua=mailto:dmarc@frankai.online
```

Do not add `ruf`, change enforcement, or create a second SPF record.

## Sequence

1. Ray approves provider, cost, account, aliases, retention, and MX change.
2. Verify provider MFA, domain ownership, and all four destinations before MX change.
3. Lower apex MX TTL if appropriate and record the old TTL.
4. Publish provider verification TXT only; verify both authoritative servers.
5. Replace only apex MX records; do not touch A, PTR, SPF, VPS DKIM, website, or subdomain records.
6. Query both authoritative servers plus 1.1.1.1, 8.8.8.8, and 9.9.9.9.
7. Send controlled inbound tests to all four aliases.
8. Only after `dmarc@` receipt succeeds, publish the DMARC `rua` value.
9. Record propagation and receipt evidence without recipient addresses or raw headers.

Fastmail reference: [official MX-only setup](https://www.fastmail.help/hc/en-us/articles/1500000280261-Setting-up-your-domain-MX-only).

