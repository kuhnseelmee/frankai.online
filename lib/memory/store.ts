import { randomUUID } from 'node:crypto'
import { mkdir, appendFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { JsonObject, MemoryIngestPayload, StoredMemoryEvent } from './types'

const DEFAULT_MEMORY_INGEST_DIR = '/var/lib/frankai-site/memory-ingest'
const EVENT_FILE = 'events.jsonl'
const PRIVACY_LEVELS = ['public', 'internal', 'private', 'restricted'] as const

type PrivacyLevel = (typeof PRIVACY_LEVELS)[number]

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isValidIsoDate(value: string): boolean {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed)
}

function isPrivacyLevel(value: string): value is PrivacyLevel {
  return PRIVACY_LEVELS.includes(value as PrivacyLevel)
}

function cleanString(value: string): string {
  return value.trim()
}

export function validateMemoryIngestPayload(
  payload: unknown
): { ok: true; value: MemoryIngestPayload } | { ok: false; error: string } {
  if (!isJsonObject(payload)) {
    return { ok: false, error: 'Invalid payload' }
  }

  if (typeof payload.source !== 'string' || cleanString(payload.source).length === 0) {
    return { ok: false, error: 'source is required' }
  }

  if (typeof payload.kind !== 'string' || cleanString(payload.kind).length === 0) {
    return { ok: false, error: 'kind is required' }
  }

  const event: MemoryIngestPayload = {
    source: cleanString(payload.source),
    kind: cleanString(payload.kind)
  }

  if (typeof payload.text === 'string' && cleanString(payload.text).length > 0) {
    event.text = payload.text
  }

  if (typeof payload.occurredAt === 'string') {
    if (!isValidIsoDate(payload.occurredAt)) {
      return { ok: false, error: 'occurredAt must be an ISO date string' }
    }
    event.occurredAt = payload.occurredAt
  }

  if (typeof payload.externalId === 'string' && cleanString(payload.externalId).length > 0) {
    event.externalId = cleanString(payload.externalId)
  }

  if (typeof payload.privacy === 'string') {
    if (!isPrivacyLevel(payload.privacy)) {
      return { ok: false, error: 'privacy is invalid' }
    }
    event.privacy = payload.privacy
  }

  if (payload.metadata !== undefined) {
    if (!isJsonObject(payload.metadata)) {
      return { ok: false, error: 'metadata must be an object' }
    }
    event.metadata = payload.metadata
  }

  return { ok: true, value: event }
}

export function getMemoryIngestDir(): string {
  return process.env.MEMORY_INGEST_DIR || DEFAULT_MEMORY_INGEST_DIR
}

export function getMemoryEventsFile(): string {
  return join(getMemoryIngestDir(), EVENT_FILE)
}

export async function appendMemoryEvent(payload: MemoryIngestPayload): Promise<StoredMemoryEvent> {
  const event: StoredMemoryEvent = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    ...payload
  }

  const ingestDir = getMemoryIngestDir()
  await mkdir(ingestDir, { recursive: true, mode: 0o750 })
  await appendFile(getMemoryEventsFile(), `${JSON.stringify(event)}\n`, {
    encoding: 'utf8',
    mode: 0o600
  })

  return event
}
