import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AUDIT_EVENT_REGISTRY, auditDefinition } from '../lib/auth/audit-registry.ts'
import { redactAuditMetadata } from '../lib/auth/redaction.ts'
import { EMAIL_TEMPLATE_REGISTRY, emailTemplateDefinition, queueEmail } from '../lib/auth/email.ts'

test('email registry classifies all defined renderers and reserves dormant templates', () => {
  assert.deepEqual(EMAIL_TEMPLATE_REGISTRY.map(item => item.identifier), ['INVITATION', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'MFA_DISABLED', 'ADMIN_SECURITY_ALERT', 'NEW_LOGIN'])
  assert.equal(EMAIL_TEMPLATE_REGISTRY.filter(item => item.classification === 'ACTIVE_TRIGGERED').length, 4)
  for (const name of ['mfa_disabled', 'admin_security_alert', 'new_login']) assert.equal(emailTemplateDefinition(name)?.classification, 'INACTIVE_RESERVED')
})

test('inactive email templates fail closed before provider dispatch', async () => {
  await assert.rejects(() => queueEmail('user@example.test', 'new_login', {}), /Inactive email template cannot be dispatched/)
  await assert.rejects(() => queueEmail('user@example.test', 'mfa_disabled', {}), /Inactive email template cannot be dispatched/)
})

test('audit registry includes required security categories and rejects unknown actions', () => {
  for (const id of ['AUTH_LOGIN_SUCCEEDED', 'AUTH_REFRESH_REPLAY_REJECTED', 'MFA_RESET', 'ADMIN_FINAL_ADMIN_ACTION_REJECTED', 'EMAIL_DELIVERY_FAILED', 'VOICE_DISABLED_REQUEST_REJECTED']) assert.ok(AUDIT_EVENT_REGISTRY.some(item => item.id === id))
  assert.ok(auditDefinition('refresh_concurrent_rejected'))
  assert.equal(auditDefinition('not_registered'), undefined)
})

test('every registered audit event has explicit semantics and a resolvable source action', () => {
  for (const definition of AUDIT_EVENT_REGISTRY) {
    assert.ok(definition.id)
    assert.ok(definition.sourceAction)
    assert.ok(definition.successFailure.includes('success'))
    assert.ok(definition.successFailure.includes('failure'))
    assert.ok(definition.successFailure.includes('rejected'))
    assert.ok(auditDefinition(definition.sourceAction))
    assert.equal(definition.requestId, 'required')
  }
})

test('recursive redaction removes key and value secrets while retaining benign metadata', () => {
  const value = redactAuditMetadata({ requestId: 'req-123', userId: 'user-123', nested: [{ innocent: 'Bearer abcdefghijklmnopqrstuvwxyz' }, { password: 'do-not-log' }], cause: new Error('otpauth://totp/test?secret=hidden'), rowId: 42, email: 'user@example.test', uuid: '550e8400-e29b-41d4-a716-446655440000' })
  const serialized = JSON.stringify(value)
  assert.match(serialized, /req-123/)
  assert.match(serialized, /user@example.test/)
  assert.doesNotMatch(serialized, /Bearer abcdefgh|do-not-log|otpauth:\/\//)
  assert.equal((value.nested as Array<Record<string, unknown>>)[1].password, '[REDACTED]')
})

test('redaction removes secret patterns from nested values without removing benign identifiers', () => {
  const value = redactAuditMetadata({
    innocentJwt: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature',
    authHeader: 'Bearer abcdefghijklmnopqrstuvwxyz',
    invitationUrl: 'https://staging.localhost:8443/signup/invite?token=secret-value',
    verificationUrl: 'https://staging.localhost:8443/verify-email?token=secret-value',
    resetUrl: 'https://staging.localhost:8443/reset-password?token=secret-value',
    uri: 'otpauth://totp/FrankAI:test?secret=ABCDEF',
    pem: '-----BEGIN PRIVATE KEY-----\\nsecret\\n-----END PRIVATE KEY-----',
    databaseUrl: 'postgresql://user:password@127.0.0.1:5432/db',
    nested: [{ smtpPassword: 'mail-secret' }, ['sk-proj-abcdefghijklmnopqrstuvwxyz', '1234-5678-9012']],
    requestId: 'req-123',
    benignUuid: '550e8400-e29b-41d4-a716-446655440000',
    benignEmail: 'user@example.test',
    benignRowId: 42
  })
  const serialized = JSON.stringify(value)
  for (const secret of ['eyJhbGci', 'Bearer abc', 'token=secret', 'otpauth://', 'BEGIN PRIVATE KEY', 'postgresql://user:password', 'mail-secret', 'sk-proj-']) assert.doesNotMatch(serialized, new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(serialized, /req-123/)
  assert.match(serialized, /550e8400-e29b-41d4-a716-446655440000/)
  assert.match(serialized, /user@example.test/)
  assert.match(serialized, /1234-5678-9012/)
})
