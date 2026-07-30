import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/http'
import { authDb } from '@/lib/auth/postgres'
export const runtime = 'nodejs'
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireAdmin(request); if (auth.response) return auth.response; const { id } = await context.params; const result = await authDb().query('SELECT id,created_at,last_used_at,expires_at,revoked_at FROM refresh_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [id]); return NextResponse.json({ sessions: result.rows }) }
