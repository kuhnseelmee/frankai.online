# Hostinger MCP setup

This project defines five local MCP servers in the repository-root
`.mcp.json`:

```text
hostinger-hosting
hostinger-domains
hostinger-dns
hostinger-billing
hostinger-vps
```

Each server launches through `scripts/hostinger-mcp-wrapper.sh`. The wrapper:

1. Reads `docs/.env` at process start.
2. Reads only `HOSTINGER_MCP_API_KEY`.
3. Passes it to the package as `HOSTINGER_API_TOKEN`.
4. Starts the corresponding `hostinger-api-mcp@latest` server through `npx`.

The key is not stored in `.mcp.json`, source control, the API reference, or
this document. `docs/.env` must remain mode `0600` and must never be committed.

The API reference is `docs/api-1.json` and is documentation only; it is not
loaded as runtime configuration.

After adding or changing the MCP configuration, reload the MCP-capable client
or start a new session. The current Codex session does not dynamically acquire
new MCP connectors.

Before using write-capable Hostinger operations, verify the target resource and
requested change. DNS, billing, domain, VPS, and hosting mutations require an
explicitly identified target and change objective.
