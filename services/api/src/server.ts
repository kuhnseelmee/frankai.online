import Fastify, { FastifyInstance } from 'fastify'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import {
  chatRequestSchema,
  chatSuccessSchema,
  ChatSuccess,
  errorResponseSchema,
} from '../../../packages/contracts/src/chat'

export type ApiOptions = {
  bearerToken?: string
  orchestratorUrl?: string
  fetchImpl?: typeof fetch
  orchestratorTimeoutMs?: number
}

const BODY_LIMIT_BYTES = 16 * 1024

function loadToken(path: string): string {
  if (!existsSync(path)) return ''
  return readFileSync(path, 'utf8').trim()
}

function tokenMatches(expected: string, supplied: string): boolean {
  if (!expected || !supplied) return false
  const expectedBytes = Buffer.from(expected)
  const suppliedBytes = Buffer.from(supplied)
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes)
}

function boundedNumber(value: number, fallback: number, minimum: number, maximum: number): number {
  return Number.isFinite(value) ? Math.min(Math.max(value, minimum), maximum) : fallback
}

export function createApiServer(options: ApiOptions = {}): FastifyInstance {
  const token = options.bearerToken ?? loadToken(process.env.API_BEARER_TOKEN_FILE ?? '/run/secrets/api_bearer_token')
  const orchestratorUrl = options.orchestratorUrl ?? process.env.API_ORCHESTRATOR_URL ?? 'http://orchestrator:8080'
  const fetchImpl = options.fetchImpl ?? fetch
  const orchestratorTimeoutMs = boundedNumber(options.orchestratorTimeoutMs ?? Number(process.env.API_ORCHESTRATOR_TIMEOUT_MS ?? 16_000), 16_000, 1_000, 60_000)
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info', redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'], censor: '[REDACTED]' } },
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
    bodyLimit: BODY_LIMIT_BYTES,
    connectionTimeout: 10_000,
    requestTimeout: 20_000,
  })

  app.get('/health/live', async () => ({ status: 'live' }))
  app.get('/health/ready', async (_request, reply) => {
    try {
      const response = await fetchImpl(`${orchestratorUrl}/health/ready`, { signal: AbortSignal.timeout(1_000) })
      if (!response.ok) throw new Error('unready')
      return { status: 'ready' }
    } catch {
      return reply.code(503).send({ status: 'not_ready' })
    }
  })

  app.post('/v1/chat', async (request, reply) => {
    const authorization = request.headers.authorization ?? ''
    const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
    if (!tokenMatches(token, supplied)) {
      return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized', requestId: request.id } })
    }
    const parsed = chatRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'INVALID_REQUEST', message: 'Invalid request data', requestId: request.id } })
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), orchestratorTimeoutMs)
    try {
      const response = await fetchImpl(`${orchestratorUrl}/internal/run`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'x-request-id': request.id },
        body: JSON.stringify({ ...parsed.data, requestId: request.id }),
        signal: controller.signal,
      })
      const payload: unknown = await response.json().catch(() => null)
      if (response.ok) {
        const success = chatSuccessSchema.safeParse(payload)
        if (!success.success) return reply.code(502).send({ error: { code: 'ORCHESTRATOR_UNAVAILABLE', message: 'Unable to complete request', requestId: request.id } })
        return reply.send(success.data as ChatSuccess)
      }
      if (response.status === 503 && errorResponseSchema.safeParse(payload).success) return reply.code(503).send(payload)
      if (response.status === 504) return reply.code(504).send({ error: { code: 'MODEL_TIMEOUT', message: 'Model service timed out', requestId: request.id } })
      return reply.code(502).send({ error: { code: 'ORCHESTRATOR_UNAVAILABLE', message: 'Unable to complete request', requestId: request.id } })
    } catch (error) {
      const code = error instanceof Error && error.name === 'AbortError' ? 'MODEL_TIMEOUT' : 'ORCHESTRATOR_UNAVAILABLE'
      return reply.code(code === 'MODEL_TIMEOUT' ? 504 : 502).send({ error: { code, message: code === 'MODEL_TIMEOUT' ? 'Model service timed out' : 'Unable to reach orchestrator', requestId: request.id } })
    } finally {
      clearTimeout(timeout)
    }
  })

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ requestId: request.id, errorType: error instanceof Error ? error.name : 'unknown' }, 'api request failed')
    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500
    const status = statusCode < 500 ? statusCode : 500
    const invalid = status === 400 || status === 413 || status === 415
    return reply.code(status).send({ error: { code: invalid ? 'INVALID_REQUEST' : 'INTERNAL_ERROR', message: invalid ? 'Invalid request data' : 'Internal server error', requestId: request.id } })
  })
  return app
}

if (require.main === module) {
  const host = process.env.FRANKAI_API_BIND_HOST ?? '127.0.0.1'
  const port = Number(process.env.FRANKAI_API_PORT ?? 8081)
  const app = createApiServer()
  let shuttingDown = false
  const shutdown = async () => {
    if (shuttingDown) return
    shuttingDown = true
    await app.close()
    process.exit(0)
  }
  process.once('SIGTERM', () => void shutdown())
  process.once('SIGINT', () => void shutdown())
  app.listen({ host, port }).catch(() => {
    console.error('api startup failed')
    process.exitCode = 1
  })
}
