import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { csrfOk, requireAdmin } from '@/lib/auth/http'
import { withAuthTransaction } from '@/lib/auth/postgres'
import { hashToken, audit } from '@/lib/auth/store'
import { queueEmail } from '@/lib/auth/email'
export const runtime = 'nodejs'
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const auth = await requireAdmin(request); if (auth.response) return auth.response; if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 }); const { id } = await context.params; const token = randomBytes(32).toString('base64url'); const result = await withAuthTransaction(async client => { const row = await client.query("SELECT email_normalized,role FROM invitations WHERE id=$1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at>now() FOR UPDATE", [id]); if (!row.rowCount) return null; await client.query('UPDATE invitations SET token_hash=$2,last_sent_at=now() WHERE id=$1', [id, hashToken(token)]); return row.rows[0] }); if (!result) return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 }); await queueEmail(result.email_normalized, 'invitation', { invitationId: id, role: result.role, token }); await audit('invitation_resent', 'success', { invitationId: id }, auth.user!.id); return NextResponse.json({ ok: true }) }
