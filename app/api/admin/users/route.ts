import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/http'
import { authDb } from '@/lib/auth/postgres'
import { allowRequest } from '@/lib/auth/rate-limit'

export const runtime = 'nodejs'

const statuses = new Set(['ACTIVE', 'DISABLED', 'LOCKED', 'PENDING_VERIFICATION'])
const roles = new Set(['USER', 'ADMIN'])
function safeLimit(value: string | null) { const parsed = Number(value || 25); return Number.isInteger(parsed) ? Math.min(100, Math.max(1, parsed)) : 25 }

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response
  const limit = await allowRequest(request, 'general_api', auth.user!.id)
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
  const url = new URL(request.url)
  const pageSize = safeLimit(url.searchParams.get('pageSize'))
  const page = Math.max(1, Number(url.searchParams.get('page') || 1) || 1)
  const offset = (page - 1) * pageSize
  const status = url.searchParams.get('status') || ''
  const role = url.searchParams.get('role') || ''
  const search = (url.searchParams.get('search') || '').trim().slice(0, 120)
  if ((status && !statuses.has(status)) || (role && !roles.has(role))) return NextResponse.json({ error: 'Invalid user filter.' }, { status: 400 })
  const values: unknown[] = []
  const where: string[] = []
  if (status) { values.push(status); where.push(`status=$${values.length}`) }
  if (role) { values.push(role); where.push(`role=$${values.length}`) }
  if (search) { values.push(`%${search}%`); where.push(`email_normalized ILIKE $${values.length}`) }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const count = await authDb().query(`SELECT count(*)::int AS count FROM users ${clause}`, values)
  values.push(pageSize, offset)
  const result = await authDb().query(`SELECT id,email,display_name,role,status,email_verified_at,failed_login_count,locked_until,last_login_at,password_changed_at,mfa_required,mfa_enrolled_at,created_at,updated_at FROM users ${clause} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values)
  return NextResponse.json({ page, pageSize, total: Number(count.rows[0].count), users: result.rows })
}
