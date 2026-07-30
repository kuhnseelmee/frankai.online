import { NextResponse } from 'next/server'
import { csrfOk, requireUser, setAccessCookie } from '@/lib/auth/http'
import { confirmSetup } from '@/lib/auth/mfa'
import { audit } from '@/lib/auth/store'
import { issueAccessToken } from '@/lib/auth/jwt'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (auth.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const body = await request.json().catch(() => ({})); try { const codes = await confirmSetup(auth.user!.id, typeof body.code === 'string' ? body.code : ''); if (!codes) return NextResponse.json({ error: 'Invalid MFA code.' }, { status: 400 }); await audit('admin_mfa_enrolled', 'success', {}, auth.user!.id); const response = NextResponse.json({ recoveryCodes: codes }); setAccessCookie(response, issueAccessToken(auth.user!, true)); return response } catch { return NextResponse.json({ error: 'MFA is not configured.' }, { status: 503 }) } }
