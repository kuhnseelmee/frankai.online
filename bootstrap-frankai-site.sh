#!/usr/bin/env bash
# Bootstrap the recommended production layout for frankai.online AI agents.
# Safe to rerun: existing files are preserved unless --force is supplied.

set -Eeuo pipefail
IFS=$'\n\t'
umask 027

ROOT_DIR="/root/frankai-site"
OWNER="root"
GROUP="root"
FORCE=0
DRY_RUN=0

usage() {
  printf '%s\n' "Usage: sudo $0 [options]"
  printf '%s\n' ""
  printf '%s\n' "Options:"
  printf '%s\n' "  --root PATH     Installation root (default: /root/frankai-site)"
  printf '%s\n' "  --owner USER    File owner (default: root)"
  printf '%s\n' "  --group GROUP   File group (default: root)"
  printf '%s\n' "  --force         Replace scaffold files (never secrets or runtime data)"
  printf '%s\n' "  --dry-run       Print actions without changing the filesystem"
  printf '%s\n' "  -h, --help      Show this help"
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

while (($#)); do
  case "$1" in
    --root)
      (($# >= 2)) || die "--root requires a path"
      ROOT_DIR="$2"
      shift 2
      ;;
    --owner)
      (($# >= 2)) || die "--owner requires a user"
      OWNER="$2"
      shift 2
      ;;
    --group)
      (($# >= 2)) || die "--group requires a group"
      GROUP="$2"
      shift 2
      ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1" ;;
  esac
done

[[ "$ROOT_DIR" = /* ]] || die "--root must be an absolute path"
[[ "$ROOT_DIR" != "/" ]] || die "Refusing to use / as the installation root"
[[ "$ROOT_DIR" != "/root" ]] || die "Refusing to use /root as the installation root"
if [[ $EUID -ne 0 && "$ROOT_DIR" == /root/* ]]; then
  die "Run as root to create $ROOT_DIR"
fi
getent passwd "$OWNER" >/dev/null || die "User does not exist: $OWNER"
getent group "$GROUP" >/dev/null || die "Group does not exist: $GROUP"

run() {
  if ((DRY_RUN)); then
    printf 'DRY-RUN:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

make_dir() {
  local mode="$1" path="$2"
  run install -d -m "$mode" -o "$OWNER" -g "$GROUP" "$path"
}

write_file() {
  local relative_path="$1" mode="$2"
  local destination="$ROOT_DIR/$relative_path"
  local temporary

  if [[ -e "$destination" && $FORCE -eq 0 ]]; then
    printf 'PRESERVE: %s\n' "$destination"
    return 0
  fi
  if ((DRY_RUN)); then
    printf 'DRY-RUN: write %s (mode %s)\n' "$destination" "$mode"
    return 0
  fi

  temporary="$(mktemp)"
  trap 'rm -f "${temporary:-}"' RETURN
  printf '%s' "$(< /dev/stdin)" >"$temporary"
  install -m "$mode" -o "$OWNER" -g "$GROUP" "$temporary" "$destination"
  rm -f "$temporary"
  trap - RETURN
}

printf 'Creating frankai.online scaffold at %s\n' "$ROOT_DIR"

# Source-controlled application and platform directories.
for directory in \
  apps/web/public \
  apps/web/src \
  services/api/src \
  services/orchestrator/src \
  services/workers/src \
  agents/research/src \
  agents/property/src \
  agents/content/src \
  agents/automation/src \
  packages/agent-core/src \
  packages/config/src \
  packages/contracts/src \
  packages/observability/src \
  packages/prompts \
  packages/tools/src \
  config/agents \
  config/environments \
  infrastructure/docker \
  infrastructure/nginx \
  infrastructure/systemd \
  scripts \
  docs/architecture \
  docs/runbooks \
  tests/integration \
  tests/e2e; do
  make_dir 0750 "$ROOT_DIR/$directory"
done

# Mutable VPS state: excluded from Git and permissioned independently.
for directory in \
  data/postgres \
  data/redis \
  data/vector \
  data/uploads \
  logs/api \
  logs/agents \
  logs/nginx \
  backups \
  run; do
  make_dir 0750 "$ROOT_DIR/$directory"
done
make_dir 0700 "$ROOT_DIR/secrets"

write_file ".gitignore" 0640 <<'EOF'
.env
.env.*
!.env.example
secrets/*
!secrets/.gitkeep
data/*
!data/.gitkeep
logs/*
!logs/.gitkeep
run/*
!run/.gitkeep
backups/*
!backups/.gitkeep
node_modules/
dist/
build/
coverage/
*.log
EOF

write_file ".env.example" 0640 <<'EOF'
APP_ENV=production
DOMAIN=frankai.online
API_PORT=8080
LOG_LEVEL=info
POSTGRES_DB=frankai
POSTGRES_USER=frankai
POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
DATABASE_URL=postgresql://frankai@postgres:5432/frankai
REDIS_URL=redis://redis:6379/0
VECTOR_URL=http://vector:6333
OPENAI_API_KEY_FILE=/run/secrets/openai_api_key
EOF

write_file "README.md" 0640 <<'EOF'
# frankai.online

Production-oriented monorepo for Frank AI agents.

## Boundaries

- `apps/`: user-facing applications.
- `services/`: API edge, orchestration, and background execution.
- `agents/`: domain-agent implementations; keep agent logic thin and composable.
- `packages/`: shared contracts, runtime primitives, prompts, tools, and telemetry.
- `config/`: declarative agent and environment configuration; no secrets.
- `infrastructure/`: Docker, reverse-proxy, and service-manager definitions.
- `data/`, `logs/`, `backups/`, `run/`: mutable VPS state; never commit.
- `secrets/`: secret files with mode 0700; never commit or bake into images.

## First deployment

1. Copy `.env.example` to `.env` and set non-secret configuration.
2. Put each secret in its own file under `secrets/` and set mode 0600.
3. Replace the scaffold image names in `compose.yaml` with pinned application images.
4. Validate with `docker compose config`, then run `docker compose up -d`.
5. Configure TLS at the reverse proxy before exposing the API publicly.
EOF

write_file "compose.yaml" 0640 <<'EOF'
name: frankai

services:
  api:
    image: ghcr.io/replace-me/frankai-api:latest
    restart: unless-stopped
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks: [edge, internal]
    expose: ["8080"]

  orchestrator:
    image: ghcr.io/replace-me/frankai-orchestrator:latest
    restart: unless-stopped
    env_file: .env
    depends_on: [postgres, redis]
    networks: [internal]

  worker:
    image: ghcr.io/replace-me/frankai-worker:latest
    restart: unless-stopped
    env_file: .env
    depends_on: [postgres, redis]
    networks: [internal]

  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-frankai}
      POSTGRES_USER: ${POSTGRES_USER:-frankai}
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets: [postgres_password]
    volumes: [./data/postgres:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [internal]

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes: [./data/redis:/data]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks: [internal]

networks:
  edge: {}
  internal:
    internal: true

secrets:
  postgres_password:
    file: ./secrets/postgres_password
EOF

write_file "infrastructure/nginx/frankai.online.conf" 0640 <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name frankai.online www.frankai.online;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    location / {
        root /root/frankai-site/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }
}
EOF

write_file "config/agents/README.md" 0640 <<'EOF'
# Agent configuration

Keep one reviewed configuration file per agent. Define its model policy, tools,
timeouts, token budget, guardrails, and hand-off targets here. Never store API
keys, passwords, tokens, private user data, or raw prompt transcripts in Git.
EOF

write_file "infrastructure/systemd/frankai.service" 0640 <<'EOF'
[Unit]
Description=frankai.online container stack
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/frankai-site
ExecStart=/usr/bin/docker compose up -d --remove-orphans
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

write_file "Makefile" 0640 <<'EOF'
.PHONY: config up down logs ps

config:
	docker compose config
up:
	docker compose up -d --remove-orphans
down:
	docker compose down
logs:
	docker compose logs -f --tail=200
ps:
	docker compose ps
EOF

# Retain otherwise-empty state directories without tracking their contents.
for marker in data/.gitkeep logs/.gitkeep backups/.gitkeep run/.gitkeep secrets/.gitkeep; do
  write_file "$marker" 0600 </dev/null
done

if ((DRY_RUN == 0)); then
  chown -R "$OWNER:$GROUP" "$ROOT_DIR"
fi

printf '%s\n' ""
printf 'Scaffold complete: %s\n' "$ROOT_DIR"
printf '%s\n' "Next: review README.md, create secret files, pin image versions, and configure TLS."
