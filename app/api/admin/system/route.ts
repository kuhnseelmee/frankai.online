import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/http'
import { allowRequest } from '@/lib/auth/rate-limit'
export const runtime = 'nodejs'
export async function GET(request: Request) { const auth = await requireAdmin(request); if (auth.response) return auth.response; const limit = await allowRequest(request, 'general_api', auth.user!.id); if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }); return NextResponse.json({ service: 'frankai-site', openaiConfigured: Boolean(process.env.OPENAI_API_KEY), voiceConfigured: false, note: 'Realtime credential issuance is intentionally disabled until configured.' }) }
