# Hostinger credential rotation checklist

Operator: Ray. Do not record token values in this repository or evidence.

- [ ] Old Hostinger token revoked
- [ ] Replacement created only if required
- [ ] Old token no longer authenticates
- [ ] Rotation date recorded
- [ ] Replacement stored outside Git

Final incident status must be exactly one of:

```text
ROTATION_CONFIRMED
ROTATION_REQUIRED
UNABLE_TO_VERIFY
```

Operator confirmation recorded 2026-08-01: Ray confirmed the old
`HOSTINGER-API-TOKEN` was deleted provider-side.

Current status: `ROTATION_CONFIRMED`.
