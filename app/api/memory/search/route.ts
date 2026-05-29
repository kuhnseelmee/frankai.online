import { NextResponse } from 'next/server'
import { getMaxPayloadBytes, readJsonPayload, requireBearerToken } from '@/lib/memory/auth'
import {
  readMemoryIndex,
  searchMemoryIndex,
  validateMemorySearchPayload
} from '@/lib/memory/index'

export const runtime = 'nodejs'

const DEFAULT_MAX_PAYLOAD_BYTES = 16 * 1024

export async function POST(request: Request) {
  const auth = requireBearerToken(request, process.env.MEMORY_INGEST_SECRET)
  if (!auth.ok) {
    if (!process.env.MEMORY_INGEST_SECRET) {
      console.error('Memory search unavailable: MEMORY_INGEST_SECRET is not configured')
    }
    return auth.response
  }

  const maxPayloadBytes = getMaxPayloadBytes('MEMORY_SEARCH_MAX_BYTES', DEFAULT_MAX_PAYLOAD_BYTES)
  const parsed = await readJsonPayload<unknown>(request, maxPayloadBytes)
  if (!parsed.ok) {
    return parsed.response
  }

  const validated = validateMemorySearchPayload(parsed.payload)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  try {
    const index = await readMemoryIndex()
    return NextResponse.json(searchMemoryIndex(index, validated.value), { status: 200 })
  } catch (error) {
    console.error('Memory search index unavailable', error)
    return NextResponse.json(
      { error: 'Memory index is unavailable; rebuild it before searching' },
      { status: 503 }
    )
  }
}
