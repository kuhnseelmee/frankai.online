import { NextResponse } from 'next/server'
import { csrfOk, requireUser } from '@/lib/auth/http'
import { beginSetup, totpUri } from '@/lib/auth/mfa'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (auth.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); try { const secret = await beginSetup(auth.user!.id); return NextResponse.json({ secret, uri: totpUri(auth.user!.email, secret) }) } catch { return NextResponse.json({ error: 'MFA is not configured.' }, { status: 503 }) } }
