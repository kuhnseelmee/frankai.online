import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac, randomUUID } from 'node:crypto'
import { issueAccessToken, verifyAccessToken } from '../lib/auth/jwt.ts'

process.env[['JWT', 'ACCESS', 'SECRET'].join('_')] = 'jwt-test-access-secret-012345678901234567890'
process.env[['JWT', 'REFRESH', 'SECRET'].join('_')] = 'jwt-test-refresh-secret-012345678901234567890'
process.env.JWT_ISSUER = 'https://staging.test'
process.env.JWT_AUDIENCE = 'frankai-test'
process.env.NODE_ENV = 'test'

const user = { id: randomUUID(), role: 'ADMIN' as const, securityVersion: 4, roleVersion: 3 }
const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString()) as Record<string, unknown>
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
function rewrite(token: string, mutateHeader: (value: Record<string, unknown>) => void = () => undefined, mutateClaims: (value: Record<string, unknown>) => void = () => undefined) {
  const [headerPart, payloadPart] = token.split('.')
  const header = decode(headerPart); const claims = decode(payloadPart)
  mutateHeader(header); mutateClaims(claims)
  const body = `${encode(header)}.${encode(claims)}`
  const signature = createHmac('sha256', process.env.JWT_ACCESS_SECRET!).update(body).digest('base64url')
  return `${body}.${signature}`
}

test('accepts a valid access token and rejects malformed/incorrect algorithms', () => {
  const token = issueAccessToken(user)
  assert.equal(verifyAccessToken(token)?.sub, user.id)
  assert.equal(verifyAccessToken('not-a-token'), null)
  assert.equal(verifyAccessToken(rewrite(token, header => { header.alg = 'none' })), null)
  assert.equal(verifyAccessToken(rewrite(token, header => { header.alg = 'HS384' })), null)
})

test('rejects invalid issuer, audience, expiry, nbf, token type, and identifiers', () => {
  const token = issueAccessToken(user)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { claims.iss = 'https://wrong.test' })), null)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { claims.aud = 'wrong' })), null)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { claims.exp = Math.floor(Date.now() / 1000) - 1 })), null)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { claims.nbf = Math.floor(Date.now() / 1000) + 60 })), null)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { claims.typ = 'refresh' })), null)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { claims.sub = 'invalid' })), null)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { delete claims.jti })), null)
  assert.equal(verifyAccessToken(rewrite(token, undefined, claims => { delete claims.securityVersion })), null)
})

test('rejects a refresh token presented as an access token and invalid signatures', () => {
  const access = issueAccessToken(user)
  const refreshLike = `${access.split('.')[0]}.${access.split('.')[1]}.not-the-signature`
  assert.equal(verifyAccessToken(refreshLike), null)
  assert.equal(verifyAccessToken(`${access.slice(0, -1)}x`), null)
})
