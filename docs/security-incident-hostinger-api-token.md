# Hostinger API token incident

Status: `ROTATION_REQUIRED`.

The previous discovery output exposed a Hostinger API token. Repository remediation removed the assignment from the ignored local `.env`, removed the generated standalone `.env` copy, and found no tracked-source or Git-history assignment by name. This does **not** invalidate the credential. Only Hostinger-side rotation resolves the incident.

Manual action for Ray:

1. Sign in to Hostinger hPanel.
2. Open Account settings and the API section.
3. Revoke/delete the exposed token if the panel offers revocation.
4. Create a new token with a short expiry and the minimum required scope.
5. Update only the intended root-readable service secret file if an integration still needs it; keep mode `0600` and never put it in the repository.
6. Restart only the dependent service after review.
7. Verify the old token is rejected and the new integration works without printing either value.

Hostinger documents token creation under hPanel Account settings → API and notes that a token is not shown again after refresh: https://support.hostinger.com/en/articles/10840865-what-is-hostinger-api.
