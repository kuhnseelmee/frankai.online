import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type {
  JsonObject,
  JsonValue,
  MemoryIndex,
  MemoryIndexEntry,
  MemorySearchPayload,
  StoredMemoryEvent
} from './types'
import { getMemoryEventsFile } from './store'

const DEFAULT_MEMORY_INDEX_DIR = '/var/lib/frankai-site/memory-index'
const INDEX_FILE = 'index.json'
const MAX_QUERY_LENGTH = 256
const MAX_LIMIT = 25
const DEFAULT_LIMIT = 5
const MAX_INDEX_TEXT_CHARS = 4000
const MAX_EXCERPT_CHARS = 320
const SENSITIVE_METADATA_KEYS = new Set([
  'body',
  'content',
  'email_body',
  'html',
  'message',
  'raw',
  'raw_body',
  'text'
])
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'was',
  'with'
])

export type MemorySearchResult = {
  id: string
  score: number
  excerpt?: string
  citation: {
    id: string
    source: string
    kind: string
    receivedAt: string
    occurredAt?: string
    externalId?: string
    privacy?: StoredMemoryEvent['privacy']
    metadata?: JsonObject
  }
}

export type MemorySearchResponse = {
  query: string
  count: number
  builtAt: string
  sourceFile: string
  results: MemorySearchResult[]
}

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cleanString(value: string): string {
  return value.trim()
}

function isStoredMemoryEvent(value: unknown): value is StoredMemoryEvent {
  if (!isJsonObject(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    cleanString(value.id).length > 0 &&
    typeof value.receivedAt === 'string' &&
    cleanString(value.receivedAt).length > 0 &&
    typeof value.source === 'string' &&
    cleanString(value.source).length > 0 &&
    typeof value.kind === 'string' &&
    cleanString(value.kind).length > 0
  )
}

export function getMemoryIndexDir(): string {
  return process.env.MEMORY_INDEX_DIR || DEFAULT_MEMORY_INDEX_DIR
}

export function getMemoryIndexFile(): string {
  return join(getMemoryIndexDir(), INDEX_FILE)
}

export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function tokenize(value: string): string[] {
  const normalized = normalizeForSearch(value)
  if (!normalized) {
    return []
  }

  return normalized
    .split(/\s+/)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term))
}

function countTerms(value: string): Record<string, number> {
  const terms: Record<string, number> = {}
  for (const term of tokenize(value)) {
    terms[term] = (terms[term] || 0) + 1
  }
  return terms
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value
  }

  return `${value.slice(0, maxChars - 1).trim()}...`
}

function jsonValueToSearchText(value: JsonValue): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(jsonValueToSearchText).join(' ')
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => !SENSITIVE_METADATA_KEYS.has(key.toLowerCase()))
      .map(([, nested]) => jsonValueToSearchText(nested))
      .join(' ')
  }
  return ''
}

function sanitizeMetadata(metadata: JsonObject | undefined): JsonObject | undefined {
  if (!metadata) {
    return undefined
  }

  const safeEntries = Object.entries(metadata).filter(([key, value]) => {
    if (SENSITIVE_METADATA_KEYS.has(key.toLowerCase())) {
      return false
    }
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    )
  })

  if (safeEntries.length === 0) {
    return undefined
  }

  return Object.fromEntries(
    safeEntries.map(([key, value]) => [
      key,
      typeof value === 'string' ? truncate(value, 200) : value
    ])
  ) as JsonObject
}

function buildSearchableText(event: StoredMemoryEvent): string {
  const parts = [
    event.source,
    event.kind,
    event.externalId || '',
    event.occurredAt || '',
    event.receivedAt,
    typeof event.text === 'string' ? event.text : '',
    event.metadata ? jsonValueToSearchText(event.metadata) : ''
  ]

  return truncate(parts.filter(Boolean).join(' '), MAX_INDEX_TEXT_CHARS)
}

export function buildMemoryIndex(events: StoredMemoryEvent[], sourceFile = getMemoryEventsFile()): MemoryIndex {
  const entries: MemoryIndexEntry[] = events.map((event) => {
    const searchableText = buildSearchableText(event)
    return {
      id: event.id,
      receivedAt: event.receivedAt,
      source: event.source,
      kind: event.kind,
      occurredAt: event.occurredAt,
      externalId: event.externalId,
      privacy: event.privacy,
      text: typeof event.text === 'string' ? truncate(event.text, MAX_INDEX_TEXT_CHARS) : undefined,
      metadata: sanitizeMetadata(event.metadata),
      searchableText,
      terms: countTerms(searchableText)
    }
  })

  return {
    version: 1,
    builtAt: new Date().toISOString(),
    sourceFile,
    eventCount: events.length,
    skippedCount: 0,
    entries
  }
}

