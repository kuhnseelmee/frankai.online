import { NextResponse } from 'next/server'
import { csrfOk, requireUser, setAccessCookie } from '@/lib/auth/http'
import { checkTotp } from '@/lib/auth/mfa'
import { audit } from '@/lib/auth/store'
import { issueAccessToken, verifyAccessToken } from '@/lib/auth/jwt'
import { authDb } from '@/lib/auth/postgres'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (auth.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const body = await request.json().catch(() => ({})); if (typeof body.code !== 'string' || !await checkTotp(auth.user!.id, body.code)) { await audit('admin_reauth', 'failure', {}, auth.user!.id); return NextResponse.json({ error: 'MFA challenge failed.' }, { status: 401 }) } const token = issueAccessToken(auth.user!, true); const claims = verifyAccessToken(token); if (!claims) return NextResponse.json({ error: 'Unable to establish assurance.' }, { status: 503 }); const maxAge = Number(process.env.ADMIN_REAUTH_MAX_AGE_SECONDS || 600); await authDb().query('INSERT INTO admin_reauth_assurances (jti,user_id,method,expires_at) VALUES ($1,$2,$3,now()+($4 || \' seconds\')::interval)', [claims.jti,auth.user!.id,'totp',maxAge]); const response = NextResponse.json({ ok: true, expiresIn: maxAge }); setAccessCookie(response, token); await audit('admin_reauth', 'success', { method: 'totp' }, auth.user!.id); return response }
