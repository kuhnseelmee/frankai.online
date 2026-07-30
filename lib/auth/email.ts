import { randomUUID } from 'node:crypto'
import { authDb } from './postgres'

export type EmailTemplate = 'invitation' | 'email_verification' | 'password_reset' | 'password_changed' | 'admin_security_alert' | 'mfa_disabled' | 'new_login'
export async function queueEmail(recipient: string, template: EmailTemplate, payload: Record<string, unknown>) {
  if (process.env.EMAIL_ENABLED !== 'true') return { queued: false, provider: 'disabled' }
  const provider = process.env.EMAIL_PROVIDER || 'smtp'
  if (!['smtp', 'log', 'capture'].includes(provider)) throw new Error('Unsupported email provider')
  await authDb().query('INSERT INTO email_outbox (id,recipient,template,payload) VALUES ($1,$2,$3,$4)', [randomUUID(), recipient, template, JSON.stringify(payload)])
  return { queued: true, provider }
}
