# FrankAI Authentication Procedure and Verification Flow

This document describes the implemented FrankAI authentication control plane,
the browser and API procedures for each authentication journey, and the
checks required to verify that each journey is functioning correctly.

It is an operational and engineering document. Never place passwords, JWT
secrets, database credentials, MFA seeds, recovery codes, or invitation,
password-reset, or verification tokens in this document or in test evidence.

## 1. Authentication model

FrankAI uses:

- PostgreSQL as the authoritative production authentication store.
- Node.js scrypt password hashes; plaintext passwords are never stored.
- Short-lived HS256 access JWTs.
- Rotating, server-side refresh sessions.
- Secure HttpOnly access and refresh cookies.
- A readable CSRF cookie paired with an X-CSRF-Token request header.
- Invitation-only account creation in production.
- Hashed email-verification and password-reset tokens.
- TOTP MFA for administrators.
- One-time hashed administrator recovery codes.
- A separate recent-MFA assurance for sensitive administrator mutations.
- PostgreSQL-backed rate-limit buckets.
- Audit events for authentication and security-sensitive actions.

There are two administrator assurance levels:

1. MFA-authenticated session: proves that the administrator completed the MFA
   challenge after password login. It is required to enter protected
   administrator routes.
2. Recent-MFA assurance: proves that the administrator completed a fresh MFA
   reauthentication. It is required for high-impact mutations such as role
   changes, user disablement, session revocation, MFA reset, invitations, and
   protected platform publishing.

Completing ordinary administrator login MFA does not automatically create a
recent-MFA assurance. This separation is intentional.

## 2. Required production configuration

The production service reads its protected environment file through
/etc/systemd/system/frankai-site.service. Required settings include:

    NODE_ENV: production
    AUTH_STORE: postgres
    AUTH_DATABASE_ENABLED: true
    DATABASE_URL: protected PostgreSQL connection string
    JWT access secret: protected random value
    JWT refresh secret: protected random value
    COOKIE_SECURE: true
    COOKIE_SAME_SITE: lax
    MFA encryption key: protected 64-hex-character value

Configuration rules:

1. AUTH_STORE must be postgres in production.
2. AUTH_DATABASE_ENABLED must be true.
3. DATABASE_URL must be a real PostgreSQL connection string. A literal
   placeholder such as <PostgreSQL connection string> is invalid.
4. The database must contain migrations 001_auth through 005_admin_controls.
5. The runtime database role must use least privilege and must not be the
   migration role or an unnecessary superuser.
6. JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be random and at least 32
   characters long.
7. COOKIE_SECURE must be true in production so cookies are only sent over HTTPS.
8. MFA_ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes).
9. JWT_ISSUER and JWT_AUDIENCE must remain stable while tokens are valid.
10. Restart the service after changing its environment file.
11. Do not print secret values while checking the process environment.

Apply or verify migrations with:

    npm run db:migrate

The service being active is not sufficient proof of healthy authentication.
The API can still return authentication 500 errors when environment settings,
database connectivity, grants, cookie policy, or secrets are invalid.

## 3. Stored identity and token data

### 3.1 User record

The users table stores:

- id, email, email_normalized, and display_name
- password_hash and password_hash_version
- role: USER or ADMIN
- status: ACTIVE, DISABLED, LOCKED, or PENDING_VERIFICATION
- email_verified_at
- failed_login_count and locked_until
- last_login_at and password_changed_at
- security_version and role_version
- mfa_required and mfa_enrolled_at

Email lookup trims whitespace and lowercases the address.

### 3.2 Access JWT

The access JWT contains the user ID, role, token ID, issuer, audience,
timestamps, security version, role version, and an mfa boolean.

Validation rejects:

- An invalid signature or algorithm.
- A wrong issuer or audience.
- A wrong token type.
- Invalid subject or token-ID formats.
- Invalid issued-at, not-before, expiry, or maximum lifetime.
- A role, security version, or role version that no longer matches PostgreSQL.
- A user who is not ACTIVE.

The mfa claim is false after password authentication and true after a successful
administrator MFA operation.

### 3.3 Refresh session

The browser receives a random refresh token; PostgreSQL stores only its SHA-256
hash. Refresh rotation performs these steps:

