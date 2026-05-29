#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="${SERVICE_NAME:-frankai-site.service}"
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:4300}"
READINESS_BASE_URL="${READINESS_BASE_URL:-https://frankai.online}"
READINESS_ENV_FILE="${READINESS_ENV_FILE:-/etc/frankai-site.env}"

cd "$(dirname "$0")/.."

echo "Running lint..."
npm run lint

echo "Building standalone application..."
npm run build

echo "Restarting ${SERVICE_NAME}..."
systemctl restart "${SERVICE_NAME}"

echo "Waiting for ${LOCAL_URL}..."
for attempt in {1..20}; do
  if curl --silent --show-error --fail --max-time 5 "${LOCAL_URL}" >/dev/null; then
    break
  fi

  if [[ "${attempt}" == "20" ]]; then
    echo "${SERVICE_NAME} did not become reachable at ${LOCAL_URL}" >&2
    systemctl status "${SERVICE_NAME}" --no-pager >&2 || true
    exit 1
  fi

  sleep 1
done

echo "Running live readiness check against ${READINESS_BASE_URL}..."
READINESS_BASE_URL="${READINESS_BASE_URL}" READINESS_ENV_FILE="${READINESS_ENV_FILE}" npm run readiness

echo "Deployment verified."
