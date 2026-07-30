# Administration operations

Administrator access uses the password flow, PostgreSQL role/security-version checks, CSRF protection, and a signed `ADMIN` cookie. TOTP MFA is required for administrators; the first password-authenticated admin must enroll through `/admin/mfa` before `/admin` or sensitive APIs are allowed. Recovery codes are returned once and stored only as hashes. The platform console accepts only the signed admin cookie and CSRF token; static Basic/Bearer administration tokens are not supported.

Required operational controls before enabling production admin use: provision long random JWT secrets, create the first admin through a secure CLI, enroll MFA, and verify audit file permissions. Never place OpenAI credentials in admin responses.
# PostgreSQL administrator boundary

New administrator operations require an active PostgreSQL-backed administrator
session with completed MFA. Sensitive changes require recent MFA assurance and
are audited. The final recoverable administrator is protected transactionally
with a PostgreSQL advisory lock. Static application Basic/Bearer tokens are not
an authentication path in the new control plane; infrastructure-level staging
protection is a separate concern.
