import { randomUUID } from 'node:crypto'
import nodemailer from 'nodemailer'
import { authDb } from './postgres'

export type EmailTemplate = 'invitation' | 'email_verification' | 'password_reset' | 'password_changed' | 'admin_security_alert' | 'mfa_disabled' | 'new_login'
type Payload = Record<string, unknown>

function template(template: EmailTemplate, payload: Payload) {
  const token = typeof payload.token === 'string' ? payload.token : ''
  const base = process.env.APP_BASE_URL || process.env.JWT_ISSUER || 'https://frankai.online'
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
  if (process.env.EMAIL_ENABLED !== 'true') return { queued: false, provider: 'disabled' }
  const provider = process.env.EMAIL_PROVIDER || 'smtp'
  if (!['smtp', 'log', 'capture'].includes(provider)) throw new Error('Unsupported email provider')
  const id = randomUUID()
  await authDb().query('INSERT INTO email_outbox (id,recipient,template,payload) VALUES ($1,$2,$3,$4)', [id, recipient, templateName, JSON.stringify(payload)])
  if (provider === 'log') return { queued: true, provider }
  try {
    const message = template(templateName, payload)
    await transport().sendMail({ from: process.env.EMAIL_FROM || 'no-reply@frankai.online', to: recipient, replyTo: process.env.EMAIL_REPLY_TO || undefined, subject: message.subject, text: message.text })
    await authDb().query("UPDATE email_outbox SET status='SENT',sent_at=now(),attempts=attempts+1 WHERE id=$1", [id])
    return { queued: true, provider }
  } catch (error) {
    await authDb().query("UPDATE email_outbox SET status='FAILED',attempts=attempts+1,available_at=now()+interval '5 minutes' WHERE id=$1", [id])
    throw error
  }
}
