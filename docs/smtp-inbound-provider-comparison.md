# FrankAI inbound-provider comparison

Decision date: 2026-08-04. This is a preparation document. No provider was
purchased, activated, or given FrankAI credentials.

## Evidence

The comparison used official provider documentation and pricing pages reviewed
on 2026-08-04:

- [Fastmail custom-domain MX-only setup](https://www.fastmail.help/hc/en-us/articles/1500000280261-Setting-up-your-domain-MX-only)
- [Fastmail pricing](https://www.fastmail.com/pricing/us/)
- [Forward Email FAQ](https://forwardemail.net/en/faq)
- [Forward Email pricing and features](https://forwardemail.net/en/mx-record-hosting-setup)
- [Cloudflare Email Routing addresses](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/)
- [Cloudflare Email Routing pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Cloudflare postmaster limitations](https://developers.cloudflare.com/email-service/reference/postmaster/)
- [Zoho custom-domain setup](https://www.zoho.com/mail/help/adminconsole/add-domains.html)
- [Zoho Mail pricing](https://www.zoho.com/mail/zohomail-pricing.html)

Prices and regional availability must be confirmed by Ray at checkout; no
unstated price or Australian payment availability is assumed.

## Matrix

| Provider | Type | Custom domain | Mailboxes | Aliases | DMARC reports | Bounce/NDR | MFA | MX impact | SPF impact | DKIM impact | Monthly cost | Operational burden | Privacy | Rollback | Status |
|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|---|---|---|---|
| Fastmail Standard | Hosted mailbox | yes | yes | shared addresses | mailbox receipt | mailbox receipt | documented account security | replace Hostinger MX | none for inbound-only | preserve VPS `mail` selector | checkout/region dependent | low | private mailbox provider | simple MX restore | Recommended |
| Forward Email Enhanced Protection | Forwarding + hosted storage | yes | no/alias model | unlimited on published plan | DMARC feature documented | provider-dependent; must test | account controls to verify | replace Hostinger MX | only if its outbound SMTP is used | preserve VPS selector; provider selector separate if sending | $3/month published, subject to change | low-medium | privacy-oriented, forwarding exposure | simple MX restore | Fallback |
| Cloudflare Email Routing | Forwarding | yes | no | routing addresses | not a mailbox | NDR limitations documented; unsuitable as primary bounce control | Cloudflare account MFA | requires Cloudflare DNS/MX | none for inbound-only | preserve VPS selector | free inbound routing; paid outbound features | medium | destination mailbox receives content | DNS/MX restore | Budget fallback only |
| Zoho Mail | Hosted mailbox | yes | plan-dependent | plan-dependent | mailbox receipt | mailbox receipt | paid plans list MFA | replace Hostinger MX | none for inbound-only | preserve VPS selector; provider selector separate if sending | plan/region dependent | medium | provider mailbox | simple MX restore | Secondary fallback |
| Restored Hostinger Email | Hosted mailbox | yes | existing order | existing order | mailbox receipt | mailbox receipt | verify account controls | none/minimal | existing record | existing selectors | requires restoration/payment | low after restore | existing provider dependency | none while suspended | Not currently usable |
| VPS inbound mail | Self-hosted | yes | yes | yes | yes | yes | self-managed | point MX to VPS | separate | separate | infrastructure cost | very high | high attack/data surface | difficult | Out of scope |

## Scoring (1 poor, 5 strong)

| Candidate | Security | Reliability | Admin | DMARC | Bounce | Cost | Migration | Rollback | VPS coexistence | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Fastmail | 5 | 5 | 5 | 5 | 5 | 3 | 4 | 4 | 5 | 41/45 |
| Forward Email | 4 | 4 | 4 | 4 | 3 | 5 | 4 | 4 | 5 | 37/45 |
| Cloudflare Routing | 5 | 4 | 4 | 2 | 1 | 5 | 2 | 3 | 5 | 31/45 |
| Zoho Mail | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 37/45 |
| Hostinger restored | 3 | unknown while suspended | 4 | 3 | 3 | unknown | 5 | 4 | 5 | not scored |

## Decision

Status: `INBOUND_PROVIDER_RECOMMENDED`.

Recommend Fastmail Standard, using MX-only custom-domain setup, subject to Ray
approving cost, account ownership, privacy/retention, and the exact setup
wizard records. Use Forward Email Enhanced Protection as fallback. Do not
activate either service automatically. Cloudflare Routing is not the primary
choice because its official postmaster documentation says it does not forward
NDRs to the original sender and does not provide normal sending/replying from
the Cloudflare domain.

