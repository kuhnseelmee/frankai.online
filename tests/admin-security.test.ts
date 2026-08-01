import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
import { assertRecoverableAdministrator, FINAL_ADMINISTRATOR_REQUIRED, lockAdministratorMembership } from '../lib/auth/admin.ts'
import { withAuthTransaction } from '../lib/auth/postgres.ts'
import { assertSafeStagingEnvironment } from './helpers/assert-staging-environment.ts'

const enabled = Boolean(process.env.DATABASE_URL && process.env.AUTH_DATABASE_ENABLED === 'true' && process.env.AUTH_SECURITY_INTEGRATION === 'true' && process.env.STAGING_E2E === 'true')

test('concurrent administrator demotions preserve the recoverable-admin invariant', { skip: !enabled }, async () => {
  assertSafeStagingEnvironment()
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const first = `security-test-${randomUUID()}@invalid.example`
  const second = `security-test-${randomUUID()}@invalid.example`
  const ids = [randomUUID(), randomUUID()]
  try {
    for (const [index, email] of [first, second].entries()) {
      await pool.query("INSERT INTO users (id,email,email_normalized,display_name,password_hash,role,status,email_verified_at,mfa_required,mfa_enrolled_at,password_changed_at) VALUES ($1,$2,$2,$3,'test', 'ADMIN','ACTIVE',now(),true,now(),now())", [ids[index], email, `Security Test ${index}`])
      await pool.query('INSERT INTO mfa_recovery_codes (id,user_id,code_hash) VALUES ($1,$2,$3)', [randomUUID(), ids[index], String.fromCharCode(97 + index).repeat(64)])
    }
    const demote = (id: string) => withAuthTransaction(async client => {
      await lockAdministratorMembership(client)
      await client.query("UPDATE users SET role='USER',role_version=role_version+1,security_version=security_version+1 WHERE id=$1", [id])
      await assertRecoverableAdministrator(client)
    })
    const results = await Promise.allSettled(ids.map(demote))
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1)
    assert.equal(results.filter(result => result.status === 'rejected' && result.reason?.name === FINAL_ADMINISTRATOR_REQUIRED).length, 1)
  } finally {
    await pool.query('DELETE FROM users WHERE id = ANY($1::text[])', [ids])
    await pool.end()
  }
})
