import pg from 'pg'
import { randomUUID } from 'node:crypto'
import { audit, type User } from '@/lib/auth/store'

const { Pool } = pg
let pool: pg.Pool | null = null
function db() { if (!process.env.DATABASE_URL || process.env.AUTH_DATABASE_ENABLED !== 'true') throw new Error('Voice database is not configured'); if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }); return pool }
export async function createRealtimeCall(user: User, sdp: string) {
  if (process.env.VOICE_ENABLED !== 'true') return { status: 503 as const, error: 'Realtime voice is not enabled on this deployment.' }
  if (!process.env.OPENAI_API_KEY) return { status: 503 as const, error: 'Realtime provider is not configured.' }
  if (!sdp || sdp.length > 64 * 1024 || !sdp.includes('v=0')) return { status: 400 as const, error: 'A valid WebRTC SDP offer is required.' }
  const client = await db().connect(); let sessionId = ''; let model = ''; let voice = ''; let expiresAt = ''
  try {
    await client.query('BEGIN')
    const config = await client.query("SELECT * FROM ai_configuration_versions WHERE status='ACTIVE' ORDER BY version DESC LIMIT 1 FOR SHARE")
    if (!config.rowCount) { await client.query('ROLLBACK'); return { status: 503 as const, error: 'No active realtime configuration is available.' } }
    const active = config.rows[0]
    const concurrent = await client.query("SELECT count(*)::int AS count FROM voice_sessions WHERE user_id=$1 AND status IN ('PENDING','ACTIVE') AND expires_at > now()", [user.id])
    if (concurrent.rows[0].count >= active.concurrent_user_limit) { await client.query('ROLLBACK'); await audit('voice_session', 'rejected_concurrent_limit', {}, user.id); return { status: 429 as const, error: 'Your concurrent voice-session limit has been reached.' } }
    sessionId = randomUUID(); model = active.realtime_model; voice = active.voice; expiresAt = new Date(Date.now() + Number(active.session_max_seconds) * 1000).toISOString()
    await client.query("INSERT INTO voice_sessions (id,user_id,status,provider,model,voice,expires_at,last_activity_at,configuration_version_id) VALUES ($1,$2,'PENDING','openai',$3,$4,$5,now(),$6)", [sessionId,user.id,model,voice,expiresAt,active.id])
    await client.query('COMMIT')
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); client.release(); throw error }
  client.release()
  const providerSession = { type: 'realtime', model, audio: { output: { voice } }, instructions: String((await db().query('SELECT instructions FROM ai_configuration_versions WHERE id=(SELECT configuration_version_id FROM voice_sessions WHERE id=$1)', [sessionId])).rows[0]?.instructions || '') }
  const form = new FormData(); form.append('sdp', new Blob([sdp], { type: 'application/sdp' }), 'offer.sdp'); form.append('session', new Blob([JSON.stringify(providerSession)], { type: 'application/json' }))
  const response = await fetch('https://api.openai.com/v1/realtime/calls', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form })
  if (!response.ok) { await db().query("UPDATE voice_sessions SET status='REJECTED',ended_at=now(),termination_reason=$2 WHERE id=$1", [sessionId, `provider_http_${response.status}`]); await audit('voice_session', 'rejected_provider', { sessionId, providerStatus: response.status }, user.id); return { status: 503 as const, error: 'Realtime provider could not establish the session.' } }
  const answer = await response.text(); const providerReference = response.headers.get('location') || null
  await db().query("UPDATE voice_sessions SET status='ACTIVE',connected_at=now(),last_activity_at=now(),provider_session_reference=$2 WHERE id=$1", [sessionId, providerReference])
  await audit('voice_session', 'active', { sessionId }, user.id)
  return { status: 201 as const, sessionId, sdp: answer, expiresAt }
}
export async function endRealtimeCall(user: User, sessionId: string, reason = 'user_ended') { if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return false; const result = await db().query("UPDATE voice_sessions SET status='ENDED',ended_at=now(),termination_reason=$3,duration_seconds=GREATEST(0,EXTRACT(EPOCH FROM (now()-COALESCE(connected_at,created_at)))::int) WHERE id=$1 AND user_id=$2 AND status IN ('PENDING','ACTIVE') RETURNING id", [sessionId,user.id,reason]); if (result.rowCount) await audit('voice_session', 'ended', { sessionId, reason }, user.id); return Boolean(result.rowCount) }
