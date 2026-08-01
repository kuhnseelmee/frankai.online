import test from 'node:test'
import assert from 'node:assert/strict'
import { assertSafeStagingEnvironment } from './helpers/assert-staging-environment.ts'

test('staging guard rejects production configuration before test data access', () => {
  const keys = ['STAGING_E2E', 'AUTH_DATABASE_ENABLED', 'DATABASE_NAME', 'APP_BASE_URL', 'VOICE_ENABLED', 'DATABASE_URL'] as const
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]))
  try {
    Object.assign(process.env, {
      STAGING_E2E: 'true',
      AUTH_DATABASE_ENABLED: 'true',
      DATABASE_NAME: 'frankai_auth',
      APP_BASE_URL: 'https://frankai.online',
      VOICE_ENABLED: 'false',
      DATABASE_URL: 'postgresql://test@127.0.0.1:6432/frankai_auth',
    })
    assert.throws(() => assertSafeStagingEnvironment(), /frankai_auth_staging|staging application origin/)
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  }
})
