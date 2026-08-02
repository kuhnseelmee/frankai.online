export type AuditCoverage = 'CODE_PATH_PRESENT' | 'AUTOMATED_TESTED' | 'BROWSER_TESTED' | 'STAGING_EVENT_OBSERVED' | 'REDACTION_VERIFIED' | 'NOT_APPLICABLE'

export type AuditRegistryEntry = {
  id: string
  aliases: readonly string[]
  sourceAction: string
  successFailure: readonly string[]
  actor: 'required' | 'optional'
  target: 'required' | 'optional'
  requestId: 'required'
  severity: 'info' | 'warning' | 'high'
  retention: 'security' | 'operational'
}

const entry = (id: string, sourceAction = id.toLowerCase(), aliases: readonly string[] = [], actor: AuditRegistryEntry['actor'] = 'optional', target: AuditRegistryEntry['target'] = 'optional', severity: AuditRegistryEntry['severity'] = 'info'): AuditRegistryEntry => ({ id, aliases, sourceAction, successFailure: ['success', 'failure', 'rejected'], actor, target, requestId: 'required', severity, retention: severity === 'info' ? 'operational' : 'security' })

export const AUDIT_EVENT_REGISTRY: readonly AuditRegistryEntry[] = [
  entry('AUTH_LOGIN_SUCCEEDED', 'login', [], 'optional', 'optional'), entry('AUTH_LOGIN_FAILED', 'login', [], 'optional', 'optional', 'warning'),
  entry('AUTH_ACCOUNT_LOCKED', 'account_locked', [], 'optional', 'required', 'warning'), entry('AUTH_ACCOUNT_UNLOCKED', 'account_unlocked', [], 'required', 'required'),
  entry('AUTH_REFRESH_ROTATED', 'refresh_rotated', [], 'required', 'required'), entry('AUTH_REFRESH_REPLAY_REJECTED', 'refresh_replay_rejected', ['refresh_reuse_or_invalid', 'refresh_concurrent_rejected'], 'optional', 'required', 'high'),
  entry('AUTH_LOGOUT', 'logout', [], 'required'), entry('AUTH_LOGOUT_ALL', 'logout_all', [], 'required'), entry('AUTH_SESSION_REVOKED', 'session_revoked', [], 'required', 'required'),
  entry('INVITATION_CREATED', 'invitation_created', ['admin_invitation_created'], 'required', 'required'), entry('INVITATION_RESENT', 'invitation_resent', [], 'required', 'required'), entry('INVITATION_REVOKED', 'invitation_revoked', [], 'required', 'required'), entry('INVITATION_REDEEMED', 'invitation_redeemed', [], 'required', 'required'), entry('INVITATION_REDEMPTION_REJECTED', 'invitation_redemption_rejected', [], 'optional', 'optional', 'warning'),
  entry('EMAIL_VERIFICATION_ISSUED', 'email_verification_issued', [], 'required', 'required'), entry('EMAIL_VERIFICATION_RESENT', 'email_verification_resent', [], 'required', 'required'), entry('EMAIL_VERIFICATION_COMPLETED', 'email_verified', [], 'required', 'required'), entry('EMAIL_VERIFICATION_REJECTED', 'email_verification_rejected', [], 'optional', 'optional', 'warning'),
  entry('PASSWORD_RESET_REQUESTED', 'password_reset_requested', [], 'optional', 'required'), entry('PASSWORD_RESET_COMPLETED', 'password_reset_completed', [], 'required', 'required'), entry('PASSWORD_RESET_REJECTED', 'password_reset_rejected', [], 'optional', 'optional', 'warning'),
  entry('MFA_SETUP_STARTED', 'admin_mfa_setup', [], 'required', 'required'), entry('MFA_ENROLLMENT_COMPLETED', 'admin_mfa_enrolled', [], 'required', 'required'), entry('MFA_CHALLENGE_FAILED', 'mfa_challenge', [], 'optional', 'optional', 'warning'), entry('MFA_CHALLENGE_SUCCEEDED', 'admin_mfa_challenge', [], 'required', 'required'), entry('MFA_RECOVERY_USED', 'admin_mfa_recovery_used', [], 'required', 'required'), entry('MFA_RECOVERY_REJECTED', 'mfa_recovery_rejected', [], 'optional', 'optional', 'warning'), entry('MFA_RECOVERY_CODES_REGENERATED', 'mfa_recovery_codes_regenerated', [], 'required', 'required'), entry('MFA_RESET', 'admin_mfa_reset', [], 'required', 'required', 'high'),
  entry('ADMIN_REAUTH_FAILED', 'admin_reauth', [], 'required', 'optional', 'warning'), entry('ADMIN_REAUTH_SUCCEEDED', 'admin_reauth', [], 'required', 'optional'), entry('ADMIN_ROLE_CHANGED', 'admin_user_changed', [], 'required', 'required', 'high'), entry('ADMIN_STATUS_CHANGED', 'admin_user_changed', [], 'required', 'required', 'high'), entry('ADMIN_FINAL_ADMIN_ACTION_REJECTED', 'admin_final_admin_action_rejected', [], 'required', 'required', 'high'), entry('ADMIN_SESSIONS_REVOKED', 'admin_sessions_revoked', ['admin_revocation'], 'required', 'required', 'high'),
  entry('EMAIL_DELIVERY_SUCCEEDED', 'email_delivery_succeeded', [], 'optional', 'required'), entry('EMAIL_DELIVERY_FAILED', 'email_delivery_failed', [], 'optional', 'required', 'warning'), entry('RATE_LIMIT_REJECTED', 'rate_limit_rejected', [], 'optional', 'optional', 'warning'), entry('STATIC_AUTH_REJECTED', 'static_auth_rejected', [], 'optional', 'optional', 'warning'), entry('VOICE_DISABLED_REQUEST_REJECTED', 'voice_disabled_request_rejected', [], 'optional', 'optional', 'warning'),
  entry('SIGNUP_COMPLETED', 'signup', [], 'optional', 'required'), entry('ADMIN_USER_DELETED', 'admin_user_deleted', [], 'required', 'required', 'high'), entry('ADMIN_USER_UNLOCKED', 'admin_user_unlocked', [], 'required', 'required'), entry('ADMIN_BOOTSTRAP', 'admin_bootstrap', [], 'optional', 'required', 'high'), entry('VOICE_SESSION', 'voice_session', [], 'optional', 'optional', 'warning')
]

const byAction = new Map(AUDIT_EVENT_REGISTRY.flatMap(item => [item, ...item.aliases.map(alias => ({ ...item, sourceAction: alias }))].map(item => [item.sourceAction, item])))
export function auditDefinition(action: string) { return byAction.get(action) }
export function auditRegistryIds() { return AUDIT_EVENT_REGISTRY.map(item => item.id) }
