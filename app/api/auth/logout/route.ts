import { NextResponse } from 'next/server'
import { clearAuthCookies, csrfOk, revokeRefreshToken } from '@/lib/auth/http'
import { audit } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const raw = request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-frankai_refresh=([^;]+)/)?.[1]
  await revokeRefreshToken(raw, 'logout')
  await audit('logout', 'success')
  const response = NextResponse.json({ ok: true })
  clearAuthCookies(response)
  return response
}
