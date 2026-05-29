#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const DEFAULT_MEMORY_INGEST_DIR = '/var/lib/frankai-site/memory-ingest'
const DEFAULT_MEMORY_INDEX_DIR = '/var/lib/frankai-site/memory-index'
const EVENT_FILE = 'events.jsonl'
const INDEX_FILE = 'index.json'
const MAX_INDEX_TEXT_CHARS = 4000
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

function getMemoryEventsFile() {
  return join(process.env.MEMORY_INGEST_DIR || DEFAULT_MEMORY_INGEST_DIR, EVENT_FILE)
}

function getMemoryIndexFile() {
  return join(process.env.MEMORY_INDEX_DIR || DEFAULT_MEMORY_INDEX_DIR, INDEX_FILE)
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isStoredMemoryEvent(value) {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    value.id.trim() &&
    typeof value.receivedAt === 'string' &&
    value.receivedAt.trim() &&
    typeof value.source === 'string' &&
    value.source.trim() &&
    typeof value.kind === 'string' &&
    value.kind.trim()
  )
}

function truncate(value, maxChars) {
  if (value.length <= maxChars) {
    return value
  }
  return `${value.slice(0, maxChars - 1).trim()}...`
}

function normalizeForSearch(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenize(value) {
  const normalized = normalizeForSearch(value)
  if (!normalized) {
    return []
  }
  return normalized.split(/\s+/).filter((term) => term.length > 1 && !STOP_WORDS.has(term))
}

function countTerms(value) {
  const terms = {}
  for (const term of tokenize(value)) {
    terms[term] = (terms[term] || 0) + 1
  }
  return terms
}

function jsonValueToSearchText(value) {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(jsonValueToSearchText).join(' ')
  }
  if (isObject(value)) {
    return Object.entries(value)
      .filter(([key]) => !SENSITIVE_METADATA_KEYS.has(key.toLowerCase()))
      .map(([, nested]) => jsonValueToSearchText(nested))
      .join(' ')
  }
  return ''
}

function sanitizeMetadata(metadata) {
  if (!isObject(metadata)) {
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
  )
}

function buildSearchableText(event) {
  const parts = [
    event.source,
    event.kind,
    event.externalId || '',
    event.occurredAt || '',
    event.receivedAt,
    typeof event.text === 'string' ? event.text : '',
    isObject(event.metadata) ? jsonValueToSearchText(event.metadata) : ''
  ]

  return truncate(parts.filter(Boolean).join(' '), MAX_INDEX_TEXT_CHARS)
}

async function readMemoryEvents(sourceFile) {
  let raw = ''
  try {
    raw = await readFile(sourceFile, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { events: [], skippedCount: 0 }
    }
    throw error
  }

  const events = []
  let skippedCount = 0
  for (const line of raw.split('\n')) {
    if (!line.trim()) {
      continue
    }
    try {
      const parsed = JSON.parse(line)
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

async function main() {
  const sourceFile = getMemoryEventsFile()
  const indexFile = getMemoryIndexFile()
  const { events, skippedCount } = await readMemoryEvents(sourceFile)
  const entries = events.map((event) => {
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
  const index = {
    version: 1,
    builtAt: new Date().toISOString(),
    sourceFile,
    eventCount: events.length,
    skippedCount,
    entries
  }

  await mkdir(dirname(indexFile), { recursive: true, mode: 0o750 })
  const tempFile = `${indexFile}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempFile, `${JSON.stringify(index, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  await rename(tempFile, indexFile)

  console.log(
    JSON.stringify(
      {
        indexFile,
        sourceFile,
        eventCount: index.eventCount,
        skippedCount: index.skippedCount,
        builtAt: index.builtAt
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
