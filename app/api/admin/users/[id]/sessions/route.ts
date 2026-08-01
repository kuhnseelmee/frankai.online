import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/http'
import { authDb } from '@/lib/auth/postgres'
import { allowRequest } from '@/lib/auth/rate-limit'
export const runtime = 'nodejs'
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireAdmin(request); if (auth.response) return auth.response; const limit = await allowRequest(request, 'general_api', auth.user!.id); if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }); const { id } = await context.params; const result = await authDb().query('SELECT id,created_at,last_used_at,expires_at,revoked_at FROM refresh_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [id]); return NextResponse.json({ sessions: result.rows }) }
