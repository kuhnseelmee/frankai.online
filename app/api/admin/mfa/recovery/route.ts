import { NextResponse } from 'next/server'
import { csrfOk, requireUser, setAccessCookie } from '@/lib/auth/http'
import { consumeRecoveryCode } from '@/lib/auth/mfa'
import { issueAccessToken } from '@/lib/auth/jwt'
import { audit } from '@/lib/auth/store'
import { allowRequest } from '@/lib/auth/rate-limit'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (auth.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const limit = await allowRequest(request, 'mfa_recovery', auth.user!.id); if (!limit.allowed) return NextResponse.json({ error: 'Too many recovery attempts.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }); const body = await request.json().catch(() => ({})); if (!await consumeRecoveryCode(auth.user!.id, typeof body.code === 'string' ? body.code : '')) return NextResponse.json({ error: 'Invalid recovery code.' }, { status: 401 }); await audit('admin_mfa_recovery_used', 'success', {}, auth.user!.id); const response = NextResponse.json({ ok: true }); setAccessCookie(response, issueAccessToken(auth.user!, true)); return response }
