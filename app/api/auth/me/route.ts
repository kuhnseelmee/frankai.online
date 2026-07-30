import { NextResponse } from 'next/server'
import { accessClaims, authenticatedUser } from '@/lib/auth/http'
import { publicUser } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function GET(request: Request) { const user = await authenticatedUser(request); const claims = accessClaims(request); return user ? NextResponse.json({ user: publicUser(user), mfaRequired: user.mfaRequired, mfaAuthenticated: Boolean(claims?.mfa) }) : NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) }
