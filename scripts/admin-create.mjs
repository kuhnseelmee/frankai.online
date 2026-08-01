import { mkdir, readFile, writeFile, rename, chmod } from 'node:fs/promises'
import { randomBytes, randomUUID, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
import pg from 'pg'

const scrypt = promisify(scryptCallback)
const authStore = process.env.AUTH_STORE || ''
const postgresRequested = authStore === 'postgres' || process.env.AUTH_DATABASE_ENABLED === 'true' || process.env.NODE_ENV === 'production'
const usePostgres = postgresRequested

if (usePostgres && (authStore !== 'postgres' || process.env.AUTH_DATABASE_ENABLED !== 'true' || !process.env.DATABASE_URL)) {
  throw new Error('PostgreSQL bootstrap requires AUTH_STORE=postgres, AUTH_DATABASE_ENABLED=true, and DATABASE_URL. Load the approved service environment before running admin:create.')
}
if (!usePostgres && authStore !== 'file') {
  throw new Error('Refusing to select the file store implicitly. Set AUTH_STORE=postgres for production or AUTH_STORE=file for an explicit development-only bootstrap.')
}

const email = process.argv.slice(2).find((arg) => arg.startsWith('--email='))?.slice(8) || process.argv[process.argv.indexOf('--email') + 1]
if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Usage: npm run admin:create -- --email admin@example.com')
  process.exit(2)
}

function readSecret(prompt) {
  return new Promise((resolve) => {
    const input = process.stdin
    const output = process.stdout
    output.write(prompt)
    input.setRawMode?.(true)
    let value = ''
    const onData = (chunk) => {
      const key = chunk.toString()
      if (key === '\n' || key === '\r' || key === '\u0004') {
        input.setRawMode?.(false)
        input.off('data', onData)
        output.write('\n')
        resolve(value)
      } else if (key === '\u0003') process.exit(130)
      else if (key === '\u007f') value = value.slice(0, -1)
      else value += key
    }
    input.on('data', onData)
  })
}

const password = await readSecret('Admin password: ')
if (password.length < 12) {
  console.error('Password must be at least 12 characters.')
  process.exit(2)
}

const normalised = email.trim().toLowerCase()
const now = new Date().toISOString()
const salt = randomBytes(16).toString('hex')
const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
const passwordHash = `scrypt$${salt}$${derived.toString('hex')}`

if (usePostgres) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existing = await client.query('SELECT id FROM users WHERE email_normalized=$1 FOR UPDATE', [normalised])
    if (existing.rowCount) throw new Error('A user with this email already exists; refusing to modify an existing account.')
    const id = randomUUID()
    await client.query("INSERT INTO users (id,email,email_normalized,display_name,password_hash,password_hash_version,role,role_version,security_version,status,email_verified_at,mfa_required,password_changed_at) VALUES ($1,$2,$3,$4,$5,1,'ADMIN',1,1,'ACTIVE',now(),true,now())", [id, normalised, normalised, normalised.split('@')[0], passwordHash])
    await client.query('INSERT INTO audit_events (id,actor_user_id,action,result,metadata_json) VALUES ($1,$2,$3,$4,$5)', [randomUUID(), id, 'admin_bootstrap', 'success', JSON.stringify({ source: 'admin:create' })])
    await client.query('COMMIT')
    console.log('Administrator created in PostgreSQL; MFA enrollment is required at first login.')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
} else {
  const dir = process.env.AUTH_DATA_DIR || '/var/lib/frankai-site/auth'
  await mkdir(dir, { recursive: true, mode: 0o700 })
  let list = []
  try {
    list = JSON.parse(await readFile(`${dir}/users.json`, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (list.some((user) => user.email === normalised)) throw new Error('A user with this email already exists; refusing to modify an existing account.')
  list.push({ id: randomUUID(), email: normalised, displayName: normalised.split('@')[0], passwordHash, passwordHashVersion: 1, role: 'ADMIN', roleVersion: 1, securityVersion: 1, status: 'ACTIVE', emailVerifiedAt: now, failedLoginCount: 0, lockedUntil: null, lastLoginAt: null, passwordChangedAt: now, mfaRequired: true, mfaEnrolledAt: null, createdAt: now, updatedAt: now })
  const target = `${dir}/users.json`
  const temp = `${target}.${process.pid}.tmp`
  await writeFile(temp, JSON.stringify(list, null, 2), { mode: 0o600 })
  await rename(temp, target)
  await chmod(target, 0o600)
  console.log('Administrator created in file store; MFA enrollment is required at first login.')
}
