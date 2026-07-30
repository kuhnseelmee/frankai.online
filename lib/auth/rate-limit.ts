import { createHash } from 'node:crypto'
import { authDb } from './postgres'

function source(request: Request) {
  if (process.env.TRUST_PROXY !== 'true') return 'direct'
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'proxy-unknown'
}
const policy: Record<string, [number, number]> = {
  login: [10, 900], admin_login: [10, 900], signup: [5, 3600], invite_validate: [20, 900], invite_redeem: [5, 900], refresh: [30, 60], password_forgot: [5, 3600], password_reset: [5, 900], email_resend: [5, 3600], mfa_challenge: [10, 900], mfa_recovery: [5, 900], admin_sensitive_action: [30, 60], general_api: [120, 60], voice: [5, 60]
}
export async function allowRequest(request: Request, bucket: string, identity = '') {
  const [limit, windowSeconds] = policy[bucket] || policy.general_api
  const raw = `${process.env.RATE_LIMIT_PREFIX || 'frankai'}:${bucket}:${source(request)}:${identity.trim().toLowerCase().slice(0, 180)}`
  const key = createHash('sha256').update(raw).digest('hex')
  const db = authDb()
  const result = await db.query(`INSERT INTO rate_limit_buckets (bucket_key,count,window_started_at,expires_at)
    VALUES ($1,1,now(),now()+($2 || ' seconds')::interval)
    ON CONFLICT (bucket_key) DO UPDATE SET count=CASE WHEN rate_limit_buckets.expires_at <= now() THEN 1 ELSE rate_limit_buckets.count+1 END,
      window_started_at=CASE WHEN rate_limit_buckets.expires_at <= now() THEN now() ELSE rate_limit_buckets.window_started_at END,
      expires_at=CASE WHEN rate_limit_buckets.expires_at <= now() THEN now()+($2 || ' seconds')::interval ELSE rate_limit_buckets.expires_at END
    RETURNING count, GREATEST(0, CEIL(EXTRACT(EPOCH FROM (expires_at-now())))::int) AS retry_after`, [key, windowSeconds])
  const row = result.rows[0]
  return { allowed: Number(row.count) <= limit, retryAfter: Number(row.retry_after), limit }
}
export async function cleanupRateLimits() { await authDb().query('DELETE FROM rate_limit_buckets WHERE expires_at < now()') }
