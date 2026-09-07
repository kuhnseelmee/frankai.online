#!/bin/sh
set -eu

umask 077
secret_dir=/tmp/frankai-secrets
mkdir -p "$secret_dir"
chmod 0733 "$secret_dir"

copy_secret() {
  source_path=$1
  target_path=$2
  if [ -r "$source_path" ]; then
    setpriv --reuid=1000 --regid=1000 --init-groups sh -c 'umask 377; cat > "$1"' sh "$target_path" < "$source_path"
  fi
}

copy_secret /run/secrets/api_bearer_token "$secret_dir/api_bearer_token"
copy_secret /run/secrets/openai_api_key "$secret_dir/openai_api_key"
chmod 0711 "$secret_dir"

if [ -f "$secret_dir/api_bearer_token" ]; then
  export API_BEARER_TOKEN_FILE="$secret_dir/api_bearer_token"
  export ORCHESTRATOR_BEARER_TOKEN_FILE="$secret_dir/api_bearer_token"
fi
if [ -f "$secret_dir/openai_api_key" ]; then
  export ORCHESTRATOR_OPENAI_KEY_FILE="$secret_dir/openai_api_key"
fi

exec setpriv --reuid=1000 --regid=1000 --init-groups --bounding-set=-all -- "$@"