1. Hash and find the presented refresh token.
2. Lock and validate the session and user.
3. Create a new token in the same token family.
4. Revoke the old session row.
5. Record the replacement session ID.
6. Return a new access/refresh pair.

Reuse of a revoked or expired refresh token invalidates the token family and
returns 401, except for the explicitly handled concurrent replacement case.

### 3.4 MFA records

The administrator TOTP secret is encrypted with AES-256-GCM and stored in
admin_mfa_secrets. The key is MFA_ENCRYPTION_KEY.

TOTP uses SHA-1, six digits, and a 30-second period. Verification accepts the
previous, current, or next time step to accommodate normal clock skew.

Ten random hexadecimal recovery codes are returned once during enrollment.
Only their SHA-256 hashes are stored in mfa_recovery_codes. A used recovery
code cannot be used again.

## 4. Cookie and CSRF procedure

### 4.1 Cookies

The application uses:

- __Host-frankai_access: HttpOnly access JWT.
- __Host-frankai_refresh: HttpOnly refresh token.
- frankai_csrf: readable CSRF token.

Access and refresh cookies use path /, the __Host- prefix, Secure transport in
production, and the configured SameSite policy. The CSRF cookie is readable
because browser JavaScript must copy it into the request header.

Never put authentication tokens in localStorage, sessionStorage, URLs, logs,
analytics payloads, or client-side error reports.

### 4.2 Obtaining CSRF

Before every state-changing browser request:

1. Request GET /api/auth/csrf with credentials included.
2. Read the frankai_csrf cookie.
3. Copy its value into X-CSRF-Token.
4. Send credentials: include.

The server requires the cookie and header to match using a timing-safe
comparison. If an Origin header is present, it must match the configured
application origin. Invalid or missing CSRF returns 403.

A generic browser sequence is:

    await fetch('/api/auth/csrf', { credentials: 'include' })
    const csrf = document.cookie.match(
      /(?:^|;\\s*)frankai_csrf=([^;]+)/
    )?.[1] || ''

    await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': csrf
      },
      body: JSON.stringify({ email, password })
    })

## 5. Standard user login

### 5.1 Browser flow

1. Open /login.
2. Enter the normalized account email and password.
3. Obtain a CSRF cookie.
4. Submit POST /api/auth/login.
5. The server applies the login rate limit.
6. The server loads the user from PostgreSQL.
7. The server verifies the password against the scrypt hash.
8. The server checks ACTIVE status and lock state.
9. The server clears the failed-login counter and records last_login_at.
10. The server creates a refresh-session row containing only the token hash.
11. The server returns the public user object without password_hash.
12. The server sets access, refresh, and CSRF cookies.
13. The browser redirects into the authenticated application.

### 5.2 Success verification

1. Request GET /api/auth/me with credentials included.
2. Expect HTTP 200.
3. Confirm the identity and role are correct.
4. Confirm mfaRequired and mfaAuthenticated have expected values.
5. Request a protected endpoint appropriate to the role.
6. Confirm cookies exist without exposing their values.
7. Confirm browser storage does not contain access or refresh tokens.

### 5.3 Failure handling

Expected responses:

- 403: CSRF validation failed.
- 401: invalid credentials, inactive account, or locked account.
- 429: login rate limit exceeded.
- 500: configuration or infrastructure failure; inspect logs and database
  connectivity instead of treating it as a bad password.

After the configured failed-login threshold, the account is locked for the
configured lock period. Unlock through the protected administrator operation;
do not manually edit password hashes or security fields.

## 6. Invitation-only account creation

Production signup is intended to be invitation-only. Public signup is disabled
when PUBLIC_SIGNUP_ENABLED=false.

### 6.1 Administrator creates an invitation

1. An authenticated administrator opens the invitation control.
2. The server requires ADMIN role and recent-MFA assurance.
3. The request passes CSRF and rate-limit checks.
4. The email is normalized and validated.
5. Duplicate active invitations are rejected.
6. A random invitation token is generated.
7. PostgreSQL stores only the token hash, recipient, role, expiry, and creator.
8. The invitation email is queued.
9. The action is written to the audit log.

