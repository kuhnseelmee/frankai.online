import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createApiServer } from '../../services/api/src/server'
import { classifyOpenAiUpstreamError, createOrchestratorServer, extractOpenAiDiagnostic } from '../../services/orchestrator/src/server'
import { createOpenAiModelRunner } from '../../agents/frank-core/src/agent'

const openApps: { close: () => Promise<void> }[] = []
afterEach(async () => {
  while (openApps.length) await openApps.pop()!.close()
})

function bridge(orchestrator: Awaited<ReturnType<typeof createOrchestratorServer>>) {
  return async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const response = await orchestrator.inject({
      method: init?.method ?? 'GET',
      url: url.pathname,
      headers: Object.fromEntries(new Headers(init?.headers).entries()),
      payload: init?.body?.toString(),
    })
    return new Response(response.body, { status: response.statusCode, headers: { 'content-type': 'application/json' } })
  }
}

test('API-to-orchestrator integration works with a mocked model', async () => {
  let modelCalls = 0
  const orchestrator = await createOrchestratorServer({
    bearerToken: 'test-token',
    modelRunner: async (request) => {
      modelCalls += 1
      return {
        requestId: request.requestId,
        conversationId: request.conversationId,
        agent: 'frank-core' as const,
        message: `Frank Core received your request: ${request.message}`,
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      }
    },
  })
  const api = createApiServer({ bearerToken: 'test-token', fetchImpl: bridge(orchestrator) })
  openApps.push(orchestrator, api)

  const unauthorized = await api.inject({ method: 'POST', url: '/v1/chat', payload: { message: 'hello' } })
  assert.equal(unauthorized.statusCode, 401)
  assert.equal(modelCalls, 0)

  const invalid = await api.inject({ method: 'POST', url: '/v1/chat', headers: { authorization: 'Bearer test-token' }, payload: { message: '' } })
  assert.equal(invalid.statusCode, 400)

  const response = await api.inject({ method: 'POST', url: '/v1/chat', headers: { authorization: 'Bearer test-token' }, payload: { message: 'Turn this into a next step.' } })
  assert.equal(response.statusCode, 200)
  assert.equal(modelCalls, 1)
  assert.equal(JSON.parse(response.body).agent, 'frank-core')
  assert.match(JSON.parse(response.body).message, /Frank Core received/)
})

test('orchestrator normalizes missing secret and timeout failures', async () => {
  const missing = await createOrchestratorServer({ bearerToken: 'test-token', keyFile: '/tmp/frankai-no-such-openai-key', promptFile: 'agents/frank-core/prompt.md' })
  openApps.push(missing)
  const missingResponse = await missing.inject({ method: 'POST', url: '/internal/run', headers: { authorization: 'Bearer test-token' }, payload: { requestId: 'r1', message: 'hello' } })
  assert.equal(missingResponse.statusCode, 503)
  assert.equal(JSON.parse(missingResponse.body).error.code, 'MODEL_SECRET_MISSING')

  const timedOut = await createOrchestratorServer({ bearerToken: 'test-token', modelRunner: async () => { const error = new Error('timeout'); error.name = 'TimeoutError'; throw error } })
  openApps.push(timedOut)
  const timeoutResponse = await timedOut.inject({ method: 'POST', url: '/internal/run', headers: { authorization: 'Bearer test-token' }, payload: { requestId: 'r2', message: 'hello' } })
  assert.equal(timeoutResponse.statusCode, 504)
  assert.equal(JSON.parse(timeoutResponse.body).error.code, 'MODEL_TIMEOUT')

  const failed = await createOrchestratorServer({ bearerToken: 'test-token', modelRunner: async () => { throw new Error('provider failure') } })
  openApps.push(failed)
  const failedResponse = await failed.inject({ method: 'POST', url: '/internal/run', headers: { authorization: 'Bearer test-token' }, payload: { requestId: 'r3', message: 'hello' } })
  assert.equal(failedResponse.statusCode, 502)
  assert.equal(JSON.parse(failedResponse.body).error.code, 'MODEL_FAILURE')
})

