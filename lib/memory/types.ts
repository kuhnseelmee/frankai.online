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
