import { randomBytes, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { issueAccessToken } from './jwt'
import { authConfig } from './config'
import { saveSessions, sessions, hashToken, publicUser, type User } from './store'
import { setAuthCookies } from './http'
export async function issueAuthPair(user: User, status = 200, family = randomUUID()) { const c = authConfig(); const refresh = randomBytes(48).toString('base64url'); const list = await sessions(); list.push({ id: randomUUID(), userId: user.id, tokenHash: hashToken(refresh), tokenFamily: family, expiresAt: Date.now() + c.refreshTtlSeconds * 1000, revokedAt: null, replacedBySessionId: null, createdAt: new Date().toISOString(), lastUsedAt: null }); await saveSessions(list); const response = NextResponse.json({ user: publicUser(user) }, { status }); setAuthCookies(response, issueAccessToken(user), refresh); return response }
