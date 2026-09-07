import test from 'node:test'
import assert from 'node:assert/strict'
import { chatRequestSchema, chatSuccessSchema, errorResponseSchema } from '../../packages/contracts/src/chat'

test('shared contracts accept valid chat data and reject oversized messages', () => {
  assert.equal(chatRequestSchema.safeParse({ message: 'hello' }).success, true)
  assert.equal(chatRequestSchema.safeParse({ message: '' }).success, false)
  assert.equal(chatRequestSchema.safeParse({ message: 'x'.repeat(4001) }).success, false)
  assert.equal(chatRequestSchema.safeParse({ message: 'hello', unexpected: true }).success, false)
  assert.equal(chatSuccessSchema.safeParse({ requestId: 'r1', agent: 'frank-core', message: 'ok' }).success, true)
  assert.equal(errorResponseSchema.safeParse({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized', requestId: 'r1' } }).success, true)
})
