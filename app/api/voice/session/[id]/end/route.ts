import { NextResponse } from 'next/server'
import { csrfOk, requireUser } from '@/lib/auth/http'
import { endRealtimeCall } from '@/lib/voice/realtime'
export const runtime = 'nodejs'
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireUser(request); if (auth.response) return auth.response; if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const { id } = await context.params; try { return (await endRealtimeCall(auth.user!, id)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Voice session not found.' }, { status: 404 }) } catch { return NextResponse.json({ error: 'Realtime voice is unavailable.' }, { status: 503 }) } }
