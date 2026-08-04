import { createHash, randomUUID } from 'crypto'
import { mkdir, appendFile, chmod } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATA_DIR = process.env.CONTACT_ENQUIRY_DIR || '/var/lib/frankai-site/contact'
const ENQUIRY_LOG = path.join(DATA_DIR, 'contact-enquiries.jsonl')
const MAX_BODY_BYTES = 12 * 1024
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5
const interestTypes = new Set(['personal_access', 'workflow_solution', 'partnership', 'investment', 'other'])
const buckets = new Map<string, { count: number; resetAt: number }>()

type ContactPayload = {
  name?: unknown
  email?: unknown
  organisation?: unknown
  interestType?: unknown
  message?: unknown
  consent?: unknown
  website?: unknown
}

function text(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}

function hashIp(ip: string) {
  const salt = process.env.CONTACT_IP_HASH_SALT || process.env.HOSTINGER_MAIL_WEBHOOK_SECRET || 'frankai-contact'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

function rateLimit(key: string) {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  bucket.count += 1
  return bucket.count <= MAX_REQUESTS_PER_WINDOW
}

async function readBoundedJson(request: Request) {
  const body = await request.text()
  if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
    return { ok: false as const, response: NextResponse.json({ error: 'Request is too large.' }, { status: 413 }) }
  }
  try {
    return { ok: true as const, payload: JSON.parse(body) as ContactPayload }
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  }
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request)
  const ipHash = hashIp(clientIp)

  if (!rateLimit(ipHash)) {
    return NextResponse.json({ error: 'Too many enquiries from this connection. Try again later.' }, { status: 429 })
  }

  const parsed = await readBoundedJson(request)
  if (!parsed.ok) return parsed.response

  const payload = parsed.payload
  if (text(payload.website, 200)) {
    return NextResponse.json({ received: true, reference: 'queued' })
  }

  const name = text(payload.name, 120)
  const email = text(payload.email, 160).toLowerCase()
  const organisation = text(payload.organisation, 160)
  const interestType = text(payload.interestType, 60)
  const message = text(payload.message, 1600)

  if (!name || !email || !message || payload.consent !== true) {
    return NextResponse.json({ error: 'Name, email, context and consent are required.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (!interestTypes.has(interestType)) {
    return NextResponse.json({ error: 'Choose a valid interest type.' }, { status: 400 })
  }

  const reference = `FRANK-${randomUUID().slice(0, 8).toUpperCase()}`
  const record = {
    reference,
    receivedAt: new Date().toISOString(),
    source: 'frankai.online/contact',
    name,
    email,
    organisation: organisation || null,
    interestType,
    message,
    consent: true,
    ipHash,
    userAgent: text(request.headers.get('user-agent'), 260) || null
  }

  await mkdir(DATA_DIR, { recursive: true })
  await appendFile(ENQUIRY_LOG, `${JSON.stringify(record)}\n`, { encoding: 'utf8' })
  await chmod(ENQUIRY_LOG, 0o600).catch(() => undefined)

  console.info('FrankAI contact enquiry received', {
    reference,
    interestType,
    hasOrganisation: Boolean(organisation),
    receivedAt: record.receivedAt
  })

  return NextResponse.json({ received: true, reference })
}
