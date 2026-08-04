# Security threat model

Credential stuffing/brute force: generic login errors, versioned scrypt password hashes, five-failure lockout, and per-process rate limiting; a shared limiter remains required before horizontal scaling. Account enumeration: signup returns a generic duplicate error; invitation/email workflows remain staged. JWT theft: short access TTL, `__Host-` cookies, CSRF/origin checks, and database-backed security/role versions. Refresh replay: hashed sessions rotate and revoke the family on reuse. CSRF/CORS: double-submit token plus same-origin checks. Privilege escalation/mass assignment: signed role plus authoritative database version checks; no client role is trusted.

Admin takeover: TOTP foundation, encrypted secret storage, one-time recovery hashes, MFA-gated admin endpoints, short access lifetime and audit events; enrollment and recovery UI/testing remain activation gates. OpenAI key disclosure: key remains server-side and voice issuance is disabled by default. Voice abuse/cost exhaustion and connection hijacking: database-backed pending/active records, concurrency checks and fail-closed configuration; atomic usage accounting and global circuit breaker remain required before enabling. Prompt injection/tool abuse: login is not tool authority; tool permissions are deny-all and must remain separate server-side checks. Transcript exposure: no retention by default. DoS, dependency compromise, reverse-proxy errors and insecure backups remain operational risks requiring shared rate limits, audits, patching, restricted ports and protected backups.
# Control-plane acceptance note

The primary residual threats for this phase are incomplete end-to-end evidence,
mail-provider configuration, restore ACL rehearsal, and the outstanding
Hostinger credential incident. Voice and provider credentials remain outside
the trust boundary while `VOICE_ENABLED=false`.

The authentication control plane now rejects unregistered or inactive email
templates and redacts nested audit secrets, token-bearing URLs, credentials,
headers, provisioning URIs, recovery codes, JWT-shaped values, and private-key
blocks. Final-administrator rejection auditing is observed in staging. Live
SMTP privileged outbox inspection and complete staging audit-category
observation remain acceptance evidence gates, not assumed properties of
renderer or unit tests.
