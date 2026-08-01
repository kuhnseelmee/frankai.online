import { NextResponse } from 'next/server'
import { getMaxPayloadBytes, readJsonPayload } from '@/lib/memory/auth'
import { csrfOk, requireAdmin, requireRecentAdmin } from '@/lib/auth/http'
import { allowRequest } from '@/lib/auth/rate-limit'
import { publishPlatformConfig, readPlatformConfig, savePlatformDraft } from '@/lib/platform/store'
import { PlatformValidationError } from '@/lib/platform/validation'

export const runtime = 'nodejs'
const DEFAULT_MAX_PAYLOAD_BYTES = 256 * 1024
const APPROVAL_PHRASE = 'APPROVE FRANKAI PLATFORM CHANGES'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response
  const limit = await allowRequest(request, 'general_api', auth.user!.id)
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
  return NextResponse.json(await readPlatformConfig())
}

export async function PUT(request: Request) {
  const auth = await requireRecentAdmin(request)
  if (auth.response) return auth.response
  const limit = await allowRequest(request, 'admin_sensitive_action', auth.user!.id)
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const parsed = await readJsonPayload<unknown>(request, getMaxPayloadBytes('FRANKAI_PLATFORM_ADMIN_MAX_BYTES', DEFAULT_MAX_PAYLOAD_BYTES))
  if (!parsed.ok) return parsed.response
  try {
    return NextResponse.json(await savePlatformDraft(parsed.payload))
  } catch (error) {
    if (error instanceof PlatformValidationError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error('Platform draft save failed', error)
    return NextResponse.json({ error: 'Failed to save platform draft' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireRecentAdmin(request)
  if (auth.response) return auth.response
  const limit = await allowRequest(request, 'admin_sensitive_action', auth.user!.id)
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
  if (!csrfOk(request)) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  const parsed = await readJsonPayload<{ approvalPhrase?: unknown; approvalNote?: unknown; publishedBy?: unknown }>(request, getMaxPayloadBytes('FRANKAI_PLATFORM_ADMIN_MAX_BYTES', DEFAULT_MAX_PAYLOAD_BYTES))
  if (!parsed.ok) return parsed.response
  const approvalPhrase = typeof parsed.payload.approvalPhrase === 'string' ? parsed.payload.approvalPhrase.trim() : ''
  const approvalNote = typeof parsed.payload.approvalNote === 'string' ? parsed.payload.approvalNote.trim() : ''
  const publishedBy = typeof parsed.payload.publishedBy === 'string' && parsed.payload.publishedBy.trim() ? parsed.payload.publishedBy.trim() : 'platform-admin'
  if (approvalPhrase !== APPROVAL_PHRASE || approvalNote.length < 20) return NextResponse.json({ error: 'Approval phrase mismatch or note too short (minimum 20 characters).' }, { status: 400 })
  try {
    return NextResponse.json(await publishPlatformConfig(publishedBy))
  } catch (error) {
    console.error('Platform publish failed', error)
    return NextResponse.json({ error: 'Failed to publish platform config' }, { status: 500 })
  }
}