Invitation tokens are single-use, expire, and may be revoked or resent. Resending
replaces the stored token hash. If a token is exposed, revoke it and issue a
new invitation.

### 6.2 Invitee validates and redeems

1. Open /signup/invite?token=<token>.
2. Obtain a CSRF cookie.
3. The browser calls POST /api/auth/invitations/validate.
4. The server checks the hashed token is unused, unrevoked, and unexpired.
5. The browser displays the invited email and assigned role.
6. Enter display name and a password of 12–200 characters.
7. Submit POST /api/auth/invitations/redeem with CSRF.
8. PostgreSQL locks and rechecks the invitation.
9. Email mismatch and existing accounts are rejected.
10. The user and used invitation are written transactionally.
11. An ADMIN invitation sets mfa_required=true.
12. The server creates a refresh session and sets cookies.
13. The redemption is audited.

## 7. Email verification

1. The application creates a random verification token.
2. PostgreSQL stores only its hash with a 24-hour expiry.
3. The email contains the token in the verification link.
4. Open /verify-email?token=<token>.
5. The page posts the token to POST /api/auth/email/verify.
6. The server hashes and locks the matching token row.
7. Used, missing, or expired tokens are rejected.
8. A valid token is marked used.
9. email_verified_at is set.
10. PENDING_VERIFICATION becomes ACTIVE.
11. email_verified is written to the audit log.

To resend for an authenticated user:

1. Send a CSRF-protected POST /api/auth/email/resend.
2. Previous unused verification tokens are invalidated.
3. A fresh 24-hour token is generated.
4. A replacement message is queued.
5. The action is rate-limited and audited.

The verification endpoint returns a safe failure result and must not disclose
unrelated account information.

## 8. Password recovery and reset

### 8.1 Request

1. Submit an email to the password-forgotten flow.
2. The server applies the password-forgotten rate limit.
3. The address is normalized.
4. If an account exists, a random 30-minute reset token is created.
5. Previous unused reset tokens are invalidated.
6. Only the new token hash is stored.
7. The reset email is queued and the request is audited.
8. The response remains neutral whether the account exists.

### 8.2 Complete

1. Open /reset-password?token=<token>.
2. Enter a password of 12–200 characters.
3. Submit POST /api/auth/password/reset.
4. The server hashes and locks the reset token.
5. The server verifies it is unused and unexpired.
6. A new scrypt password hash is stored.
7. password_hash_version and security_version are incremented.
8. Failed-login and lock state are cleared.
9. All reset tokens for the user are used.
10. All active refresh sessions for the user are revoked.
11. A password-changed message is queued.
12. password_reset_completed is audited.
13. The user must sign in again on every device.

## 9. Administrator bootstrap and first login

### 9.1 Bootstrap

Load the protected production environment first, then run in the approved
production environment:

    set -a
    . /etc/frankai-site.env
    set +a
    npm run admin:create -- --email <administrator-address>

Enter the password interactively. The command must:

1. Normalize the address.
2. Refuse to modify an existing user.
3. Create an ACTIVE ADMIN with mfa_required=true.
4. Record administrator bootstrap audit evidence.
5. Leave mfa_enrolled_at empty until enrollment succeeds.

The bootstrap CLI refuses to choose the file store implicitly. If it reports
that the administrator was created in the file store, stop: that account is not
present in the PostgreSQL database used by production. Do not set
AUTH_STORE=file for production.

### 9.2 First login

1. Open /admin/login.
2. Submit administrator email and password.
3. The server creates an access token with mfa=false.
4. The page calls GET /api/auth/me.
5. The page verifies role ADMIN.
6. A non-ADMIN result triggers logout and a generic error.
7. If MFA is required and not authenticated, redirect to /admin/mfa.
8. The password step alone must not grant protected administrator access.

## 10. Administrator MFA enrollment

