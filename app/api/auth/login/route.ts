import { NextResponse } from 'next/server'
import { csrfOk } from '@/lib/auth/http'
import { users, verifyPassword, audit, saveUsers } from '@/lib/auth/store'
import { issueAuthPair } from '@/lib/auth/service'
import { allowRequest } from '@/lib/auth/rate-limit'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const body = await request.json().catch(() => ({})); const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''; const password = typeof body.password === 'string' ? body.password : ''
  const limit = await allowRequest(request, 'login', email)
  if (!limit.allowed) return NextResponse.json({ error: 'Too many sign-in attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
  const list = await users(); const user = list.find(item => item.email === email); const valid = user ? await verifyPassword(password, user.passwordHash) : false
  if (!user || !valid || user.status !== 'ACTIVE' || (user.lockedUntil && user.lockedUntil > Date.now())) { await audit('login', 'failure', { reason: 'invalid_credentials' }); if (user) { user.failedLoginCount += 1; if (user.failedLoginCount >= 5) { user.lockedUntil = Date.now() + 15 * 60 * 1000; user.status = 'LOCKED' } await saveUsers(list) }; return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 }) }
  user.failedLoginCount = 0; user.lockedUntil = null; user.lastLoginAt = new Date().toISOString(); user.updatedAt = user.lastLoginAt; await saveUsers(list); await audit('login', 'success', {}, user.id); return issueAuthPair(user)
}
