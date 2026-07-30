import { expect, test } from '@playwright/test'
import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import pg from 'pg'
import { hashPassword, hashToken } from '../../lib/auth/store.ts'

const enabled = process.env.STAGING_E2E === 'true' && process.env.AUTH_DATABASE_ENABLED === 'true' && Boolean(process.env.DATABASE_URL)
const namespace = `journey-${Date.now()}`
let pool: pg.Pool
let adminEmail: string
let adminPassword: string

function totp(secret: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''
  for (const char of secret) bits += alphabet.indexOf(char).toString(2).padStart(5, '0')
  const key = Buffer.from(Array.from({ length: Math.floor(bits.length / 8) }, (_, i) => parseInt(bits.slice(i * 8, i * 8 + 8), 2)))
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)))
  const digest = createHmac('sha1', key).update(counter).digest(); const offset = digest[digest.length - 1] & 15
  const value = ((digest[offset] & 127) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3]
  return String(value % 1_000_000).padStart(6, '0')
}

test.describe('authenticated staging journeys', () => {
  test.skip(!enabled, 'requires explicit isolated staging database')

  test.beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    await pool.query('DELETE FROM rate_limit_buckets')
    adminEmail = `${namespace}-admin@staging.invalid`; adminPassword = randomBytes(18).toString('hex')
    const adminId = randomUUID(); const passwordHash = await hashPassword(adminPassword)
    await pool.query("INSERT INTO users (id,email,email_normalized,display_name,password_hash,password_hash_version,role,role_version,security_version,status,email_verified_at,mfa_required,password_changed_at) VALUES ($1,$2,$2,$3,$4,1,'ADMIN',1,1,'ACTIVE',now(),true,now())", [adminId, adminEmail, namespace, passwordHash])
  })

  test.afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email_normalized LIKE $1', [`${namespace}%`])
    await pool.query('DELETE FROM rate_limit_buckets')
    await pool.end()
  })

  test('invitation redemption and email verification journeys', async ({ page }) => {
    const invitedEmail = `${namespace}-invited@staging.invalid`; const invitationId = randomUUID(); const invitationToken = randomBytes(32).toString('base64url')
    await pool.query("INSERT INTO invitations (id,email_normalized,token_hash,role,expires_at) VALUES ($1,$2,$3,'USER',now()+interval '1 hour')", [invitationId, invitedEmail, hashToken(invitationToken)])
    await page.goto(`/signup/invite?token=${encodeURIComponent(invitationToken)}`)
    await expect(page.getByText('Complete your invitation to create access.')).toBeVisible()
    await page.getByLabel('Name').fill('Invited Journey User')
    await page.getByLabel('Password').fill(randomBytes(18).toString('hex'))
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/\/account$/)
    const invitation = await pool.query('SELECT used_at FROM invitations WHERE id=$1', [invitationId]); expect(invitation.rows[0].used_at).not.toBeNull()
    const user = await pool.query('SELECT role,email_verified_at FROM users WHERE email_normalized=$1', [invitedEmail]); expect(user.rows[0].role).toBe('USER'); expect(user.rows[0].email_verified_at).not.toBeNull()

    const unverifiedEmail = `${namespace}-unverified@staging.invalid`; const userId = randomUUID(); const token = randomBytes(32).toString('base64url')
    await pool.query("INSERT INTO users (id,email,email_normalized,display_name,password_hash,password_hash_version,role,role_version,security_version,status,mfa_required,password_changed_at) VALUES ($1,$2,$2,$3,$4,1,'USER',1,1,'PENDING_VERIFICATION',false,now())", [userId, unverifiedEmail, namespace, await hashPassword(randomBytes(18).toString('hex'))])
    await pool.query("INSERT INTO verification_tokens (id,user_id,token_hash,expires_at) VALUES ($1,$2,$3,now()+interval '1 hour')", [randomUUID(), userId, hashToken(token)])
    await page.goto(`/verify-email?token=${encodeURIComponent(token)}`)
    await expect(page.getByText('Your email is verified.')).toBeVisible()
    const verified = await pool.query('SELECT email_verified_at,status FROM users WHERE id=$1', [userId]); expect(verified.rows[0].email_verified_at).not.toBeNull(); expect(verified.rows[0].status).toBe('ACTIVE')
  })

  test('password reset invalidates old sessions', async ({ page }) => {
    const email = `${namespace}-reset@staging.invalid`; const userId = randomUUID(); const token = randomBytes(32).toString('base64url')
    await pool.query("INSERT INTO users (id,email,email_normalized,display_name,password_hash,password_hash_version,role,role_version,security_version,status,email_verified_at,mfa_required,password_changed_at) VALUES ($1,$2,$2,$3,$4,1,'USER',1,1,'ACTIVE',now(),false,now())", [userId, email, namespace, await hashPassword(randomBytes(18).toString('hex'))])
    await pool.query("INSERT INTO password_reset_tokens (id,user_id,token_hash,expires_at) VALUES ($1,$2,$3,now()+interval '1 hour')", [randomUUID(), userId, hashToken(token)])
    await pool.query("INSERT INTO refresh_sessions (id,user_id,token_hash,token_family,expires_at) VALUES ($1,$2,$3,$4,now()+interval '1 hour'),($5,$2,$6,$7,now()+interval '1 hour')", [randomUUID(), userId, hashToken(randomUUID()), randomUUID(), randomUUID(), hashToken(randomUUID()), randomUUID()])
    const before = await pool.query('SELECT security_version FROM users WHERE id=$1', [userId])
    await page.goto(`/reset-password?token=${encodeURIComponent(token)}`)
    await page.getByLabel('New password').fill(randomBytes(18).toString('hex'))
    await page.getByRole('button', { name: 'Change password' }).click()
    await expect(page.getByText('Password changed. Sign in again.')).toBeVisible()
    const after = await pool.query('SELECT security_version FROM users WHERE id=$1', [userId]); expect(Number(after.rows[0].security_version)).toBe(Number(before.rows[0].security_version) + 1)
    const sessions = await pool.query('SELECT count(*) FROM refresh_sessions WHERE user_id=$1 AND revoked_at IS NULL', [userId]); expect(Number(sessions.rows[0].count)).toBe(0)
  })

  test('administrator MFA enrollment grants only the current session assurance', async ({ page }) => {
    await page.goto('/admin/login'); await page.getByLabel('Email').fill(adminEmail); await page.getByLabel('Password').fill(adminPassword); await page.getByRole('button', { name: 'Sign in' }).click(); await expect(page).toHaveURL(/\/admin\/mfa$/)
    await page.getByRole('button', { name: 'Generate setup secret' }).click(); const uri = await page.locator('code').textContent(); expect(uri).toContain('otpauth://')
    const secret = new URL(uri!).searchParams.get('secret')!; await page.getByLabel('Authenticator code').fill(totp(secret)); const confirmation = page.waitForResponse(response => response.url().includes('/api/admin/mfa/confirm')); await page.getByRole('button', { name: 'Confirm MFA' }).click(); expect((await confirmation).status()).toBe(200); await expect(page.locator('pre')).toContainText(/.+/); await page.getByRole('button', { name: 'I stored my recovery codes' }).click(); await expect(page).toHaveURL(/\/admin(?:\/)?$/)
  })
})