test('orchestrator rejects unauthorized internal calls before model work', async () => {
  let modelCalls = 0
  const orchestrator = await createOrchestratorServer({
    bearerToken: 'test-token',
    modelRunner: async (request) => {
      modelCalls += 1
      return { requestId: request.requestId, agent: 'frank-core' as const, message: 'ok' }
    },
  })
  openApps.push(orchestrator)
  const response = await orchestrator.inject({ method: 'POST', url: '/internal/run', payload: { requestId: 'r4', message: 'hello' } })
  assert.equal(response.statusCode, 401)
  assert.equal(modelCalls, 0)
})

test('Responses runner sends the bounded, supported payload', async () => {
  let payload: Record<string, unknown> | undefined
  const runner = createOpenAiModelRunner({
    client: {
      responses: {
        create: async (request) => {
          payload = request as Record<string, unknown>
          return {
            output_text: 'FRANKAI_SMOKE_OK',
            usage: { input_tokens: 3, output_tokens: 1, total_tokens: 4 },
          } as never
        },
      },
    } as never,
    model: 'gpt-5.6-luna',
    prompt: 'system prompt',
    timeoutMs: 15_000,
    maxOutputTokens: 64,
  })

  const result = await runner({ requestId: 'payload-test', conversationId: 'conversation-test', message: 'Reply with exactly: FRANKAI_SMOKE_OK' })
  assert.equal(result.message, 'FRANKAI_SMOKE_OK')
  assert.deepEqual(payload, {
    model: 'gpt-5.6-luna',
    instructions: 'system prompt',
    input: 'Reply with exactly: FRANKAI_SMOKE_OK',
    max_output_tokens: 64,
    store: false,
  })
})

test('upstream diagnostics classify provider status without exposing provider content', () => {
  assert.equal(classifyOpenAiUpstreamError({ status: 401 }), 'OPENAI_AUTH_FAILURE')
  assert.equal(classifyOpenAiUpstreamError({ status: 404 }), 'OPENAI_MODEL_NOT_FOUND')
  assert.equal(classifyOpenAiUpstreamError({ status: 403 }), 'OPENAI_MODEL_ACCESS_DENIED')
  assert.equal(classifyOpenAiUpstreamError({ status: 429, code: 'insufficient_quota' }), 'OPENAI_QUOTA_FAILURE')
  assert.equal(classifyOpenAiUpstreamError({ status: 429 }), 'OPENAI_RATE_LIMIT')
  assert.equal(classifyOpenAiUpstreamError({ status: 400 }), 'OPENAI_INVALID_REQUEST')
  assert.equal(classifyOpenAiUpstreamError({ status: 503 }), 'OPENAI_UPSTREAM_5XX')
})

test('upstream diagnostics retain only safe provider metadata', () => {
  assert.deepEqual(extractOpenAiDiagnostic({
    status: 429,
    type: 'insufficient_quota',
    code: 'insufficient_quota',
    requestID: 'req_safe',
    error: { message: 'must not be retained' },
  }), {
    diagnosticLayer: 'OPENAI_HTTP_API_ERROR',
    exceptionClass: 'Object',
    exceptionName: 'unknown',
    causeClass: undefined,
    causeCode: undefined,
    httpStatus: 429,
    providerErrorType: 'insufficient_quota',
    providerErrorCode: 'insufficient_quota',
    requestId: 'req_safe',
  })
})

test('failure provenance classifies safe SDK and transport metadata', () => {
  assert.equal(extractOpenAiDiagnostic({ status: 502, type: 'server_error', code: 'server_error', requestID: 'req_safe' }).diagnosticLayer, 'OPENAI_HTTP_API_ERROR')
  assert.equal(extractOpenAiDiagnostic(Object.assign(new Error('connect'), { cause: Object.assign(new Error('dns'), { code: 'ENOTFOUND' }) })).diagnosticLayer, 'OPENAI_DNS_ERROR')
  const diagnostic = extractOpenAiDiagnostic({ status: 400, error: { message: 'secret provider body' } })
  assert.equal('message' in diagnostic, false)
})
