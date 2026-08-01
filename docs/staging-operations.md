# FrankAI staging operations

Staging is isolated from production and is not a production cutover.

- Service: `frankai-site-staging.service`
- Application listener: `127.0.0.1:4500`
- Local TLS proxy: `frankai-site-staging-proxy.service`, `staging.localhost:8443`
- Database: `frankai_auth_staging`
- Migration role: `frankai_auth_staging_migrate`
- Runtime role: `frankai_auth_staging_app`
- Environment: `/etc/frankai-site-staging.env` (root-owned, mode 0600)
- Mail: local capture only; no external delivery is configured
- Voice: `VOICE_ENABLED=false`

The application listener is localhost-only. The current staging proxy listener
is `*:8443`; verify firewall policy before treating the proxy as externally
isolated. Browser checks use an explicit local DNS resolution and ignore the
local certificate warning. The production service on port 4300 and production
Caddy routing are not modified by staging operations.

The staging service must execute the root standalone server path
`/root/frankai-site/.next/standalone/server.js`. A restart was verified on
2026-08-01 after reconciling the stale nested path. The Caddyfile validates with
the systemd-declared `caddyfile` adapter.

Useful checks:

```bash
systemctl status frankai-site-staging.service --no-pager
systemctl status frankai-site-staging-proxy.service --no-pager
curl -k --resolve staging.localhost:8443:127.0.0.1 https://staging.localhost:8443/login
npm run test:browser
```

Do not place staging passwords, JWT secrets, MFA keys, or SMTP credentials in
the repository or test reports.
