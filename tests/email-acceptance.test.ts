import assert from 'node:assert/strict'
import { test } from 'node:test'
import pg from 'pg'
import { queueEmail } from '../lib/auth/email.ts'
import { assertSafeStagingEnvironment } from './helpers/assert-staging-environment.ts'

const inspectionUrl = process.env.STAGING_INSPECTION_DATABASE_URL || ''
const enabled = process.env.STAGING_E2E === 'true' && process.env.AUTH_DATABASE_ENABLED === 'true' && Boolean(process.env.DATABASE_URL) && /\/frankai_auth_staging(?:\?|$)/.test(inspectionUrl)
const namespace = `mail-${Date.now()}-${Math.random().toString(16).slice(2)}`

type MailSummary = { From?: { Address?: string }; To?: Array<{ Address?: string }>; Subject?: string; Snippet?: string }

async function mailSummaries(recipient: string) {
  const response = await fetch('http://127.0.0.1:8025/mailpit/api/v1/messages?limit=100')
  assert.equal(response.status, 200)
  const body = await response.json() as { messages?: MailSummary[] }
  return (body.messages || []).filter(message => message.To?.some(item => item.Address === recipient))
}

test('active email registry delivers through staging Mailpit and stores token-free outbox payloads', { skip: !enabled }, async () => {
  assertSafeStagingEnvironment()
  assert.match(inspectionUrl, /\/frankai_auth_staging(?:\?|$)/)
  const pool = new pg.Pool({ connectionString: inspectionUrl })
  const previous = { enabled: process.env.EMAIL_ENABLED, provider: process.env.EMAIL_PROVIDER, host: process.env.SMTP_HOST, port: process.env.SMTP_PORT }
  const recipients = {
    invitation: `${namespace}-invitation@staging.invalid`,
    email_verification: `${namespace}-verification@staging.invalid`,
    password_reset: `${namespace}-reset@staging.invalid`,
    password_changed: `${namespace}-changed@staging.invalid`
  }
  const tokens = new Map([
    ['invitation', `${namespace}-invitation-token`],
    ['email_verification', `${namespace}-verification-token`],
    ['password_reset', `${namespace}-reset-token`]
  ])
  try {
    process.env.EMAIL_ENABLED = 'true'
    process.env.EMAIL_PROVIDER = 'capture'
    process.env.SMTP_HOST = '127.0.0.1'
    process.env.SMTP_PORT = '1025'
    for (const [template, recipient] of Object.entries(recipients)) {
      await queueEmail(recipient, template as 'invitation' | 'email_verification' | 'password_reset' | 'password_changed', template === 'password_changed' ? {} : { token: tokens.get(template) })
    }
    for (const [template, recipient] of Object.entries(recipients)) {
      const result = await pool.query('SELECT payload,status,attempts FROM email_outbox WHERE recipient=$1 AND template=$2 ORDER BY sent_at DESC NULLS LAST LIMIT 1', [recipient, template])
      assert.equal(result.rows[0]?.status, 'SENT')
      assert.equal(Number(result.rows[0]?.attempts), 1)
      const payload = JSON.stringify(result.rows[0]?.payload)
      assert.doesNotMatch(payload, /token|password|secret|code/i)
      const messages = await mailSummaries(recipient)
      assert.equal(messages.length, 1)
      assert.equal(messages[0].From?.Address, 'frankai-staging@localhost')
      assert.equal(messages[0].To?.[0]?.Address, recipient)
      assert.doesNotMatch(`${messages[0].Subject} ${messages[0].Snippet}`, /frankai\.online/i)
      assert.equal(messages[0].Subject, {
        invitation: 'Your FrankAI invitation',
        email_verification: 'Verify your FrankAI email',
        password_reset: 'Reset your FrankAI password',
        password_changed: 'Your FrankAI password changed'
      }[template])
    }
  } finally {
    Object.assign(process.env, { EMAIL_ENABLED: previous.enabled, EMAIL_PROVIDER: previous.provider, SMTP_HOST: previous.host, SMTP_PORT: previous.port })
    for (const recipient of Object.values(recipients)) {
      await pool.query('DELETE FROM email_outbox WHERE recipient=$1', [recipient])
      await pool.query("DELETE FROM audit_events WHERE metadata_json->>'recipient'=$1", [recipient])
    }
    await pool.end()
  }
})

test('active email delivery failure records one bounded retry without exposing internals', { skip: !enabled }, async () => {
  assertSafeStagingEnvironment()
  assert.match(inspectionUrl, /\/frankai_auth_staging(?:\?|$)/)
  const pool = new pg.Pool({ connectionString: inspectionUrl })
  const recipient = `${namespace}-failure@staging.invalid`
  const previous = { enabled: process.env.EMAIL_ENABLED, provider: process.env.EMAIL_PROVIDER, host: process.env.SMTP_HOST, port: process.env.SMTP_PORT }
  try {
    process.env.EMAIL_ENABLED = 'true'
    process.env.EMAIL_PROVIDER = 'smtp'
    process.env.SMTP_HOST = '127.0.0.1'
    process.env.SMTP_PORT = '1'
    await assert.rejects(() => queueEmail(recipient, 'password_reset', { token: `${namespace}-failure-token` }))
    const result = await pool.query('SELECT payload,status,attempts,available_at FROM email_outbox WHERE recipient=$1 ORDER BY available_at DESC LIMIT 1', [recipient])
    assert.equal(result.rows[0]?.status, 'FAILED')
    assert.equal(Number(result.rows[0]?.attempts), 1)
    assert.ok(result.rows[0]?.available_at)
    assert.doesNotMatch(JSON.stringify(result.rows[0]?.payload), /failure-token|smtp|password|secret/i)
  } finally {
    Object.assign(process.env, { EMAIL_ENABLED: previous.enabled, EMAIL_PROVIDER: previous.provider, SMTP_HOST: previous.host, SMTP_PORT: previous.port })
    await pool.query('DELETE FROM email_outbox WHERE recipient=$1', [recipient])
    await pool.query("DELETE FROM audit_events WHERE metadata_json->>'recipient'=$1", [recipient])
    await pool.end()
  }
})
