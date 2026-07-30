CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL,
  email_normalized text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text NOT NULL,
  password_hash_version integer NOT NULL DEFAULT 1,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  role_version integer NOT NULL DEFAULT 1,
  security_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED', 'LOCKED', 'PENDING_VERIFICATION')),
  email_verified_at timestamptz,
  failed_login_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  password_changed_at timestamptz NOT NULL DEFAULT now(),
  mfa_required boolean NOT NULL DEFAULT false,
  mfa_enrolled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_idx ON users (lower(email_normalized));

CREATE TABLE IF NOT EXISTS refresh_sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  token_family text NOT NULL,
  parent_session_id text REFERENCES refresh_sessions(id),
  replaced_by_session_id text REFERENCES refresh_sessions(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revocation_reason text,
  user_agent_summary text,
  ip_metadata_or_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS refresh_sessions_user_idx ON refresh_sessions(user_id);
CREATE INDEX IF NOT EXISTS refresh_sessions_family_idx ON refresh_sessions(token_family);

CREATE TABLE IF NOT EXISTS invitations (
  id text PRIMARY KEY,
  email_normalized text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  created_by text REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id text PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id text REFERENCES users(id) ON DELETE SET NULL,
  actor_role text,
  action text NOT NULL,
  target_type text,
  target_id text,
  result text NOT NULL,
  request_id text,
  source_metadata text,
  user_agent_summary text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS audit_events_occurred_idx ON audit_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_actor_idx ON audit_events(actor_user_id);

CREATE TABLE IF NOT EXISTS ai_configuration_versions (
  id text PRIMARY KEY,
  version integer NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT', 'VALIDATED', 'ACTIVE', 'REJECTED', 'SUPERSEDED')),
  provider text NOT NULL DEFAULT 'openai',
  realtime_model text NOT NULL,
  fallback_model text,
  voice text NOT NULL,
  instructions text NOT NULL,
  turn_detection_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_max_seconds integer NOT NULL,
  idle_timeout_seconds integer NOT NULL,
  daily_user_limit integer NOT NULL,
  monthly_user_limit integer NOT NULL,
  concurrent_user_limit integer NOT NULL,
  global_concurrent_limit integer NOT NULL,
  transcript_retention_enabled boolean NOT NULL DEFAULT false,
  safety_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  tool_policy_reference text NOT NULL DEFAULT 'deny-all',
  created_by text REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  activated_at timestamptz,
  superseded_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS active_ai_config_idx ON ai_configuration_versions(status) WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS voice_sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'ENDED', 'EXPIRED', 'REJECTED')),
  provider text NOT NULL DEFAULT 'openai',
  model text,
  voice text,
  created_at timestamptz NOT NULL DEFAULT now(),
  connected_at timestamptz,
  ended_at timestamptz,
  expires_at timestamptz NOT NULL,
  last_activity_at timestamptz,
  duration_seconds integer NOT NULL DEFAULT 0,
  input_audio_seconds integer NOT NULL DEFAULT 0,
  output_audio_seconds integer NOT NULL DEFAULT 0,
  estimated_usage numeric(12,4) NOT NULL DEFAULT 0,
  termination_reason text,
  provider_session_reference text,
  configuration_version_id text REFERENCES ai_configuration_versions(id)
);
CREATE INDEX IF NOT EXISTS voice_sessions_user_active_idx ON voice_sessions(user_id, status);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
