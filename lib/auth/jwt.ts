import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { authConfig } from './config'

export type Claims = { sub: string; role: 'USER' | 'ADMIN'; jti: string; iat: number; nbf: number; exp: number; iss: string; aud: string; typ: 'access'; securityVersion: number; roleVersion: number; mfa: boolean }

function encode(value: unknown) { return Buffer.from(JSON.stringify(value)).toString('base64url') }
function sign(input: string, secret: string) { return createHmac('sha256', secret).update(input).digest('base64url') }

export function issueAccessToken(user: { id: string; role: 'USER' | 'ADMIN'; securityVersion: number; roleVersion: number }, mfa = false) {
  const c = authConfig(); const now = Math.floor(Date.now() / 1000)
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload: Claims = { sub: user.id, role: user.role, jti: randomUUID(), iat: now, nbf: now, exp: now + c.accessTtlSeconds, iss: c.issuer, aud: c.audience, typ: 'access', securityVersion: user.securityVersion, roleVersion: user.roleVersion, mfa }
  const body = `${header}.${encode(payload)}`
  return `${body}.${sign(body, c.accessSecret)}`
}

export function verifyAccessToken(token: string): Claims | null {
  try {
    const c = authConfig(); const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null
    const parsedHeader = JSON.parse(Buffer.from(header, 'base64url').toString())
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Claims
    const now = Math.floor(Date.now() / 1000)
    if (parsedHeader.alg !== 'HS256' || parsedHeader.typ !== 'JWT' || typeof claims.mfa !== 'boolean' || !/^[0-9a-f-]{36}$/i.test(claims.sub) || !/^[0-9a-f-]{36}$/i.test(claims.jti) || !['USER', 'ADMIN'].includes(claims.role) || claims.typ !== 'access' || claims.iss !== c.issuer || claims.aud !== c.audience || !Number.isInteger(claims.iat) || !Number.isInteger(claims.nbf) || !Number.isInteger(claims.exp) || !Number.isInteger(claims.securityVersion) || !Number.isInteger(claims.roleVersion) || claims.iat > now + 30 || claims.nbf > now + 30 || claims.exp <= now || claims.exp - claims.iat > c.accessTtlSeconds + 30) return null
    const expected = Buffer.from(sign(`${header}.${payload}`, c.accessSecret))
    const received = Buffer.from(signature)
    return expected.length === received.length && timingSafeEqual(expected, received) ? claims : null
  } catch { return null }
}