1. Complete first administrator password login.
2. Open /admin/mfa.
3. The page calls GET /api/auth/me and checks mfaEnrolledAt.
4. Select Generate setup secret.
5. The browser sends CSRF-protected POST /api/admin/mfa/setup.
6. The server requires an authenticated administrator.
7. A random Base32 TOTP secret is generated.
8. The secret is encrypted and stored as pending.
9. A provisioning URI is returned.
10. Scan it using an approved authenticator application.
11. Enter the current six-digit code.
12. Submit CSRF-protected POST /api/admin/mfa/confirm.
13. The server verifies the code with the allowed time-step tolerance.
14. The secret is marked confirmed.
15. Previous recovery codes are deleted.
16. Ten new recovery codes are generated and hashed in PostgreSQL.
17. mfa_required and mfa_enrolled_at are set.
18. The current access token is upgraded with mfa=true.
19. Recovery codes are displayed once.
20. Store them offline and select I stored my recovery codes.

Never place provisioning URIs, manual secrets, or recovery codes in audit logs,
screenshots, tickets, or reports. Starting setup again replaces the pending
secret; do not generate a replacement casually after enrollment.

## 11. Administrator MFA login challenge

For an enrolled administrator:

1. Complete password login at /admin/login.
2. Confirm the page sees mfaRequired=true and mfaAuthenticated=false.
3. The page redirects to /admin/mfa.
4. Enter the current six-digit TOTP code.
5. Submit POST /api/admin/mfa/challenge with CSRF.
6. The server applies the MFA challenge rate limit.
7. The server decrypts the secret and verifies the code.
8. Success issues an access token with mfa=true.
9. Success is audited.
10. The browser returns to /admin.
11. Protected routes independently enforce the token and user state.

Invalid codes return 401. Excessive attempts return 429. Decryption,
database, or configuration failures are infrastructure failures and must not be
reported as ordinary invalid-code failures.

### Recovery-code login

1. Enter one unused recovery code.
2. Submit POST /api/admin/mfa/recovery with CSRF.
3. The server hashes the normalized code.
4. A matching unused code is atomically marked used.
5. Success issues an access token with mfa=true.
6. The browser returns to /admin.
7. Reusing the same code must fail.

## 12. Recent-MFA reauthentication

Sensitive routes use requireRecentAdmin.

1. The administrator starts a sensitive action.
2. The API verifies ordinary administrator authentication and MFA.
3. If no recent assurance exists, return 401 with
   error=RECENT_MFA_REQUIRED and reauthenticationRequired=true.
4. Ask for a TOTP or recovery code.
5. Submit POST /api/admin/reauth/challenge with CSRF.
6. The server verifies TOTP or consumes a recovery code.
7. A new mfa=true access token with a new token ID is created.
8. The token ID, user ID, method, and expiry are stored in
   admin_reauth_assurances.
9. The default recent assurance lifetime is normally 600 seconds.
10. The action is audited.
11. Retry the original mutation with the new cookie.
12. The route verifies token ID, user ID, and expiry before changing state.

Examples requiring recent MFA include user status/role changes, user deletion,
unlocking users, session revocation, MFA reset, invitation creation/revocation/
resend, and protected platform publishing.

## 13. Sessions and logout

### View sessions

1. Call GET /api/auth/sessions with the access cookie.
2. The server returns only the user's unrevoked, unexpired sessions.
3. The response identifies the current session but never exposes refresh tokens.

### Revoke one session

1. Select a non-current session.
2. Obtain the current CSRF token.
3. Send DELETE /api/auth/sessions/<id>.
4. The server confirms the session belongs to the user.
5. The row is revoked and session_revoked is audited.

### Logout

1. Obtain CSRF.
2. Send POST /api/auth/logout with cookies and X-CSRF-Token.
3. The current refresh session is revoked.
4. Access, refresh, and CSRF cookies are cleared.

### Logout everywhere

1. Send POST /api/auth/logout-all with authentication and CSRF.
2. All active refresh sessions for the user are revoked.
3. logout_all is audited.
4. The browser cookies are cleared.

A previously issued access JWT may remain cryptographically valid until it
expires unless the security version is changed. Refresh revocation prevents
continued renewal.

## 14. Rate limits and lockout

Current default rate-limit policy:

