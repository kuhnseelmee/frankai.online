import { NextResponse } from 'next/server'
import { randomBytes, randomUUID } from 'node:crypto'
import { csrfOk, requireUser } from '@/lib/auth/http'
import { audit, hashToken } from '@/lib/auth/store'
import { authDb } from '@/lib/auth/postgres'
import { queueEmail } from '@/lib/auth/email'
import { allowRequest } from '@/lib/auth/rate-limit'
export const runtime = 'nodejs'
export async function POST(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const limit = await allowRequest(request, 'email_resend', auth.user!.id); if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 }); if (auth.user!.emailVerifiedAt) return NextResponse.json({ ok: true }); const token = randomBytes(32).toString('base64url'); await authDb().query('UPDATE verification_tokens SET used_at=now() WHERE user_id=$1 AND used_at IS NULL', [auth.user!.id]); await authDb().query("INSERT INTO verification_tokens (id,user_id,token_hash,expires_at) VALUES ($1,$2,$3,now()+interval '24 hours')", [randomUUID(), auth.user!.id, hashToken(token)]); await queueEmail(auth.user!.email, 'email_verification', { token }); await audit('email_verification_resent', 'success', {}, auth.user!.id); return NextResponse.json({ ok: true }) }
