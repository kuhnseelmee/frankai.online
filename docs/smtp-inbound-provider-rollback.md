# FrankAI inbound-provider rollback

Rollback is prepared, not executed. It cannot guarantee zero message loss
during DNS propagation.

## Original records

Restore the captured values only if Hostinger inbound has been restored and
verified: `MX 5 mx1.hostinger.com.`, `MX 10 mx2.hostinger.com.`. Restore the
original TTL, the existing Hostinger verification/autodiscover/autoconfig and
DKIM CNAME values, and the pre-migration DMARC value if the new report mailbox
is no longer available. Never restore a stale MX merely because it is old.

## Sequence

1. Freeze mailbox changes and export/retain provider messages where possible.
2. Capture current authoritative DNS and provider receipt state.
3. Restore the approved prior MX/TXT/CNAME values through the authorised DNS process.
4. Query both authoritative servers and public recursive resolvers.
5. Test one controlled inbound message to each required address.
6. Check forwarding, duplicates, delayed mail, and provider queue state.
7. Keep the DMARC `rua` only if `dmarc@frankai.online` is still monitored; otherwise revert to the approved `p=none` record without `rua`.
8. Document mail potentially held or lost during propagation and reconcile manually.

The VPS outbound A, PTR, FCrDNS, SPF VPS mechanism, DKIM selector, Postfix,
Caddy, website, and production application are not rollback targets.

