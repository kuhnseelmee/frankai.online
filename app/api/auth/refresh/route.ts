import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth/config'
import { csrfOk, setAuthCookies, clearAuthCookies } from '@/lib/auth/http'
import { users, sessions, hashToken, saveSessions, audit, publicUser } from '@/lib/auth/store'
import { issueAccessToken } from '@/lib/auth/jwt'
import { randomBytes, randomUUID } from 'node:crypto'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const raw = request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-frankai_refresh=([^;]+)/)?.[1]
  const list = await sessions()
  const old = raw && list.find(item => item.tokenHash === hashToken(raw))
  const user = old && (await users()).find(item => item.id === old.userId)
  if (!old || !user || old.revokedAt || old.expiresAt <= Date.now() || user.status !== 'ACTIVE') {
    if (old) { list.filter(item => item.tokenFamily === old.tokenFamily).forEach(item => { item.revokedAt = Date.now() }); await saveSessions(list); await audit('refresh_reuse_or_invalid', 'failure', { sessionId: old.id }, old.userId) }
    const response = NextResponse.json({ error: 'Unauthorised' }, { status: 401 }); clearAuthCookies(response); return response
  }
  const refresh = randomBytes(48).toString('base64url'); const id = randomUUID()
  old.revokedAt = Date.now(); old.lastUsedAt = Date.now(); old.replacedBySessionId = id
  list.push({ id, userId: user.id, tokenHash: hashToken(refresh), tokenFamily: old.tokenFamily, expiresAt: Date.now() + authConfig().refreshTtlSeconds * 1000, revokedAt: null, replacedBySessionId: null, createdAt: new Date().toISOString(), lastUsedAt: null })
  await saveSessions(list)
  const response = NextResponse.json({ user: publicUser(user) }); setAuthCookies(response, issueAccessToken(user), refresh); return response
}
