import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth/config'
import { csrfOk, setAuthCookies, clearAuthCookies } from '@/lib/auth/http'
import { users, sessions, hashToken, saveSessions, audit, publicUser, fromUserRow } from '@/lib/auth/store'
import { issueAccessToken } from '@/lib/auth/jwt'
import { withAuthTransaction } from '@/lib/auth/postgres'
import { randomBytes, randomUUID } from 'node:crypto'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const raw = request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-frankai_refresh=([^;]+)/)?.[1]
  if (!raw) return invalidResponse()

  if (process.env.DATABASE_URL && process.env.AUTH_DATABASE_ENABLED === 'true') {
    try {
      const result = await withAuthTransaction(async client => {
        const row = await client.query(`
          SELECT s.id AS session_id, s.token_hash AS session_token_hash,
            s.token_family AS session_token_family, s.expires_at AS session_expires_at,
            s.revoked_at AS session_revoked_at, s.replaced_by_session_id AS session_replaced_by,
            u.* FROM refresh_sessions s
          JOIN users u ON u.id=s.user_id
          WHERE s.token_hash=$1
          FOR UPDATE OF s, u`, [hashToken(decodeURIComponent(raw))])
        if (!row.rowCount) return { valid: false as const, userId: null }
        const session = row.rows[0]
        const user = fromUserRow(session)
        if (session.session_revoked_at || new Date(session.session_expires_at).getTime() <= Date.now() || user.status !== 'ACTIVE') {
          const concurrent = Boolean(session.session_revoked_at && session.session_replaced_by)
          if (!concurrent) await client.query("UPDATE refresh_sessions SET revoked_at=COALESCE(revoked_at,now()),revocation_reason='refresh_reuse_or_invalid' WHERE token_family=$1 AND revoked_at IS NULL", [session.session_token_family])
          await client.query('INSERT INTO audit_events (id,actor_user_id,action,result,target_type,target_id,metadata_json) VALUES ($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), user.id, concurrent ? 'refresh_concurrent_rejected' : 'refresh_reuse_or_invalid', 'failure', 'session', session.session_id, JSON.stringify({ sessionId: session.session_id })])
          return { valid: false as const, userId: user.id }
        }
        const refresh = randomBytes(48).toString('base64url')
        const id = randomUUID()
        await client.query('INSERT INTO refresh_sessions (id,user_id,token_hash,token_family,expires_at) VALUES ($1,$2,$3,$4,now()+($5 || \' seconds\')::interval)', [id, user.id, hashToken(refresh), session.session_token_family, authConfig().refreshTtlSeconds])
        await client.query("UPDATE refresh_sessions SET revoked_at=now(),last_used_at=now(),replaced_by_session_id=$2 WHERE id=$1", [session.session_id, id])
        return { valid: true as const, user, refresh }
      })
      if (!result.valid) return invalidResponse()
      const response = NextResponse.json({ user: publicUser(result.user) })
      setAuthCookies(response, issueAccessToken(result.user), result.refresh)
      return response
    } catch (error) {
      console.error('Postgres refresh transaction failed', error instanceof Error ? error.message : 'unknown error')
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  const list = await sessions()
  const old = list.find(item => item.tokenHash === hashToken(decodeURIComponent(raw)))
  const user = old && (await users()).find(item => item.id === old.userId)
  if (!old || !user || old.revokedAt || old.expiresAt <= Date.now() || user.status !== 'ACTIVE') {
    if (old) { list.filter(item => item.tokenFamily === old.tokenFamily).forEach(item => { item.revokedAt = Date.now() }); await saveSessions(list); await audit('refresh_reuse_or_invalid', 'failure', { sessionId: old.id }, old.userId) }
    return invalidResponse()
  }
  const refresh = randomBytes(48).toString('base64url'); const id = randomUUID()
  old.revokedAt = Date.now(); old.lastUsedAt = Date.now(); old.replacedBySessionId = id
  list.push({ id, userId: user.id, tokenHash: hashToken(refresh), tokenFamily: old.tokenFamily, expiresAt: Date.now() + authConfig().refreshTtlSeconds * 1000, revokedAt: null, replacedBySessionId: null, createdAt: new Date().toISOString(), lastUsedAt: null })
  await saveSessions(list)
  const response = NextResponse.json({ user: publicUser(user) }); setAuthCookies(response, issueAccessToken(user), refresh); return response
}

function invalidResponse() {
  const response = NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  clearAuthCookies(response)
  return response
}
