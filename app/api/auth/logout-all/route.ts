import { NextResponse } from 'next/server'
import { csrfOk, requireUser, clearAuthCookies } from '@/lib/auth/http'
import { sessions, saveSessions, audit } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const list = await sessions(); list.filter(item => item.userId === auth.user!.id && !item.revokedAt).forEach(item => { item.revokedAt = Date.now() }); await saveSessions(list); await audit('logout_all', 'success', {}, auth.user!.id); const response = NextResponse.json({ ok: true }); clearAuthCookies(response); return response }