export async function readMemoryEventsFromQueue(
  sourceFile = getMemoryEventsFile()
): Promise<{ events: StoredMemoryEvent[]; skippedCount: number }> {
  let raw = ''
  try {
    raw = await readFile(sourceFile, 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return { events: [], skippedCount: 0 }
    }
    throw error
  }

  const events: StoredMemoryEvent[] = []
  let skippedCount = 0
  for (const line of raw.split('\n')) {
    if (!line.trim()) {
      continue
    }

    try {
      const parsed = JSON.parse(line) as unknown
      if (isStoredMemoryEvent(parsed)) {
        events.push(parsed)
      } else {
        skippedCount += 1
      }
    } catch {
      skippedCount += 1
    }
  }

  return { events, skippedCount }
}

export async function rebuildMemoryIndex(): Promise<MemoryIndex> {
  const sourceFile = getMemoryEventsFile()
  const { events, skippedCount } = await readMemoryEventsFromQueue(sourceFile)
  const index = buildMemoryIndex(events, sourceFile)
  index.skippedCount = skippedCount

  const indexFile = getMemoryIndexFile()
  await mkdir(dirname(indexFile), { recursive: true, mode: 0o750 })

  const tempFile = `${indexFile}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempFile, `${JSON.stringify(index, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600
  })
  await rename(tempFile, indexFile)

  return index
}

export async function readMemoryIndex(indexFile = getMemoryIndexFile()): Promise<MemoryIndex> {
  const raw = await readFile(indexFile, 'utf8')
  const parsed = JSON.parse(raw) as MemoryIndex
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error('Invalid memory index')
  }
  return parsed
}

export function validateMemorySearchPayload(
  payload: unknown
): { ok: true; value: Required<MemorySearchPayload> } | { ok: false; error: string } {
  if (!isJsonObject(payload)) {
    return { ok: false, error: 'Invalid payload' }
  }

  const allowedKeys = new Set(['query', 'limit'])
  for (const key of Object.keys(payload)) {
    if (!allowedKeys.has(key)) {
      return { ok: false, error: `Unsupported field: ${key}` }
    }
  }

  if (typeof payload.query !== 'string' || cleanString(payload.query).length === 0) {
    return { ok: false, error: 'query is required' }
  }

  const query = cleanString(payload.query)
  if (query.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: `query must be ${MAX_QUERY_LENGTH} characters or fewer` }
  }

  let limit = DEFAULT_LIMIT
  if (payload.limit !== undefined) {
    const requestedLimit = payload.limit
    if (
      typeof requestedLimit !== 'number' ||
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > MAX_LIMIT
    ) {
      return { ok: false, error: `limit must be an integer from 1 to ${MAX_LIMIT}` }
    }
    limit = requestedLimit
  }

  return { ok: true, value: { query, limit } }
}

function scoreEntry(entry: MemoryIndexEntry, queryTerms: string[], normalizedQuery: string): number {
  let score = 0
  for (const term of queryTerms) {
    score += entry.terms[term] || 0
    if (entry.source.toLowerCase() === term || entry.kind.toLowerCase() === term) {
      score += 2
    }
  }

  if (normalizedQuery && normalizeForSearch(entry.searchableText).includes(normalizedQuery)) {
    score += Math.max(2, queryTerms.length)
  }

  return score
}

function makeExcerpt(entry: MemoryIndexEntry): string | undefined {
  const sourceText = entry.text || entry.searchableText
  const normalized = sourceText.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return undefined
  }
  return truncate(normalized, MAX_EXCERPT_CHARS)
}

export function searchMemoryIndex(
  index: MemoryIndex,
  payload: Required<MemorySearchPayload>
): MemorySearchResponse {
  const queryTerms = Array.from(new Set(tokenize(payload.query)))
  const normalizedQuery = normalizeForSearch(payload.query)

  const results = index.entries
    .map((entry) => ({ entry, score: scoreEntry(entry, queryTerms, normalizedQuery) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return b.entry.receivedAt.localeCompare(a.entry.receivedAt)
    })
    .slice(0, payload.limit)
    .map(({ entry, score }) => ({
      id: entry.id,
      score,
      excerpt: makeExcerpt(entry),
      citation: {
        id: entry.id,
        source: entry.source,
        kind: entry.kind,
        receivedAt: entry.receivedAt,
        occurredAt: entry.occurredAt,
        externalId: entry.externalId,
        privacy: entry.privacy,
        metadata: entry.metadata
      }
    }))

  return {
    query: payload.query,
    count: results.length,
    builtAt: index.builtAt,
    sourceFile: index.sourceFile,
    results
  }
}
