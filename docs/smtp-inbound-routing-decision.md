# FrankAI inbound routing decision — 2026-08-04

This is a preparation document only. No MX record, mailbox provider, alias,
third-party service, or VPS inbound service was activated.

## Current state

The public MX records remain Hostinger (`mx1.hostinger.com` and
`mx2.hostinger.com`), while Hostinger’s `frankai.online` mail order is
currently suspended. Existing autodiscover/autoconfig and Hostinger DKIM
records remain published. No Dovecot, IMAP, POP3, webmail, or VPS mailbox
service is installed.

## Options

| Option | DMARC reports | Bounces | Human replies | Domain aliases | MX change | Operational burden | Cost | Security risk | Recommendation |
|---|---|---|---|---|---|---|---|---|---|
| Restore Hostinger Email | yes if restored | yes if restored | yes | yes | none or minimal | low after restoration | requires approval/payment | existing provider dependency | Do not rely on while suspended |
| External custom-domain mailbox provider | yes | yes | yes | yes | replace Hostinger MX | moderate | provider approval/payment | provider and MX migration risk | Recommended for approval |
| Forwarding provider | depends on provider | provider-dependent | forwarded | usually yes | replace Hostinger MX | moderate | provider approval/payment | forwarding/NDR and privacy risk | Candidate fallback |
| Dedicated DMARC service plus separate bounce mailbox | yes | separate service | separate mailbox | service-dependent | possibly split MX | high | two providers | fragmented monitoring | Use only if mailbox provider lacks DMARC support |
| VPS inbound mail | yes | yes | yes | yes | point MX to VPS | very high | infrastructure cost | public mail attack surface and data risk | Out of scope / prohibited |

## Recommended strategy

Use Fastmail Standard in MX-only custom-domain mode (Option B), subject to
Ray’s approval and provider account creation. Configure aliases or mailboxes
for:

- `dmarc@frankai.online` — aggregate reports, restricted access and periodic
  review;
- `bounce@frankai.online` — NDR and bounce monitoring;
- `security@frankai.online` — security-related delivery failures;
- `support@frankai.online` — human correspondence and optional Reply-To.

Fastmail’s official MX-only records are `in1-smtp.messagingengine.com` priority
10 and `in2-smtp.messagingengine.com` priority 20. The account-specific domain
verification value must come from Fastmail; do not publish a placeholder.
Forward Email Enhanced Protection is the fallback. Cloudflare Routing is not
recommended as the primary route because its official postmaster limitations
make NDR/bounce handling unsuitable as the sole monitored control.

## Approval and rollback

Ray must approve the provider, cost, mailbox ownership, privacy/retention
policy, and MX migration. Before migration, reduce TTL if appropriate and
capture the current Hostinger MX/TXT/CNAME set. Rollback restores the captured
Hostinger records only if the order is operational; otherwise the replacement
provider remains the authoritative inbound route.

Current status: `INBOUND_STRATEGY_READY_FOR_RAY_APPROVAL`.

The strategy is not active. DMARC reporting remains
`DMARC_REPORTING_PENDING`, and bounce routing remains
`BOUNCE_ROUTING_READY_FOR_ACTIVATION`.

No provider was purchased or activated, no MX record was changed, and inbound
delivery remains `INBOUND_DELIVERY_NOT_RUN`. See the comparison, DNS, rollback,
security, DMARC, and bounce documents for the detailed plans.
