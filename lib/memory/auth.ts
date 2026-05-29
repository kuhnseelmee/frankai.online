import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

export type AuthResult = { ok: true } | { ok: false; response: NextResponse }

export function constantTimeMatches(received: string, expected: string): boolean {
  const receivedBytes = Buffer.from(received)
  const expectedBytes = Buffer.from(expected)

  if (receivedBytes.length !== expectedBytes.length) {
    return false
  }

  return timingSafeEqual(receivedBytes, expectedBytes)
}

export function requireBearerToken(request: Request, secret: string | undefined): AuthResult {
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Endpoint is not configured' }, { status: 503 })
    }
  }

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  const token = authorization.slice('Bearer '.length)
  if (!constantTimeMatches(token, secret)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  return { ok: true }
}

export function getMaxPayloadBytes(envName: string, fallbackBytes: number): number {
  const configured = Number(process.env[envName])
  if (!Number.isFinite(configured) || configured <= 0) {
    return fallbackBytes
  }

  return Math.min(configured, 1024 * 1024)
}

export async function readJsonPayload<T>(
  request: Request,
  maxPayloadBytes: number
): Promise<{ ok: true; payload: T } | { ok: false; response: NextResponse }> {
  const declaredSize = Number(request.headers.get('content-length') || '0')
  if (Number.isFinite(declaredSize) && declaredSize > maxPayloadBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
  }

  const rawPayload = await request.text()
  if (Buffer.byteLength(rawPayload, 'utf8') > maxPayloadBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
  }

  try {
    return { ok: true, payload: JSON.parse(rawPayload) as T }
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }
  }
}
