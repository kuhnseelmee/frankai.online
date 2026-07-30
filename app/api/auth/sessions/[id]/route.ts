import { NextResponse } from 'next/server'
import { csrfOk, requireUser } from '@/lib/auth/http'
import { sessions, saveSessions, audit } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireUser(request); if (auth.response) return auth.response; if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const { id } = await context.params; const list = await sessions(); const item = list.find(session => session.id === id && session.userId === auth.user!.id && !session.revokedAt); if (!item) return NextResponse.json({ error: 'Session not found.' }, { status: 404 }); item.revokedAt = Date.now(); await saveSessions(list); await audit('session_revoked', 'success', { sessionId: id }, auth.user!.id); return NextResponse.json({ ok: true }) }
