import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const inventory = JSON.parse(readFileSync(new URL('../docs/admin-route-security.json', import.meta.url), 'utf8')) as { routes: Array<Record<string, unknown>> }

test('administrator route inventory has complete sensitive controls', () => {
  assert.ok(inventory.routes.length >= 20)
  for (const route of inventory.routes) {
    assert.equal(typeof route.method, 'string')
    assert.equal(typeof route.path, 'string')
    assert.equal(route.authentication, 'session')
    assert.equal(route.role, 'ADMIN')
    const bootstrapMfaRoute = String(route.path).includes('/mfa/') || route.path === '/api/admin/reauth/challenge'
    if (!bootstrapMfaRoute) assert.equal(route.mfa, true)
    if (route.method !== 'GET') {
      assert.equal(route.csrf, true, `${route.method} ${route.path} missing CSRF`)
      assert.equal(route.origin, true, `${route.method} ${route.path} missing Origin validation`)
      assert.ok(route.rateLimit, `${route.method} ${route.path} missing rate limit`)
      assert.ok(route.audit, `${route.method} ${route.path} missing audit action`)
    }
  }
})
