import { expect, test } from '@playwright/test'
import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import pg from 'pg'
import { hashPassword } from '../../lib/auth/store.ts'
import { assertSafeStagingEnvironment } from '../helpers/assert-staging-environment.ts'

const enabled = process.env.STAGING_E2E === 'true' && process.env.AUTH_DATABASE_ENABLED === 'true' && Boolean(process.env.DATABASE_URL)
const namespace = `final-${Date.now()}`
let pool: pg.Pool
let primary: { id: string; email: string; password: string; secret: string; recovery: string }
let secondary: { id: string; email: string; password: string; secret: string }
let activeUser: { id: string; email: string; password: string }
let secondaryUser: { id: string; email: string; password: string }
let lockedUser: { id: string; email: string; password: string }

function totp(secret: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''
  for (const char of secret) bits += alphabet.indexOf(char).toString(2).padStart(5, '0')
  const key = Buffer.from(Array.from({ length: Math.floor(bits.length / 8) }, (_, i) => parseInt(bits.slice(i * 8, i * 8 + 8), 2)))
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)))
  const digest = createHmac('sha1', key).update(counter).digest(); const offset = digest[digest.length - 1] & 15
  const value = ((digest[offset] & 127) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3]
  return String(value % 1_000_000).padStart(6, '0')
}

