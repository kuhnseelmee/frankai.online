import pg from 'pg'
const { Pool } = pg
if (!process.env.DATABASE_URL || !/^[0-9a-f]{64}$/i.test(process.env.APP_PW || '')) throw new Error('DATABASE_URL and generated APP_PW are required')
const pool = new Pool({ connectionString: process.env.DATABASE_URL }); const client = await pool.connect()
try { const exists = await client.query("select 1 from pg_roles where rolname='frankai_auth_app'"); const password = process.env.APP_PW; if (!exists.rowCount) await client.query(`CREATE ROLE frankai_auth_app LOGIN PASSWORD '${password}'`); else await client.query(`ALTER ROLE frankai_auth_app LOGIN PASSWORD '${password}'`); await client.query('ALTER ROLE frankai_auth_app NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT'); await client.query('GRANT CONNECT ON DATABASE frankai_auth TO frankai_auth_app'); await client.query('GRANT USAGE ON SCHEMA public TO frankai_auth_app'); await client.query('GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO frankai_auth_app'); await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO frankai_auth_app') } finally { client.release(); await pool.end() }
console.log('runtime role provisioned')
