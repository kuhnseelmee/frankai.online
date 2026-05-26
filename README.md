# FrankAI Site

First-party website replacement for `frankai.online`.

## Purpose

This application replaces the generated Base44 landing page with an owned FrankAI site:

- One clear FrankAI identity with separate user, client and partner pathways.
- First-party assets and routes only.
- Real product proof through the deployed ServiceDesk and integration foundation.
- Privacy, terms, contact and start pages required for an owned public presence.

## Local runtime

```bash
npm install
npm run lint
npm run build
npm run dev
```

The staged production service runs on localhost port `4300`.

## Production build

The `systemd` deployment runs Next.js standalone output. After each production build, copy
the static and public assets into the standalone directory before restarting:

```bash
npm run build
mkdir -p .next/standalone/.next .next/standalone/public
cp -a .next/static .next/standalone/.next/
cp -a public/. .next/standalone/public/
systemctl restart frankai-site.service
```

## Staged cutover

The existing apex domain must not be changed until this replacement has been reviewed.

1. Create a Hostinger DNS record for a staging host such as `preview.frankai.online` pointing
   to the VPS public address.
2. Add a Caddy route for that staging hostname to `127.0.0.1:4300` and verify HTTPS/routes.
3. After approval, point `frankai.online` and `www.frankai.online` at the VPS and add their
   Caddy route.
4. Remove the obsolete Base44 domain/project association after traffic is confirmed on the
   first-party deployment.

`servicedesk.frankai.online` and `openwa.frankai.online` are independent existing services and
must remain unchanged during the landing-site cutover.
