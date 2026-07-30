import { NextResponse } from 'next/server'
import { CSRF_COOKIE, cookieOptions } from '@/lib/auth/http'
import { randomBytes } from 'node:crypto'
export const runtime = 'nodejs'
export function GET() { const response = NextResponse.json({ ok: true }); response.cookies.set(CSRF_COOKIE, randomBytes(24).toString('base64url'), cookieOptions(7 * 86400, false)); return response }
