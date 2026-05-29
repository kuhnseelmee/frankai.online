export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type JsonObject = { [key: string]: JsonValue }

export type MemoryIngestPayload = {
  source: string
  kind: string
  text?: string
  occurredAt?: string
  externalId?: string
  privacy?: 'public' | 'internal' | 'private' | 'restricted'
  metadata?: JsonObject
}

export type StoredMemoryEvent = MemoryIngestPayload & {
  id: string
  receivedAt: string
}

export type MemoryIndexEntry = {
  id: string
  receivedAt: string
  source: string
  kind: string
  occurredAt?: string
  externalId?: string
  privacy?: MemoryIngestPayload['privacy']
  text?: string
  metadata?: JsonObject
  searchableText: string
  terms: Record<string, number>
}

export type MemoryIndex = {
  version: 1
  builtAt: string
  sourceFile: string
  eventCount: number
  skippedCount: number
  entries: MemoryIndexEntry[]
}

export type MemorySearchPayload = {
  query: string
  limit?: number
}