| Bucket | Limit | Window |
| --- | ---: | ---: |
| Login | 10 | 15 minutes |
| Administrator login | 10 | 15 minutes |
| Signup | 5 | 1 hour |
| Invitation validation | 20 | 15 minutes |
| Invitation redemption | 5 | 15 minutes |
| Refresh | 30 | 1 minute |
| Password forgot | 5 | 1 hour |
| Password reset | 5 | 15 minutes |
| Email resend | 5 | 1 hour |
| MFA challenge | 10 | 15 minutes |
| MFA recovery | 5 | 15 minutes |
| Sensitive admin action | 30 | 1 minute |
| General API | 120 | 1 minute |

Effective values are controlled by the deployed policy and environment. Use
isolated test identities; do not repeatedly retry a live account.

## 15. API verification matrix

Use a fresh cookie jar for each test and never print cookie contents.

### Public boundary

| Check | Expected |
| --- | --- |
| GET /login | 200 and sign-in UI |
| GET /admin/login | 200 and admin sign-in UI |
| GET /api/auth/csrf | 200 and CSRF cookie |
| GET /api/auth/me without access cookie | 401 |
| GET /api/admin/system without access cookie | 401 |
| POST /api/auth/login without matching CSRF | 403 |
| POST /api/admin/mfa/challenge without user | 401 |

### Invalid login

1. Obtain a CSRF cookie.
2. Submit a deliberately invalid test identity and password.
3. Expect 401 with a generic credential error.
4. Confirm no account-existence detail is disclosed.
5. Confirm no authenticated session is established.
6. Confirm no configuration error is logged.

### Valid user login

1. Use a controlled test user.
2. Obtain CSRF.
3. Submit correct credentials and expect 200.
4. Confirm GET /api/auth/me returns 200.
5. Confirm an appropriate protected endpoint returns 200.
6. Test POST /api/auth/refresh with CSRF and cookies.
7. Confirm the old refresh token is no longer accepted.
8. Log out and confirm /api/auth/me returns 401.

### MFA journey

1. Use a controlled administrator with no MFA enrollment.
2. Confirm password login redirects to /admin/mfa.
3. Generate a setup secret and confirm its TOTP code.
4. Confirm ten recovery codes are displayed once.
5. Log out and perform a fresh password login.
6. Confirm a second-factor screen appears.
7. Complete it with TOTP and confirm entry to /admin.
8. Repeat with one recovery code.
9. Confirm recovery-code reuse fails.
10. Confirm an invalid code returns 401.
11. Confirm audit evidence contains no secret material.

### Recent-MFA journey

1. Complete administrator password plus login MFA.
2. Attempt a sensitive action without reauthentication.
3. Expect RECENT_MFA_REQUIRED.
4. Complete /api/admin/reauth/challenge with TOTP.
5. Retry the action and confirm it succeeds if authorized.
6. Wait for assurance expiry in an isolated test.
7. Confirm the action again requires recent MFA.
8. Repeat with a recovery code and confirm it is consumed.

### Reset journey

1. Request a reset for a controlled test account.
2. Obtain the token from approved test mail capture.
3. Complete the reset with a compliant password.
4. Confirm old refresh sessions are revoked.
5. Confirm old credentials fail and new credentials work.
6. Confirm the reset token cannot be reused.
7. Verify malformed and expired tokens produce safe errors.

## 16. Deployment verification

After any authentication code or configuration change:

1. Run npm run lint.
2. Run npm test.
3. Run npm run build.
4. Confirm the standalone assets are prepared.
5. Restart only the intended service.
6. Confirm the service is active.
7. Confirm the running process has required non-secret settings and that JWT
   and MFA secrets are present without printing values.
8. Confirm PostgreSQL accepts the runtime role connection.
9. Run public-boundary and invalid-login smoke checks.
10. Run the controlled staging browser journey.
11. Inspect recent logs for auth configuration, JWT, cookie, or database errors.
12. Confirm the deployed build contains the current MFA challenge UI.

Staging checks:

    systemctl status frankai-site-staging.service --no-pager
    systemctl status frankai-site-staging-proxy.service --no-pager
    curl -k --resolve staging.localhost:8443:127.0.0.1 \
      https://staging.localhost:8443/login
    npm run test:browser

## 17. Troubleshooting

### Authentication is not configured

Check, without printing values:

