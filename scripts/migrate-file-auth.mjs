import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
const { Pool } = pg
const sourceDir = process.env.AUTH_DATA_DIR || '/var/lib/frankai-site/auth'
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(2) }
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const report = { sourceDir, importedUsers: 0, importedAuditEvents: 0, revokedSessions: 0, quarantined: [] }
async function load(name, fallback) { try { return JSON.parse(await readFile(`${sourceDir}/${name}`, 'utf8')) } catch (error) { if (error.code === 'ENOENT') return fallback; throw error } }
const users = await load('users.json', []); const audits = await load('audit.jsonl', null)
const client = await pool.connect()
try { await client.query('BEGIN'); for (const user of users) { if (!user?.id || !user.email || !user.passwordHash) { report.quarantined.push({ file: 'users.json', id: user?.id || null, reason: 'missing required fields' }); continue } try { await client.query(`INSERT INTO users (id,email,email_normalized,display_name,password_hash,password_hash_version,role,role_version,security_version,status,failed_login_count,locked_until,last_login_at,password_changed_at,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (id) DO NOTHING`, [user.id,user.email,user.email.toLowerCase(),user.displayName || 'FrankAI user',user.passwordHash,user.passwordHashVersion || 1,user.role || 'USER',user.roleVersion || 1,user.securityVersion || 1,user.status || 'ACTIVE',user.failedLoginCount || 0,user.lockedUntil ? new Date(user.lockedUntil) : null,user.lastLoginAt || null,user.passwordChangedAt || new Date().toISOString(),user.createdAt || new Date().toISOString(),user.updatedAt || new Date().toISOString()]); report.importedUsers++ } catch (error) { report.quarantined.push({ file: 'users.json', id: user.id, reason: error.code || 'insert failed' }) } }
  const sessionRows = await client.query('SELECT count(*)::int AS count FROM refresh_sessions'); await client.query("UPDATE refresh_sessions SET revoked_at=now(),revocation_reason='file_store_migration' WHERE revoked_at IS NULL"); report.revokedSessions = sessionRows.rows[0].count
  if (Array.isArray(audits)) for (const event of audits) { try { const item = typeof event === 'string' ? JSON.parse(event) : event; await client.query('INSERT INTO audit_events (id,occurred_at,actor_user_id,action,result,metadata_json) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [item.id || randomUUID(),item.timestamp || new Date().toISOString(),item.actorUserId || null,item.action || 'migrated_event',item.result || 'unknown',JSON.stringify(item.metadata || {})]); report.importedAuditEvents++ } catch { report.quarantined.push({ file: 'audit.jsonl', reason: 'invalid audit event' }) } }
  await client.query('COMMIT')
} catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release(); await pool.end() }
await mkdir('/var/lib/frankai-site/auth-migration', { recursive: true }).catch(() => undefined)
await writeFile('/var/lib/frankai-site/auth-migration/report.json', `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 }).catch(() => undefined)
console.log(JSON.stringify(report))
