import { NextResponse } from 'next/server'
import { randomBytes, randomUUID } from 'node:crypto'
import { csrfOk, setAuthCookies } from '@/lib/auth/http'
import { authDb, withAuthTransaction } from '@/lib/auth/postgres'
import { authConfig } from '@/lib/auth/config'
import { issueAccessToken } from '@/lib/auth/jwt'
import { allowRequest } from '@/lib/auth/rate-limit'
import { fromUserRow, hashPassword, hashToken, normaliseEmail, publicUser } from '@/lib/auth/store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const limit = await allowRequest(request, 'invite_redeem')
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
  const body = await request.json().catch(() => ({}))
  const token = typeof body.token === 'string' ? body.token : ''
  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 120) : ''
  if (!token || !/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || password.length > 200 || !displayName) return NextResponse.json({ error: 'Invitation details are invalid.' }, { status: 400 })

  try {
    const user = await withAuthTransaction(async client => {
      const invitation = await client.query("SELECT * FROM invitations WHERE token_hash=$1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at>now() FOR UPDATE", [hashToken(token)])
      if (!invitation.rowCount || invitation.rows[0].email_normalized !== email) throw new Error('invalid_invitation')
      const exists = await client.query('SELECT id FROM users WHERE email_normalized=$1', [email])
      if (exists.rowCount) throw new Error('invalid_invitation')
      const id = randomUUID()
      const passwordHash = await hashPassword(password)
      const row = await client.query("INSERT INTO users (id,email,email_normalized,display_name,password_hash,role,status,email_verified_at,password_changed_at,mfa_required) VALUES ($1,$2,$2,$3,$4,$5,'ACTIVE',now(),now(),$6) RETURNING *", [id, email, displayName, passwordHash, invitation.rows[0].role, invitation.rows[0].role === 'ADMIN'])
      await client.query('UPDATE invitations SET used_at=now() WHERE id=$1', [invitation.rows[0].id])
      await client.query('INSERT INTO audit_events (id,actor_user_id,action,result,target_type,target_id,metadata_json) VALUES ($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), id, 'invitation_redeemed', 'success', 'user', id, JSON.stringify({ invitationId: invitation.rows[0].id })])
      return fromUserRow(row.rows[0])
    })
    const refresh = randomBytes(48).toString('base64url')
    await authDb().query('INSERT INTO refresh_sessions (id,user_id,token_hash,token_family,expires_at) VALUES ($1,$2,$3,$4,now()+($5 || \' seconds\')::interval)', [randomUUID(), user.id, hashToken(refresh), randomUUID(), authConfig().refreshTtlSeconds])
    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 })
    setAuthCookies(response, issueAccessToken(user), refresh)
    return response
  } catch {
    return NextResponse.json({ error: 'Invitation cannot be redeemed.' }, { status: 400 })
  }
}
