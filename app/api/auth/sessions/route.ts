import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/http'
import { sessions, hashToken } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function GET(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; const current = request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-frankai_refresh=([^;]+)/)?.[1]; const currentHash = current ? hashToken(current) : ''; const list = await sessions(); return NextResponse.json({ sessions: list.filter(item => item.userId === auth.user!.id && !item.revokedAt && item.expiresAt > Date.now()).map(item => ({ id: item.id, current: item.tokenHash === currentHash, createdAt: item.createdAt, lastUsedAt: item.lastUsedAt, expiresAt: new Date(item.expiresAt).toISOString() })) }) }
