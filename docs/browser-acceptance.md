# Browser acceptance

Playwright is pinned as a development dependency. The local acceptance command
is:

```bash
npm run test:browser
```

The current smoke suite runs against the permanent localhost staging service
and verifies the login boundary, protected admin redirect, disabled voice copy,
absence of access/refresh tokens in Web Storage, and absence of microphone
request signals. Authenticated invitation, password-recovery, email-verification,
and administrator MFA workflow coverage remains incomplete.

Do not retain screenshots or traces containing invitation URLs, reset URLs, QR
provisioning data, TOTP secrets, recovery codes, passwords, or cookies.
