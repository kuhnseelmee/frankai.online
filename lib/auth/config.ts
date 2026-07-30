import { timingSafeEqual } from 'node:crypto'

const exampleSecrets = new Set(['change-me', 'example', 'secret', 'development-secret'])

export function authConfig() {
  const accessSecret = process.env.JWT_ACCESS_SECRET || ''
  const refreshSecret = process.env.JWT_REFRESH_SECRET || ''
  const production = process.env.NODE_ENV === 'production'
  const missing = [
    ['JWT_ACCESS_SECRET', accessSecret],
    ['JWT_REFRESH_SECRET', refreshSecret]
  ].filter(([, value]) => !value || exampleSecrets.has(value) || value.length < 32).map(([name]) => name)

  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
  if (production && missing.length) throw new Error(`Authentication is not configured: ${missing.join(', ')}`)
  if (production && process.env.AUTH_STORE !== 'postgres') throw new Error('AUTH_STORE must be postgres in production')
  if (production && process.env.AUTH_DATABASE_ENABLED !== 'true') throw new Error('AUTH_DATABASE_ENABLED must be true in production')
  if (production && !process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in production')
  if (production && process.env.COOKIE_SECURE !== 'true') throw new Error('COOKIE_SECURE must be true in production')
  if (!['lax', 'strict', 'none'].includes(sameSite)) throw new Error('COOKIE_SAME_SITE is invalid')
  if (production && sameSite === 'none' && process.env.ALLOWED_ORIGINS === '') throw new Error('SameSite=None requires an origin allowlist')

  return {
    accessSecret: accessSecret || 'development-access-secret-change-me',
    refreshSecret: refreshSecret || 'development-refresh-secret-change-me',
    issuer: process.env.JWT_ISSUER || process.env.APP_BASE_URL || 'https://frankai.online',
    audience: process.env.JWT_AUDIENCE || 'frankai-web',
    accessTtlSeconds: 10 * 60,
    refreshTtlSeconds: 7 * 24 * 60 * 60,
    dataDir: process.env.AUTH_DATA_DIR || '/var/lib/frankai-site/auth',
    cookieSecure: process.env.COOKIE_SECURE !== 'false' && production,
    sameSite: sameSite as 'lax' | 'strict' | 'none',
    signupEnabled: process.env.PUBLIC_SIGNUP_ENABLED === 'true'
    , invitationSignupEnabled: process.env.INVITATION_SIGNUP_ENABLED === 'true'
    , adminReauthMaxAgeSeconds: Number(process.env.ADMIN_REAUTH_MAX_AGE_SECONDS || 600)
    , loginFailureLimit: Number(process.env.LOGIN_FAILURE_LIMIT || 5)
    , loginLockSeconds: Number(process.env.LOGIN_LOCK_SECONDS || 900)
    , loginFailureWindowSeconds: Number(process.env.LOGIN_FAILURE_WINDOW_SECONDS || 900)
  }
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}
