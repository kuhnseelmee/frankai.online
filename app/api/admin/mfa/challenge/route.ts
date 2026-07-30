import { NextResponse } from 'next/server'
import { csrfOk, requireUser, setAccessCookie } from '@/lib/auth/http'
import { checkTotp } from '@/lib/auth/mfa'
import { issueAccessToken } from '@/lib/auth/jwt'
import { audit } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (auth.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const body = await request.json().catch(() => ({})); try { if (!await checkTotp(auth.user!.id, typeof body.code === 'string' ? body.code : '')) return NextResponse.json({ error: 'Invalid MFA code.' }, { status: 401 }); const response = NextResponse.json({ ok: true }); setAccessCookie(response, issueAccessToken(auth.user!, true)); await audit('admin_mfa_challenge', 'success', {}, auth.user!.id); return response } catch { return NextResponse.json({ error: 'MFA is not configured.' }, { status: 503 }) } }
