# Lifecycle evidence summary

- Staging root/login boundary: 200.
- Unauthenticated `/api/auth/me`: 401.
- Public signup POST: 403.
- Password-forgot request: generic 200.
- Password-reset message captured by local Mailpit.
- Outbox password-reset payload contains no token/password/secret/code key.
- Two staging application processes shared the PostgreSQL login limiter: ten
  requests were accepted and subsequent requests returned 429.
- Concurrent refresh race: exactly one 200 and one 401.
- JWT negative suite: three tests passed across malformed algorithm, issuer,
  audience, expiry, nbf, token type, identifier, and signature cases.
