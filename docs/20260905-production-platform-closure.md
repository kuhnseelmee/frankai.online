# FrankAI production platform closure - 2026-09-05

Status: `PRODUCTION_DEPLOYED_VERIFIED`

Ray gave complete authority to bring the agreed FrankAI platform recommendations
to completion in the WhatsApp direct conversation at 2026-09-05 22:45 AEST.

## Actions completed

- Rechecked the active `/root/frankai-site` repository and preserved the
  existing dirty working tree rather than reverting prior platform work.
- Re-evaluated the dependency blocker with `npm audit --omit=dev`.
- Updated the Fastify production dependency from `^5.11.2` to `^5.12.3`.
- Ran `npm audit fix`, which refreshed the lockfile to patched transitive
  packages, including `fast-uri`.
- Ran the guarded production deployment script:
  `READINESS_BASE_URL=https://frankai.online READINESS_ENV_FILE=/etc/frankai-site.env npm run deploy:production`.
- Restarted `frankai-site.service` through the guarded deployment path.

## Verification

Passed:

- `npm audit --omit=dev` - 0 vulnerabilities.
- `npm run lint` - 0 errors, 6 existing Next.js navigation warnings.
- `npm test` - 8 passed, 0 failed.
- `npm run test:vertical-slice` - 8 passed, 0 failed.
- `npm run build` - Next.js standalone build succeeded.
- `npm run deploy:production` - lint, build, restart, live readiness.
- `READINESS_BASE_URL=http://127.0.0.1:4300 READINESS_ENV_FILE=/etc/frankai-site.env npm run readiness` - local readiness passed.
- `READINESS_BASE_URL=https://frankai.online READINESS_ENV_FILE=/etc/frankai-site.env npm run readiness` - public readiness passed.
- `caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile` - valid.

Runtime after deployment:

```text
Service: frankai-site.service
MainPID: 2899288
Started: 2026-09-05 22:48:35 AEST
Working directory: /root/frankai-site/.next/standalone
Local health: 200
Public health: 200
Next.js: 16.3.0
```

Patched runtime dependency versions:

```text
fastify: 5.12.3
fast-uri: 3.1.7
fast-json-stringify nested fast-uri: 4.1.4
next: 16.3.0
postcss: 8.5.23
sharp: 0.35.3
```

## Remaining notes

- `gitleaks` is not installed on this host at the time of this closure, so a
  fresh Gitleaks scan was not run.
- The lint warnings are existing `location.href` warnings in auth/voice pages;
  they are warnings, not deployment blockers.
- Production SMTP remains a separate provider-readiness track unless Ray
  authorizes and supplies protected provider evidence/credentials for that
  workflow.
