import pg from 'pg'

let pool: pg.Pool | null = null
export function authDb() {
  if (!process.env.DATABASE_URL || process.env.AUTH_DATABASE_ENABLED !== 'true') throw new Error('PostgreSQL authentication is not configured')
  if (!pool) pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 8, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined })
  return pool
}
export async function withAuthTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>) {
  const client = await authDb().connect()
  try { await client.query('BEGIN'); const value = await fn(client); await client.query('COMMIT'); return value }
  catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error }
  finally { client.release() }
}
