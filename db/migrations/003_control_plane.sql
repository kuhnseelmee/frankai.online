CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  count integer NOT NULL,
  window_started_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limit_buckets_expiry_idx ON rate_limit_buckets(expires_at);

CREATE TABLE IF NOT EXISTS email_outbox (
  id text PRIMARY KEY,
  recipient text NOT NULL,
  template text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','FAILED')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_outbox_pending_idx ON email_outbox(status, available_at);

CREATE TABLE IF NOT EXISTS admin_reauth_assurances (
  jti text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method text NOT NULL,
  authenticated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_reauth_expiry_idx ON admin_reauth_assurances(expires_at);

ALTER TABLE refresh_sessions ADD COLUMN IF NOT EXISTS revoked_reason text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS last_sent_at timestamptz;
