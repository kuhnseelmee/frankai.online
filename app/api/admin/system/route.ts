import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/http'
export const runtime = 'nodejs'
export async function GET(request: Request) { const auth = await requireAdmin(request); return auth.response || NextResponse.json({ service: 'frankai-site', openaiConfigured: Boolean(process.env.OPENAI_API_KEY), voiceConfigured: false, note: 'Realtime credential issuance is intentionally disabled until configured.' }) }
