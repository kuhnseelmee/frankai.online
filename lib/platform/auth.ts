import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

function platformAdminToken() {
  return process.env.FRANKAI_PLATFORM_ADMIN_TOKEN || process.env.MEMORY_INGEST_SECRET || ''
}

function constantTimeMatches(received: string, expected: string) {
  const left = Buffer.from(received)
  const right = Buffer.from(expected)
  if (left.length !== right.length) {
    return false
  }

  return timingSafeEqual(left, right)
}

function getBasicPassword(authorization: string) {
  if (!authorization.startsWith('Basic ')) {
    return null
  }

  try {
    const decoded = Buffer.from(authorization.slice('Basic '.length), 'base64').toString('utf8')
    const separator = decoded.indexOf(':')
    if (separator === -1) {
      return null
    }

    return decoded.slice(separator + 1)
  } catch {
    return null
  }
}

export function isPlatformAdminAuthorized(request: Request) {
  const expected = platformAdminToken()
  if (!expected) {
    return false
  }

  const authorization = request.headers.get('authorization') || ''
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null
  const basicPassword = getBasicPassword(authorization)
  const received = bearer || basicPassword

  return Boolean(received && constantTimeMatches(received, expected))
}

export function requirePlatformAdmin(request: Request) {
  if (!platformAdminToken()) {
    return NextResponse.json({ error: 'Platform admin is not configured' }, { status: 503 })
  }

  if (!isPlatformAdminAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="FrankAI Platform"'
        }
      }
    )
  }

  return null
}
