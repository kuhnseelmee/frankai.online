import { NextResponse } from 'next/server'
import { getMaxPayloadBytes, readJsonPayload, requireBearerToken } from '@/lib/memory/auth'
import { appendMemoryEvent, validateMemoryIngestPayload } from '@/lib/memory/store'

export const runtime = 'nodejs'

const DEFAULT_MAX_PAYLOAD_BYTES = 128 * 1024

export async function POST(request: Request) {
  const auth = requireBearerToken(request, process.env.MEMORY_INGEST_SECRET)
  if (!auth.ok) {
    if (!process.env.MEMORY_INGEST_SECRET) {
      console.error('Memory ingest unavailable: MEMORY_INGEST_SECRET is not configured')
    }
    return auth.response
  }

  const maxPayloadBytes = getMaxPayloadBytes('MEMORY_INGEST_MAX_BYTES', DEFAULT_MAX_PAYLOAD_BYTES)
  const parsed = await readJsonPayload<unknown>(request, maxPayloadBytes)
  if (!parsed.ok) {
    return parsed.response
  }

  const validated = validateMemoryIngestPayload(parsed.payload)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const event = await appendMemoryEvent(validated.value)

  console.info('Memory ingest event accepted', {
    id: event.id,
    source: event.source,
    kind: event.kind,
    receivedAt: event.receivedAt
  })

  return NextResponse.json({ received: true, id: event.id }, { status: 202 })
}
