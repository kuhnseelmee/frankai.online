import { NextResponse } from 'next/server'
import { csrfOk, requireUser } from '@/lib/auth/http'
import { beginSetup, totpUri } from '@/lib/auth/mfa'
import { audit } from '@/lib/auth/store'
import { allowRequest } from '@/lib/auth/rate-limit'
import QRCode from 'qrcode'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (auth.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const limit = await allowRequest(request, 'mfa_challenge', auth.user!.id); if (!limit.allowed) return NextResponse.json({ error: 'Too many MFA attempts.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }); try { const secret = await beginSetup(auth.user!.id); const uri = totpUri(auth.user!.email, secret); const qrCode = await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 2, width: 280 }); await audit('admin_mfa_setup', 'success', {}, auth.user!.id); return NextResponse.json({ secret, uri, qrCode }) } catch (error) { console.error('MFA setup failed:', error instanceof Error ? error.message : 'unknown error'); return NextResponse.json({ error: 'MFA is not configured.' }, { status: 503 }) } }
