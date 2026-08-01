# Browser acceptance

Playwright is pinned as a development dependency. The local acceptance command
is:

```bash
npm run test:browser
```

The suite runs against the permanent localhost staging service. The latest
default run before the reconciliation gate passed 2 tests and skipped 3
authenticated journeys because `STAGING_E2E` and the isolated staging database
flags were not loaded. The gated suite now rejects the production database and
production origin before creating test data. Full authenticated acceptance must
be reported from the explicit gated run. Administrator mutation,
reauthentication, session-management, and final-administrator browser journeys
remain outside the currently implemented browser set.

Do not retain screenshots or traces containing invitation URLs, reset URLs, QR
provisioning data, TOTP secrets, recovery codes, passwords, or cookies.
