import { NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

export function isPlatformAdminAuthorized(request: Request) {
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-frankai_access=([^;]+)/)?.[1]
  const claims = cookie ? verifyAccessToken(decodeURIComponent(cookie)) : null
  return claims?.role === 'ADMIN'
}

export function requirePlatformAdmin(request: Request) {
  if (!isPlatformAdminAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  return null
}
