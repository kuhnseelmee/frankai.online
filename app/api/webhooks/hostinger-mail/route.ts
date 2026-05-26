import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_PAYLOAD_BYTES = 128 * 1024
const SUPPORTED_EVENT = 'message.received'

type WebhookEnvelope = {
  event?: unknown
  event_type?: unknown
  type?: unknown
  id?: unknown
  message_id?: unknown
  timestamp?: unknown
}

function constantTimeMatches(received: string, expected: string): boolean {
  const receivedBytes = Buffer.from(received)
  const expectedBytes = Buffer.from(expected)

  if (receivedBytes.length !== expectedBytes.length) {
    return false
  }

  return timingSafeEqual(receivedBytes, expectedBytes)
}

function unauthorised() {
  return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
}

export async function POST(request: Request) {
  const secret = process.env.HOSTINGER_MAIL_WEBHOOK_SECRET
  if (!secret) {
    console.error('Hostinger Mail webhook unavailable: HOSTINGER_MAIL_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 })
  }

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return unauthorised()
  }

  const token = authorization.slice('Bearer '.length)
  if (!constantTimeMatches(token, secret)) {
    return unauthorised()
  }

  const declaredSize = Number(request.headers.get('content-length') || '0')
  if (Number.isFinite(declaredSize) && declaredSize > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  const rawPayload = await request.text()
  if (Buffer.byteLength(rawPayload, 'utf8') > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let payload: WebhookEnvelope
  try {
    payload = JSON.parse(rawPayload) as WebhookEnvelope
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const suppliedEvent =
    typeof payload.event === 'string'
      ? payload.event
      : typeof payload.event_type === 'string'
        ? payload.event_type
        : payload.type
  if (typeof suppliedEvent === 'string' && suppliedEvent !== SUPPORTED_EVENT) {
    return NextResponse.json({ error: 'Unsupported webhook event' }, { status: 422 })
  }

  const eventId =
    typeof payload.id === 'string'
      ? payload.id
      : typeof payload.message_id === 'string'
        ? payload.message_id
        : 'not-provided'

  console.info('Hostinger Mail webhook accepted', {
    event: typeof suppliedEvent === 'string' ? suppliedEvent : SUPPORTED_EVENT,
    eventId,
    receivedAt: new Date().toISOString()
  })

  return NextResponse.json({ received: true }, { status: 200 })
}
