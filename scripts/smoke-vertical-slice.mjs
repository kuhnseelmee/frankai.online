#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const baseUrl = process.env.FRANKAI_SMOKE_BASE_URL || 'http://127.0.0.1:8081'
const tokenFile = process.env.FRANKAI_API_TOKEN_FILE || 'secrets/api_bearer_token'
const token = readFileSync(tokenFile, 'utf8').trim()

async function check(path, init, expected) {
  const response = await fetch(`${baseUrl}${path}`, init)
  if (response.status !== expected) throw new Error(`${path}: expected ${expected}, received ${response.status}`)
  console.log(`${path} ${response.status}`)
  return response
}

await check('/health/live', undefined, 200)
await check('/health/ready', undefined, 200)
await check('/v1/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'unauthorized check' }) }, 401)
await check('/v1/chat', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Reply with one short sentence.' }) }, 200)
console.log('vertical slice smoke test passed')