1. JWT_ACCESS_SECRET exists and is at least 32 characters.
2. JWT_REFRESH_SECRET exists and is at least 32 characters.
3. AUTH_STORE=postgres.
4. AUTH_DATABASE_ENABLED=true.
5. DATABASE_URL is real and not a placeholder.
6. COOKIE_SECURE=true.
7. The service was restarted after the environment changed.

### Database resolution or connection error

1. Check for a literal placeholder in DATABASE_URL.
2. Check host and port from the service host.
3. Confirm PostgreSQL is running.
4. Confirm the runtime role can connect to the intended database.
5. Confirm migrations are applied.
6. Confirm runtime grants are present.
7. Confirm the service did not start before the environment file existed.

### Login returns 403

1. Obtain a new CSRF cookie.
2. Confirm the header exactly matches it.
3. Confirm credentials: include is set.
4. Confirm request Origin matches the application origin.
5. Do not disable CSRF protection to make a test pass.

### Known-good login returns 401

1. Confirm normalized email.
2. Confirm user status is ACTIVE.
3. Check locked_until and failed-login count.
4. Confirm the running service uses the same authoritative database where the
   account was created.
5. Confirm the runtime role can read users.
6. Check security and role versions.

### Administrator loops back to MFA

1. Confirm the TOTP code is from the correct account.
2. Confirm server and authenticator clocks are synchronized.
3. Confirm the secret is confirmed and decryptable.
4. Confirm secure cookies work over HTTPS.
5. Confirm /api/auth/me reports mfaAuthenticated=true after success.
6. Confirm the current MFA page is deployed.

### Sensitive action returns RECENT_MFA_REQUIRED

This is expected when ordinary login MFA succeeded but no valid recent-MFA
assurance exists. Complete /api/admin/reauth/challenge and retry.

### MFA is not configured

1. Confirm MFA_ENCRYPTION_KEY is exactly 64 hex characters.
2. Confirm MFA tables exist.
3. Confirm the runtime role has MFA table grants.
4. Confirm the secret belongs to the intended administrator.
5. Inspect logs without exposing encrypted values.

### Refresh returns 401

1. Confirm the refresh cookie is present and sent over HTTPS.
2. Confirm the session is present, unexpired, and unrevoked.
3. Check refresh reuse or token-family revocation.
4. Check whether logout-all or password reset revoked it.
5. Confirm the current CSRF token is sent.

## 18. Security handling

- Never log passwords, tokens, cookies, TOTP secrets, provisioning URIs, or
  recovery codes.
- Never request passwords or MFA codes through chat or email.
- Never paste protected environment files into tickets.
- Use a least-privileged runtime database role.
- Use isolated test identities and controlled mail capture.
- Revoke exposed invitation, reset, verification, or recovery credentials.
- Rotate compromised JWT or MFA keys under an approved incident procedure.
- Preserve unrelated worktree changes.
- Record audit evidence as safe event names, timestamps, status codes, and
  non-sensitive identifiers only.

## 19. Acceptance checklist

- [ ] Production auth settings are valid and non-placeholder.
- [ ] The running process loaded the settings after restart.
- [ ] PostgreSQL works with the least-privileged runtime role.
- [ ] All migrations are applied.
- [ ] Public unauthenticated routes return expected responses.
- [ ] CSRF mismatch returns 403.
- [ ] Invalid credentials return generic 401.
- [ ] Valid user login returns 200 and /api/auth/me returns the user.
- [ ] Access and refresh cookies are secure and absent from web storage.
- [ ] Refresh rotation works and old-token reuse is rejected.
- [ ] Logout revokes the current refresh session.
- [ ] Logout-all revokes all user refresh sessions.
- [ ] Invitation validation and redemption enforce expiry and one-use behavior.
- [ ] Email verification works and tokens cannot be reused.
- [ ] Password reset works and revokes old sessions.
- [ ] First administrator login requires MFA enrollment.
- [ ] TOTP enrollment protects recovery codes.
- [ ] Fresh administrator login requires TOTP or recovery code.
- [ ] Recovery codes are one-time use.
- [ ] Sensitive administrator routes require recent MFA.
- [ ] Rate limits and lockout behave as configured.
- [ ] Audit events contain no secret material.
- [ ] Staging browser acceptance passes.
- [ ] Recent logs contain no authentication configuration or database errors.
