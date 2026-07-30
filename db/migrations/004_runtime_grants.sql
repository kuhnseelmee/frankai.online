-- Runtime grants are deliberately explicit. The application role must never
-- be able to alter schema or migration history.
REVOKE ALL PRIVILEGES ON TABLE schema_migrations FROM frankai_auth_app;
REVOKE ALL PRIVILEGES ON TABLE ai_configuration_versions FROM frankai_auth_app;
REVOKE ALL PRIVILEGES ON TABLE voice_sessions FROM frankai_auth_app;

GRANT SELECT, INSERT, UPDATE ON TABLE users TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE ON TABLE refresh_sessions TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE ON TABLE invitations TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE ON TABLE verification_tokens TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE ON TABLE password_reset_tokens TO frankai_auth_app;
GRANT SELECT, INSERT ON TABLE audit_events TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE admin_mfa_secrets TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE mfa_recovery_codes TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE rate_limit_buckets TO frankai_auth_app;
GRANT SELECT, INSERT, UPDATE ON TABLE email_outbox TO frankai_auth_app;
GRANT SELECT, INSERT, DELETE ON TABLE admin_reauth_assurances TO frankai_auth_app;

REVOKE CREATE ON SCHEMA public FROM frankai_auth_app;
