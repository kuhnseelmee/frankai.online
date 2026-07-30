import { NextResponse } from 'next/server'
import { csrfOk, requireAdmin, requireRecentAdmin } from '@/lib/auth/http'
import { authDb, withAuthTransaction } from '@/lib/auth/postgres'
import { auditInTransaction, FINAL_ADMINISTRATOR_REQUIRED, lockAdministratorMembership, assertRecoverableAdministrator } from '@/lib/auth/admin'

export const runtime = 'nodejs'
const roles = new Set(['USER', 'ADMIN'])
const statuses = new Set(['ACTIVE', 'DISABLED', 'LOCKED', 'PENDING_VERIFICATION'])

function isFinalAdminError(error: unknown) { return error instanceof Error && error.name === FINAL_ADMINISTRATOR_REQUIRED }
function publicFields(row: Record<string, unknown>) { return { id: row.id, email: row.email, displayName: row.display_name, role: row.role, status: row.status, emailVerifiedAt: row.email_verified_at, failedLoginCount: row.failed_login_count, lockedUntil: row.locked_until, lastLoginAt: row.last_login_at, passwordChangedAt: row.password_changed_at, mfaRequired: row.mfa_required, mfaEnrolledAt: row.mfa_enrolled_at, createdAt: row.created_at, updatedAt: row.updated_at } }

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request); if (auth.response) return auth.response
  const { id } = await context.params
  const result = await authDb().query('SELECT id,email,display_name,role,status,email_verified_at,failed_login_count,locked_until,last_login_at,password_changed_at,mfa_required,mfa_enrolled_at,created_at,updated_at FROM users WHERE id=$1', [id])
  return result.rowCount ? NextResponse.json({ user: publicFields(result.rows[0]) }) : NextResponse.json({ error: 'User not found.' }, { status: 404 })
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRecentAdmin(request); if (auth.response) return auth.response
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const requestedRole = body.role === undefined ? undefined : String(body.role)
  const requestedStatus = body.status === undefined ? undefined : String(body.status)
  if ((requestedRole !== undefined && !roles.has(requestedRole)) || (requestedStatus !== undefined && !statuses.has(requestedStatus)) || (requestedRole === undefined && requestedStatus === undefined)) return NextResponse.json({ error: 'Only approved role or status fields may be changed.' }, { status: 400 })
  try {
    const user = await withAuthTransaction(async client => {
      await lockAdministratorMembership(client)
      const current = await client.query('SELECT * FROM users WHERE id=$1 FOR UPDATE', [id])
      if (!current.rowCount) throw new Error('USER_NOT_FOUND')
      const row = current.rows[0]
      const role = requestedRole || row.role
      const status = requestedStatus || row.status
      const mfaRequired = role === 'ADMIN' ? true : row.mfa_required
      await client.query('UPDATE users SET role=$2,status=$3,mfa_required=$4,role_version=CASE WHEN role<>$2 THEN role_version+1 ELSE role_version END,security_version=CASE WHEN status<>$3 OR role<>$2 THEN security_version+1 ELSE security_version END,updated_at=now() WHERE id=$1', [id, role, status, mfaRequired])
      if (row.role === 'ADMIN' || role === 'ADMIN') await assertRecoverableAdministrator(client)
      await auditInTransaction(client, auth.user!.id, 'admin_user_changed', 'success', 'user', id, { role: requestedRole, status: requestedStatus })
      const updated = await client.query('SELECT * FROM users WHERE id=$1', [id])
      return updated.rows[0]
    })
    return NextResponse.json({ user: publicFields(user) })
  } catch (error) {
    if (isFinalAdminError(error)) return NextResponse.json({ error: FINAL_ADMINISTRATOR_REQUIRED }, { status: 409 })
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    return NextResponse.json({ error: 'Unable to update user.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRecentAdmin(request); if (auth.response) return auth.response
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const { id } = await context.params
  try {
    await withAuthTransaction(async client => {
      await lockAdministratorMembership(client)
      const current = await client.query('SELECT role FROM users WHERE id=$1 FOR UPDATE', [id])
      if (!current.rowCount) throw new Error('USER_NOT_FOUND')
      await client.query('DELETE FROM users WHERE id=$1', [id])
      if (current.rows[0].role === 'ADMIN') await assertRecoverableAdministrator(client)
      await auditInTransaction(client, auth.user!.id, 'admin_user_deleted', 'success', 'user', id)
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isFinalAdminError(error)) return NextResponse.json({ error: FINAL_ADMINISTRATOR_REQUIRED }, { status: 409 })
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    return NextResponse.json({ error: 'Unable to delete user.' }, { status: 500 })
  }
}
