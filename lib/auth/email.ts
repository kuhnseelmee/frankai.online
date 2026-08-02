import { randomUUID } from 'node:crypto'
import nodemailer from 'nodemailer'
import { authDb } from './postgres'
import { audit } from './store'

export type EmailTemplate = 'invitation' | 'email_verification' | 'password_reset' | 'password_changed' | 'admin_security_alert' | 'mfa_disabled' | 'new_login'
type Payload = Record<string, unknown>
export type EmailTemplateClassification = 'ACTIVE_TRIGGERED' | 'ACTIVE_MISSING_TRIGGER' | 'INACTIVE_RESERVED' | 'DEPRECATED' | 'UNREFERENCED'
export const EMAIL_TEMPLATE_REGISTRY = [
  { identifier: 'INVITATION', name: 'invitation', classification: 'ACTIVE_TRIGGERED', trigger: 'invitation_created or invitation_resent', recipient: 'invitee', actionUrl: true, tokenBearing: true, securitySensitivity: 'high', auditEvent: 'INVITATION_CREATED/RESENT', retry: 'one bounded retry; operator-visible failure', browserAcceptance: true },
  { identifier: 'EMAIL_VERIFICATION', name: 'email_verification', classification: 'ACTIVE_TRIGGERED', trigger: 'email_verification_resend', recipient: 'authenticated unverified user', actionUrl: true, tokenBearing: true, securitySensitivity: 'high', auditEvent: 'EMAIL_VERIFICATION_RESENT', retry: 'one bounded retry; operator-visible failure', browserAcceptance: true },
  { identifier: 'PASSWORD_RESET', name: 'password_reset', classification: 'ACTIVE_TRIGGERED', trigger: 'password_reset_requested', recipient: 'known account email', actionUrl: true, tokenBearing: true, securitySensitivity: 'critical', auditEvent: 'PASSWORD_RESET_REQUESTED', retry: 'one bounded retry; operator-visible failure', browserAcceptance: true },
  { identifier: 'PASSWORD_CHANGED', name: 'password_changed', classification: 'ACTIVE_TRIGGERED', trigger: 'password_reset_completed', recipient: 'account email', actionUrl: false, tokenBearing: false, securitySensitivity: 'high', auditEvent: 'PASSWORD_RESET_COMPLETED', retry: 'one bounded retry; operator-visible failure', browserAcceptance: true },
  { identifier: 'MFA_DISABLED', name: 'mfa_disabled', classification: 'INACTIVE_RESERVED', trigger: null, recipient: 'undefined', actionUrl: false, tokenBearing: false, securitySensitivity: 'high', auditEvent: 'future MFA disable event', retry: 'undefined until activation', browserAcceptance: false },
  { identifier: 'ADMIN_SECURITY_ALERT', name: 'admin_security_alert', classification: 'INACTIVE_RESERVED', trigger: null, recipient: 'undefined', actionUrl: false, tokenBearing: false, securitySensitivity: 'high', auditEvent: 'future protected mutation event', retry: 'undefined until activation', browserAcceptance: false },
  { identifier: 'NEW_LOGIN', name: 'new_login', classification: 'INACTIVE_RESERVED', trigger: null, recipient: 'undefined', actionUrl: false, tokenBearing: false, securitySensitivity: 'high', auditEvent: 'future new-device policy', retry: 'undefined until activation', browserAcceptance: false }
] as const
export function emailTemplateDefinition(name: string) { return EMAIL_TEMPLATE_REGISTRY.find(item => item.name === name) }

function template(template: EmailTemplate, payload: Payload) {
  const token = typeof payload.token === 'string' ? payload.token : ''
  const base = process.env.APP_BASE_URL || process.env.JWT_ISSUER || 'https://frankai.online'
  if (process.env.STAGING_E2E === 'true' && new URL(base).hostname !== 'staging.localhost') throw new Error('Staging email action URL must use staging.localhost')
  const links: Record<string, string> = { invitation: `${base}/signup/invite?token=${encodeURIComponent(token)}`, email_verification: `${base}/verify-email?token=${encodeURIComponent(token)}`, password_reset: `${base}/reset-password?token=${encodeURIComponent(token)}` }
  const link = links[template]
  const subjects: Record<EmailTemplate, string> = { invitation: 'Your FrankAI invitation', email_verification: 'Verify your FrankAI email', password_reset: 'Reset your FrankAI password', password_changed: 'Your FrankAI password changed', admin_security_alert: 'FrankAI administrator security alert', mfa_disabled: 'FrankAI MFA was reset', new_login: 'New FrankAI login' }
  const text = link ? `${subjects[template]}\n\nContinue here: ${link}\n\nIf you did not request this, contact an administrator.` : `${subjects[template]}\n\nIf you did not request this, contact an administrator.`
  return { subject: subjects[template], text }
}

function transport() {
  const port = Number(process.env.SMTP_PORT || 587)
  return nodemailer.createTransport({ host: process.env.SMTP_HOST || '127.0.0.1', port, secure: process.env.SMTP_SECURE === 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || '' } : undefined })
}

export async function queueEmail(recipient: string, templateName: EmailTemplate, payload: Payload) {
  const definition = emailTemplateDefinition(templateName)
  if (!definition) throw new Error('Unregistered email template')
  if (definition.classification !== 'ACTIVE_TRIGGERED') throw new Error('Inactive email template cannot be dispatched')
  if (!recipient || !/^\S+@\S+\.\S+$/.test(recipient)) throw new Error('Email recipient is required')
  if (definition.actionUrl && typeof payload.token !== 'string') throw new Error('Token-bearing email requires an action token')
  if (process.env.EMAIL_ENABLED !== 'true') return { queued: false, provider: 'disabled' }
  const provider = process.env.EMAIL_PROVIDER || 'smtp'
  if (!['smtp', 'log', 'capture'].includes(provider)) throw new Error('Unsupported email provider')
  const id = randomUUID()
  const safePayload = Object.fromEntries(Object.entries(payload).filter(([key]) => !/(token|password|secret|code)/i.test(key)))
  if (provider === 'log') return { queued: true, provider }
  try {
    const message = template(templateName, payload)
    await transport().sendMail({ from: process.env.EMAIL_FROM || 'no-reply@frankai.online', to: recipient, replyTo: process.env.EMAIL_REPLY_TO || undefined, subject: message.subject, text: message.text })
    await authDb().query('INSERT INTO email_outbox (id,recipient,template,payload,status,sent_at,attempts) VALUES ($1,$2,$3,$4,\'SENT\',now(),1)', [id, recipient, templateName, JSON.stringify(safePayload)])
    await audit('email_delivery_succeeded', 'success', { template: definition.identifier, recipient }, null)
    return { queued: true, provider }
  } catch (error) {
    await authDb().query("INSERT INTO email_outbox (id,recipient,template,payload,status,attempts,available_at) VALUES ($1,$2,$3,$4,'FAILED',1,now()+interval '5 minutes')", [id, recipient, templateName, JSON.stringify(safePayload)])
    await audit('email_delivery_failed', 'failure', { template: definition.identifier, recipient }, null)
    throw error
  }
}
