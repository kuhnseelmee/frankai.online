import { NextResponse } from 'next/server'
import { randomBytes, randomUUID } from 'node:crypto'
import { normaliseEmail, hashToken, users, audit } from '@/lib/auth/store'
import { authDb } from '@/lib/auth/postgres'
import { queueEmail } from '@/lib/auth/email'
import { allowRequest } from '@/lib/auth/rate-limit'
export const runtime = 'nodejs'
export async function POST(request: Request) { const limit = await allowRequest(request, 'password_forgot'); if (!limit.allowed) return NextResponse.json({ ok: true }); const body = await request.json().catch(() => ({})); const email = typeof body.email === 'string' ? normaliseEmail(body.email) : ''; const user = (await users()).find(item => item.email === email); if (user) { const token = randomBytes(32).toString('base64url'); await authDb().query('UPDATE password_reset_tokens SET used_at=now() WHERE user_id=$1 AND used_at IS NULL', [user.id]); await authDb().query("INSERT INTO password_reset_tokens (id,user_id,token_hash,expires_at) VALUES ($1,$2,$3,now()+interval '30 minutes')", [randomUUID(), user.id, hashToken(token)]); await queueEmail(user.email, 'password_reset', { token }); await audit('password_reset_requested', 'success', {}, user.id) } return NextResponse.json({ ok: true }) }
