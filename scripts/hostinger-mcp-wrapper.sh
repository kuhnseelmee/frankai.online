#!/usr/bin/env bash
set -euo pipefail

service=${1:-}
case "$service" in
  hosting|domains|dns|billing|vps) ;;
  *)
    printf '%s\n' 'Usage: hostinger-mcp-wrapper.sh {hosting|domains|dns|billing|vps}' >&2
    exit 64
    ;;
esac

config_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/../docs" && pwd)
env_file="$config_dir/.env"
if [[ ! -r "$env_file" ]]; then
  printf '%s\n' 'Hostinger MCP configuration is missing docs/.env.' >&2
  exit 78
fi

api_key=$(sed -n 's/^HOSTINGER_MCP_API_KEY=//p' "$env_file")
if [[ -z "$api_key" ]]; then
  printf '%s\n' 'HOSTINGER_MCP_API_KEY is not configured.' >&2
  exit 78
fi

export HOSTINGER_API_TOKEN="$api_key"
exec npx --yes --package=hostinger-api-mcp@latest "hostinger-${service}-mcp"
