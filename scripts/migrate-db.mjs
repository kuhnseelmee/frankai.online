import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import pg from 'pg'

const { Pool } = pg
const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL is required'); process.exit(2) }
const pool = new Pool({ connectionString: url, max: 3, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined })
const client = await pool.connect()
try {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
  const migrations = ['001_auth', '002_admin_mfa', '003_control_plane', '004_runtime_grants']
  for (const id of migrations) {
    const existing = await client.query('SELECT id FROM schema_migrations WHERE id = $1', [id])
    if (existing.rowCount === 0) {
    const sql = await readFile(new URL(`../db/migrations/${id}.sql`, import.meta.url), 'utf8')
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [id])
    await client.query('COMMIT')
    console.log(`Applied ${id} (${createHash('sha256').update(sql).digest('hex').slice(0, 12)})`)
    } else console.log(`${id} already applied`)
  }
} catch (error) { await client.query('ROLLBACK').catch(() => undefined); console.error('Migration failed:', error instanceof Error ? error.message : 'unknown error'); process.exitCode = 1 } finally { client.release(); await pool.end() }
