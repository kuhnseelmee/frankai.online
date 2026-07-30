# Browser acceptance

Playwright is pinned as a development dependency. The local acceptance command
is:

```bash
npm run test:browser
```

The suite runs against the permanent localhost staging service. The current
acceptance run is 5/5 and verifies the login/admin boundary, absence of
access/refresh tokens in Web Storage, absence of microphone request signals,
invitation redemption plus verification, password-reset completion with
old-session invalidation, and administrator MFA enrollment with one-time
recovery-code acknowledgement. Administrator mutation, reauthentication,
session-management, and final-administrator browser journeys remain outside
this passing set.

Do not retain screenshots or traces containing invitation URLs, reset URLs, QR
provisioning data, TOTP secrets, recovery codes, passwords, or cookies.
