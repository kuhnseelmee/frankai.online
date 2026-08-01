import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/http'
import { authDb } from '@/lib/auth/postgres'
import { allowRequest } from '@/lib/auth/rate-limit'
export const runtime = 'nodejs'
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireAdmin(request); if (auth.response) return auth.response; const rate = await allowRequest(request, 'general_api', auth.user!.id); if (!rate.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }); const { id } = await context.params; const url = new URL(request.url); const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 25))); const result = await authDb().query('SELECT occurred_at,actor_user_id,action,result,target_type,target_id,request_id,user_agent_summary FROM audit_events WHERE target_id=$1 OR actor_user_id=$1 ORDER BY occurred_at DESC LIMIT $2', [id, limit]); return NextResponse.json({ audit: result.rows }) }
