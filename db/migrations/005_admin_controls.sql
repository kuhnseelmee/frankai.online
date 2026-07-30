ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required boolean NOT NULL DEFAULT false;
GRANT DELETE ON TABLE users TO frankai_auth_app;
CREATE INDEX IF NOT EXISTS users_admin_status_idx ON users(role, status, email_verified_at, mfa_enrolled_at);
