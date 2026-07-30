import { NextResponse } from 'next/server'
import { csrfOk, requireAdmin } from '@/lib/auth/http'
import { authDb } from '@/lib/auth/postgres'
import { audit } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireAdmin(request); if (auth.response) return auth.response; if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const { id } = await context.params; const result = await authDb().query('UPDATE invitations SET revoked_at=now() WHERE id=$1 AND used_at IS NULL AND revoked_at IS NULL RETURNING id', [id]); if (!result.rowCount) return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 }); await audit('invitation_revoked', 'success', { invitationId: id }, auth.user!.id); return NextResponse.json({ ok: true }) }
