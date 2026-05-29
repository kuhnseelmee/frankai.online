import { NextResponse } from 'next/server'
import { getMaxPayloadBytes, readJsonPayload, requireBearerToken } from '@/lib/memory/auth'
import { appendMemoryEvent } from '@/lib/memory/store'

export const runtime = 'nodejs'

const DEFAULT_MAX_PAYLOAD_BYTES = 128 * 1024
const SUPPORTED_EVENT = 'message.received'

type WebhookEnvelope = {
  event?: unknown
  event_type?: unknown
  type?: unknown
  id?: unknown
  message_id?: unknown
  timestamp?: unknown
}

export async function POST(request: Request) {
  const auth = requireBearerToken(request, process.env.HOSTINGER_MAIL_WEBHOOK_SECRET)
  if (!auth.ok) {
    if (!process.env.HOSTINGER_MAIL_WEBHOOK_SECRET) {
      console.error('Hostinger Mail webhook unavailable: HOSTINGER_MAIL_WEBHOOK_SECRET is not configured')
    }
    return auth.response
  }

  const maxPayloadBytes = getMaxPayloadBytes('HOSTINGER_MAIL_WEBHOOK_MAX_BYTES', DEFAULT_MAX_PAYLOAD_BYTES)
  const parsed = await readJsonPayload<WebhookEnvelope>(request, maxPayloadBytes)
  if (!parsed.ok) {
    return parsed.response
  }

  const payload = parsed.payload
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

  if (process.env.MEMORY_INGEST_FROM_HOSTINGER_MAIL === 'true') {
    await appendMemoryEvent({
      source: 'hostinger-mail',
      kind: 'message.received',
      externalId: eventId,
      occurredAt: typeof payload.timestamp === 'string' ? payload.timestamp : undefined,
      privacy: 'private',
      metadata: {
        event: typeof suppliedEvent === 'string' ? suppliedEvent : SUPPORTED_EVENT
      }
    })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