async function api(page: import('@playwright/test').Page, path: string, method = 'GET', body?: Record<string, unknown>) {
  return page.evaluate(async ({ path, method, body }) => {
    if (method !== 'GET') await fetch('/api/auth/csrf', { credentials: 'include' })
    const csrf = document.cookie.match(/(?:^|;\s*)frankai_csrf=([^;]+)/)?.[1] || ''
    const response = await fetch(path, { method, credentials: 'include', headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(method !== 'GET' ? { 'x-csrf-token': csrf } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
    return { status: response.status, body: await response.json().catch(() => ({})) }
  }, { path, method, body })
}

async function logout(page: import('@playwright/test').Page) { await api(page, '/api/auth/logout', 'POST') }

async function enroll(page: import('@playwright/test').Page, actor: { email: string; password: string }) {
  await page.goto('/admin/login'); await page.getByLabel('Email').fill(actor.email); await page.getByLabel('Password').fill(actor.password); await page.getByRole('button', { name: 'Sign in' }).click(); await expect(page).toHaveURL(/\/admin\/mfa$/)
  await page.getByRole('button', { name: 'Generate setup secret' }).click()
  const uri = await page.locator('code').textContent(); expect(uri).toContain('otpauth://')
  const secret = new URL(uri!).searchParams.get('secret')!
  await page.getByLabel('Authenticator code').fill('000000'); await page.getByRole('button', { name: 'Confirm MFA' }).click(); await expect(page.getByRole('alert').filter({ hasText: /invalid/i })).toBeVisible()
  await page.getByLabel('Authenticator code').fill(totp(secret)); await page.getByRole('button', { name: 'Confirm MFA' }).click()
  const recoveryText = await page.locator('pre').textContent(); const recovery = recoveryText!.trim().split(/\s+/)[0]
  expect(recoveryText!.trim().split(/\s+/)).toHaveLength(10)
  await page.getByRole('button', { name: 'I stored my recovery codes' }).click(); await expect(page).toHaveURL(/\/admin(?:\/)?$/)
  return { secret, recovery }
}

async function loginAdmin(page: import('@playwright/test').Page, actor: { email: string; password: string; secret: string }) {
  await page.goto('/admin/login'); await page.getByLabel('Email').fill(actor.email); await page.getByLabel('Password').fill(actor.password); await page.getByRole('button', { name: 'Sign in' }).click(); await expect(page).toHaveURL(/\/admin\/mfa$/)
  await page.getByLabel('Authenticator code').fill(totp(actor.secret)); await page.getByRole('button', { name: 'Verify code' }).click(); await expect(page).toHaveURL(/\/admin(?:\/)?$/)
}

async function loginUser(page: import('@playwright/test').Page, actor: { email: string; password: string }) {
  await page.goto('/login'); await page.getByLabel('Email').fill(actor.email); await page.getByLabel('Password').fill(actor.password); await page.getByRole('button', { name: 'Sign in' }).click(); await expect(page).toHaveURL(/\/voice$/)
}

test.describe('final staging authentication acceptance', () => {
  test.skip(!enabled, 'requires explicit isolated staging database')
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    assertSafeStagingEnvironment()
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    await pool.query('DELETE FROM users WHERE email_normalized LIKE $1', [`${namespace}%`])
    const make = async (suffix: string, role: 'ADMIN' | 'USER', status = 'ACTIVE') => {
      const id = randomUUID(); const email = `${namespace}-${suffix}@staging.invalid`; const password = randomBytes(18).toString('hex')
      await pool.query("INSERT INTO users (id,email,email_normalized,display_name,password_hash,password_hash_version,role,role_version,security_version,status,email_verified_at,mfa_required,password_changed_at) VALUES ($1,$2,$2,$3,$4,1,$5,1,1,$6,now(),$7,now())", [id, email, `Final ${suffix}`, await hashPassword(password), role, status, role === 'ADMIN'])
      return { id, email, password }
    }
    primary = await make('admin-primary', 'ADMIN'); secondary = await make('admin-secondary', 'ADMIN'); activeUser = await make('user-active', 'USER'); secondaryUser = await make('user-secondary', 'USER'); lockedUser = await make('user-locked', 'USER')
    const primaryPage = await browser.newPage(); const secondaryPage = await browser.newPage()
    const primaryMfa = await enroll(primaryPage, primary); const secondaryMfa = await enroll(secondaryPage, secondary)
    primary = { ...primary, ...primaryMfa }; secondary = { ...secondary, ...secondaryMfa }
    await primaryPage.close(); await secondaryPage.close()
  })

  test.afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email_normalized LIKE $1', [`${namespace}%`])
    await pool.query('DELETE FROM rate_limit_buckets WHERE bucket_key LIKE $1', [`%${namespace}%`])
    await pool.end()
  })

  test('MFA challenge, recovery, recent reauthentication, mutations, reset, and final-admin invariant', async ({ page }) => {
    await loginAdmin(page, primary); await logout(page)
    await page.goto('/admin/login'); await page.getByLabel('Email').fill(primary.email); await page.getByLabel('Password').fill(primary.password); await page.getByRole('button', { name: 'Sign in' }).click(); await expect(page).toHaveURL(/\/admin\/mfa$/)
    await page.getByLabel('Recovery code').fill(primary.recovery); await page.getByRole('button', { name: 'Use recovery code' }).click(); await expect(page).toHaveURL(/\/admin(?:\/)?$/); await logout(page)
    await page.goto('/admin/login'); await page.getByLabel('Email').fill(primary.email); await page.getByLabel('Password').fill(primary.password); await page.getByRole('button', { name: 'Sign in' }).click(); await expect(page).toHaveURL(/\/admin\/mfa$/)
    await page.getByLabel('Recovery code').fill(primary.recovery); await page.getByRole('button', { name: 'Use recovery code' }).click(); await expect(page.getByRole('alert').filter({ hasText: /invalid|expired/i })).toBeVisible()
    await page.getByLabel('Authenticator code').fill(totp(primary.secret)); await page.getByRole('button', { name: 'Verify code' }).click(); await expect(page).toHaveURL(/\/admin(?:\/)?$/)

    let response = await api(page, `/api/admin/users/${activeUser.id}`, 'PATCH', { status: 'DISABLED' }); expect(response.status).toBe(401); expect(response.body.error).toBe('RECENT_MFA_REQUIRED')
    response = await api(page, '/api/admin/reauth/challenge', 'POST', { code: totp(primary.secret) }); expect(response.status).toBe(200)
    response = await api(page, `/api/admin/users/${activeUser.id}`, 'PATCH', { status: 'DISABLED' }); expect(response.status).toBe(200)
    response = await api(page, `/api/admin/users/${activeUser.id}/unlock`, 'POST'); expect(response.status).toBe(200)
    response = await api(page, `/api/admin/users/${secondary.id}/reset-mfa`, 'POST'); expect(response.status).toBe(200)
    const secondaryState = await pool.query('SELECT mfa_enrolled_at FROM users WHERE id=$1', [secondary.id]); expect(secondaryState.rows[0].mfa_enrolled_at).toBeNull()
    response = await api(page, `/api/admin/users/${secondary.id}`, 'PATCH', { role: 'USER' }); expect(response.status).toBe(200)
    response = await api(page, `/api/admin/users/${primary.id}`, 'PATCH', { role: 'USER' }); expect(response.status).toBe(409); expect(response.body.error).toBe('FINAL_ADMINISTRATOR_REQUIRED')
    const primaryState = await pool.query('SELECT role,status FROM users WHERE id=$1', [primary.id]); expect(primaryState.rows[0]).toEqual({ role: 'ADMIN', status: 'ACTIVE' })
    const audit = await pool.query("SELECT action,result FROM audit_events WHERE actor_user_id=$1 AND action IN ('admin_mfa_reset','admin_user_changed','admin_reauth') ORDER BY occurred_at", [primary.id]); expect(audit.rows.some(row => row.action === 'admin_mfa_reset' && row.result === 'success')).toBe(true); expect(audit.rows.some(row => row.action === 'admin_reauth' && row.result === 'success')).toBe(true)
  })

  test('user multi-session listing, individual revoke, logout-all, and cross-user denial', async ({ browser }) => {
    const contextA = await browser.newContext(); const contextB = await browser.newContext(); const contextOther = await browser.newContext(); const pageA = await contextA.newPage(); const pageB = await contextB.newPage(); const other = await contextOther.newPage()
    await loginUser(pageA, activeUser); await loginUser(pageB, activeUser); await loginUser(other, secondaryUser)
    const sessions = await api(pageA, '/api/auth/sessions'); expect(sessions.status).toBe(200); expect(sessions.body.sessions.length).toBeGreaterThanOrEqual(2)
    const otherSession = sessions.body.sessions.find((item: { current: boolean }) => !item.current); expect(otherSession).toBeTruthy()
    const crossUser = await api(other, `/api/auth/sessions/${otherSession.id}`, 'DELETE'); expect(crossUser.status).toBe(404)
    const revoked = await api(pageA, `/api/auth/sessions/${otherSession.id}`, 'DELETE'); expect(revoked.status).toBe(200)
    const refreshB = await api(pageB, '/api/auth/refresh', 'POST'); expect(refreshB.status).toBe(401)
    const logoutAll = await api(pageA, '/api/auth/logout-all', 'POST'); expect(logoutAll.status).toBe(200)
    const remaining = await pool.query('SELECT count(*)::int AS count FROM refresh_sessions WHERE user_id=$1 AND revoked_at IS NULL', [activeUser.id]); expect(Number(remaining.rows[0].count)).toBe(0)
    await contextA.close(); await contextB.close(); await contextOther.close()
  })

  test('account lock threshold is authoritative and unlock is administrator-controlled', async ({ page }) => {
    await page.goto('/login')
    for (let attempt = 0; attempt < 5; attempt++) { const result = await api(page, '/api/auth/login', 'POST', { email: lockedUser.email, password: 'wrong-password-never-printed' }); expect([401, 429]).toContain(result.status) }
    const locked = await pool.query('SELECT status,failed_login_count,locked_until FROM users WHERE id=$1', [lockedUser.id]); expect(locked.rows[0].status).toBe('LOCKED'); expect(Number(locked.rows[0].failed_login_count)).toBeGreaterThanOrEqual(5); expect(locked.rows[0].locked_until).not.toBeNull()
    await loginAdmin(page, primary); const reauth = await api(page, '/api/admin/reauth/challenge', 'POST', { code: totp(primary.secret) }); expect(reauth.status).toBe(200)
    const unlock = await api(page, `/api/admin/users/${lockedUser.id}/unlock`, 'POST'); expect(unlock.status).toBe(200)
    const unlocked = await pool.query('SELECT status,failed_login_count,locked_until FROM users WHERE id=$1', [lockedUser.id]); expect(unlocked.rows[0]).toEqual({ status: 'ACTIVE', failed_login_count: 0, locked_until: null })
  })
})
