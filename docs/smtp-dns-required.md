# FrankAI SMTP DNS checklist

Current acceptance refresh: 2026-08-06. Authoritative and public resolver
queries agree. Hostinger MX, VPS A/PTR/FCrDNS, SPF, VPS DKIM, Hostinger DKIM
CNAMEs, and autodiscover/autoconfig are present. The current DMARC record still
has no `rua`; do not claim reporting until the monitored mailbox exists.

Reviewed 2026-08-03. DNS was not modified automatically. Authoritative nameservers are `ns1.dns-parking.com` and `ns2.dns-parking.com`; both now publish the same records.

Historical observations below are retained for audit context. Current records
are summarized in `docs/20260806-hostinger-mail-activation-result.md`.

- `frankai.online A`: `76.13.180.125`.
- `mail.frankai.online A`: `76.13.180.125`, TTL 300, PRESENT.
- `frankai.online MX`: Hostinger (`mx1.hostinger.com`, `mx2.hostinger.com`). Do not replace this MX while bounce/report handling is undecided.
- Existing SPF: `v=spf1 include:_spf.mail.hostinger.com ~all`.
- Existing DMARC: `v=DMARC1; p=none`.
- Current IPv4 PTR: `srv1661521.hstgr.cloud` (not aligned).
- `mail._domainkey.frankai.online TXT`: missing.
- Public resolvers agree on the A record; DKIM is not yet published.

The reviewed SPF replacement is:

```dns
frankai.online. TXT "v=spf1 include:_spf.mail.hostinger.com a:mail.frankai.online -all"
```

Its current include tree is Hostinger → `relay.mail.hostinger.com` and
`relay.mailchannels.net`, plus the VPS A mechanism; the expected DNS lookup
count is four, below SPF's ten-lookup limit. The current record has not been
replaced automatically.

Remaining manual changes for Ray:

```dns
mail.frankai.online. A 76.13.180.125
```

The A record is already present and must not be replaced with a CNAME. Do not publish an AAAA record: Postfix is IPv4-only and IPv6 outbound SMTP/PTR/reputation have not been validated.

Set Hostinger reverse DNS:

```text
76.13.180.125 -> mail.frankai.online
```

Merge SPF into the single existing SPF TXT record (do not publish a second SPF record):

```dns
frankai.online. TXT "v=spf1 include:_spf.mail.hostinger.com a:mail.frankai.online -all"
```

If Hostinger is no longer an authorized sender, use `v=spf1 a:mail.frankai.online -all` instead. This choice requires Ray's review because the current MX/provider may still send mail.

DKIM selector and public value:

```dns
mail._domainkey.frankai.online. TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz6wixU1F35/6AQMlUbcf8rvkmH5CirfYy+SL++IJ1/eMD4AIHkVc1GzpzO4A9z9nIJNjIXNilbL8GsPAD49XGrapiJzmbbmJBvR1bvCvOT7ewTwANVoFnDniNzaW3dTOq3H0kD75GLlM5o65LBt78aS77XsY3pZ9gKDWYW/BWAXnRvAcuTdMwVjQUgVwS8O9Mmj3YfYh6u5S2c7XgbZheMYS0psCPkh9+Z6sxTjNUFm5yjBGJWusBWBM55/wdC8XqYNsUytHdD1abL1I+WNjmDYiqPdmbD3435gXfOTI+HupBQvSwO0gCtZpT+X7NsC+vSfCmzWrCWXR0IlYKcGb2QIDAQAB"
```

Until a monitored aggregate-report address is selected, retain this strict-alignment monitoring record without `rua`:

```dns
_dmarc.frankai.online. TXT "v=DMARC1; p=none; pct=100; adkim=s; aspf=s"
```

After Ray confirms a monitored address, append `rua=mailto:<MONITORED_REPORT_ADDRESS>`. Do not publish `p=quarantine` or `p=reject` in this phase.

## Operator checklist

- [x] Add A: `mail.frankai.online -> 76.13.180.125`
- [x] Do not add AAAA
- [ ] Set PTR: `76.13.180.125 -> mail.frankai.online`
- [ ] Replace the existing single SPF record with the reviewed merged record
- [ ] Add DKIM TXT at `mail._domainkey.frankai.online`
- [ ] Update DMARC to strict alignment
- [ ] Choose a monitored DMARC report address, then add `rua`
- [x] Wait for A-record propagation; both authoritative servers and public resolvers agree

## 2026-08-04 acceptance update

Both authoritative nameservers and public recursive resolvers agree on A,
PTR/FCrDNS, merged SPF, and Hostinger MX. The published `mail` DKIM key does
now match the active Rspamd key after the Hostinger API update. DMARC still has
no `rua` tag; final readiness is blocked pending reporting configuration.

## Restricted-phase inbound routing plan

Hostinger MX and Hostinger DKIM CNAME records remain published, but the
Hostinger `frankai.online` mail order is suspended. Do not point MX at the VPS.
The proposed replacement is an approved external custom-domain mailbox
provider with `dmarc`, `bounce`, `security`, and `support` aliases. Exact MX,
verification TXT, and provider DKIM records remain unknown until Ray selects a
provider. The prepared DMARC value is:

```text
v=DMARC1; p=none; pct=100; adkim=s; aspf=s; rua=mailto:dmarc@frankai.online
```

Do not publish it until that address exists and monitored inbound delivery is
verified.
