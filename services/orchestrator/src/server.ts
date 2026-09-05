import Fastify, { FastifyInstance } from 'fastify'
import OpenAI from 'openai'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  chatSuccessSchema,
  orchestratorRequestSchema,
} from '../../../packages/contracts/src/chat'
import {
  createOpenAiModelRunner,
  ModelRunner,
  loadFrankCorePrompt,
} from '../../../agents/frank-core/src/agent'

export type OrchestratorOptions = {
  modelRunner?: ModelRunner
  model?: string
  keyFile?: string
  promptFile?: string
  modelMode?: 'openai' | 'mock'
  timeoutMs?: number
  maxOutputTokens?: number
  bearerToken?: string
}

const BODY_LIMIT_BYTES = 16 * 1024

export type OpenAiUpstreamDiagnostic =
  | 'OPENAI_AUTH_FAILURE'
  | 'OPENAI_MODEL_NOT_FOUND'
  | 'OPENAI_MODEL_ACCESS_DENIED'
  | 'OPENAI_RATE_LIMIT'
  | 'OPENAI_QUOTA_FAILURE'
  | 'OPENAI_INVALID_REQUEST'
  | 'OPENAI_TIMEOUT'
  | 'OPENAI_UPSTREAM_5XX'
  | 'OPENAI_NETWORK_FAILURE'
  | 'OPENAI_UNKNOWN_FAILURE'

export type OpenAiFailureLayer =
  | 'OPENAI_HTTP_API_ERROR'
  | 'OPENAI_FETCH_ERROR'
  | 'OPENAI_ABORT_ERROR'
  | 'OPENAI_DNS_ERROR'
  | 'OPENAI_TLS_ERROR'
  | 'OPENAI_SOCKET_ERROR'
  | 'OPENAI_RESPONSE_PARSE_ERROR'
  | 'OPENAI_SCHEMA_ERROR'
  | 'OPENAI_SDK_ERROR'
  | 'OPENAI_APPLICATION_WRAPPER_ERROR'
  | 'OPENAI_UNKNOWN_FAILURE'

function classifyModelError(error: unknown): 'MODEL_SECRET_MISSING' | 'MODEL_TIMEOUT' | 'MODEL_FAILURE' {
  if (error instanceof Error && error.message === 'MODEL_SECRET_MISSING') return 'MODEL_SECRET_MISSING'
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'MODEL_TIMEOUT'
  return 'MODEL_FAILURE'
}

export function classifyOpenAiUpstreamError(error: unknown): OpenAiUpstreamDiagnostic {
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'OPENAI_TIMEOUT'
  if (error instanceof TypeError) return 'OPENAI_NETWORK_FAILURE'

  const candidate = typeof error === 'object' && error !== null ? error as {
    status?: unknown
    code?: unknown
    type?: unknown
  } : {}
  const status = typeof candidate.status === 'number' ? candidate.status : undefined
  const code = typeof candidate.code === 'string' ? candidate.code.toLowerCase() : ''
  const type = typeof candidate.type === 'string' ? candidate.type.toLowerCase() : ''

  if (status === 401) return 'OPENAI_AUTH_FAILURE'
  if (status === 403) return 'OPENAI_MODEL_ACCESS_DENIED'
  if (status === 404) return 'OPENAI_MODEL_NOT_FOUND'
  if (status === 429) {
    return code.includes('quota') || type.includes('quota') ? 'OPENAI_QUOTA_FAILURE' : 'OPENAI_RATE_LIMIT'
  }
  if (status === 400) return 'OPENAI_INVALID_REQUEST'
  if (status !== undefined && status >= 500) return 'OPENAI_UPSTREAM_5XX'
  return 'OPENAI_UNKNOWN_FAILURE'
}

export function extractOpenAiDiagnostic(error: unknown): {
  diagnosticLayer: OpenAiFailureLayer
  exceptionClass: string
  exceptionName: string
  causeClass?: string
  causeCode?: string
  httpStatus?: number
  providerErrorType?: string
  providerErrorCode?: string
  requestId?: string
} {
  const candidate = typeof error === 'object' && error !== null ? error as {
    status?: unknown
    code?: unknown
    type?: unknown
    requestID?: unknown
    cause?: unknown
  } : {}
  const exception = error instanceof Error ? error : undefined
  const cause = candidate.cause instanceof Error ? candidate.cause : undefined
  const exceptionClass = error !== null && typeof error === 'object' ? error.constructor?.name ?? 'Object' : typeof error
  const exceptionName = exception?.name ?? 'unknown'
  const causeCode = cause && 'code' in cause && typeof cause.code === 'string' ? cause.code : undefined
  const causeName = cause?.name ?? ''
  const causeClass = cause ? cause.constructor.name : undefined
  let diagnosticLayer: OpenAiFailureLayer = 'OPENAI_UNKNOWN_FAILURE'
  if (typeof candidate.status === 'number') diagnosticLayer = 'OPENAI_HTTP_API_ERROR'
  else if (exceptionName === 'TimeoutError' || exceptionName === 'AbortError' || exceptionName === 'APIUserAbortError') diagnosticLayer = 'OPENAI_ABORT_ERROR'
  else if (causeCode === 'ENOTFOUND' || causeCode === 'EAI_AGAIN') diagnosticLayer = 'OPENAI_DNS_ERROR'
  else if (causeCode?.includes('CERT') || causeCode === 'ERR_TLS_CERT_ALTNAME_INVALID' || causeName.includes('TLS')) diagnosticLayer = 'OPENAI_TLS_ERROR'
  else if (causeCode && ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE'].includes(causeCode)) diagnosticLayer = 'OPENAI_SOCKET_ERROR'
  else if (exceptionName === 'SyntaxError') diagnosticLayer = 'OPENAI_RESPONSE_PARSE_ERROR'
  else if (exceptionClass === 'APIConnectionError' || exceptionClass === 'APIError') diagnosticLayer = 'OPENAI_SDK_ERROR'
  else if (exceptionName === 'TypeError') diagnosticLayer = 'OPENAI_FETCH_ERROR'
  else if (exception?.message === 'Model returned no text') diagnosticLayer = 'OPENAI_APPLICATION_WRAPPER_ERROR'
  return {
    diagnosticLayer,
    exceptionClass,
    exceptionName,
    causeClass,
    causeCode,
    httpStatus: typeof candidate.status === 'number' ? candidate.status : undefined,
    providerErrorType: typeof candidate.type === 'string' ? candidate.type : undefined,
    providerErrorCode: typeof candidate.code === 'string' ? candidate.code : undefined,
    requestId: typeof candidate.requestID === 'string' ? candidate.requestID : undefined,
  }
}

function readApiKey(path: string): string {
  if (!existsSync(path)) throw new Error('MODEL_SECRET_MISSING')
  const key = readFileSync(path, 'utf8').trim()
  if (!key) throw new Error('MODEL_SECRET_MISSING')
  return key
}

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

export async function createOrchestratorServer(options: OrchestratorOptions = {}): Promise<FastifyInstance> {
  const timeoutMs = boundedNumber(options.timeoutMs ?? Number(process.env.ORCHESTRATOR_TIMEOUT_MS ?? 15_000), 15_000, 1_000, 60_000)
  const maxOutputTokens = boundedNumber(options.maxOutputTokens ?? Number(process.env.ORCHESTRATOR_MAX_OUTPUT_TOKENS ?? 300), 300, 1, 1_000)
  const model = options.model ?? process.env.ORCHESTRATOR_MODEL ?? 'gpt-5.6-luna'
  const modelMode = options.modelMode ?? (process.env.ORCHESTRATOR_MODEL_MODE as 'openai' | 'mock' | undefined) ?? 'openai'
  const promptFile = options.promptFile ?? process.env.FRANK_CORE_PROMPT_FILE ?? resolve('agents/frank-core/prompt.md')
  const bearerToken = options.bearerToken ?? loadToken(process.env.ORCHESTRATOR_BEARER_TOKEN_FILE ?? '/run/secrets/api_bearer_token')

  let runner = options.modelRunner
  if (!runner && modelMode === 'mock') {
    runner = async (request) => ({
      requestId: request.requestId,
      conversationId: request.conversationId,
      agent: 'frank-core' as const,
      message: `Frank Core received your request: ${request.message.slice(0, 160)}`,
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    })
  }
  if (!runner && modelMode === 'openai') {
    const prompt = await loadFrankCorePrompt(promptFile)
    const keyFile = options.keyFile ?? process.env.ORCHESTRATOR_OPENAI_KEY_FILE ?? '/run/secrets/openai_api_key'
    runner = async (request) => createOpenAiModelRunner({
      client: new OpenAI({ apiKey: readApiKey(keyFile) }),
      model,
      prompt,
      timeoutMs,
      maxOutputTokens,
    })(request)
  }
  if (!runner) throw new Error('No model runner configured')

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
    let secretReady = modelMode !== 'openai'
    if (modelMode === 'openai') {
      try {
        const keyFile = options.keyFile ?? process.env.ORCHESTRATOR_OPENAI_KEY_FILE ?? '/run/secrets/openai_api_key'
        secretReady = existsSync(keyFile) && readFileSync(keyFile, 'utf8').trim().length > 0
      } catch {
        secretReady = false
      }
    }
    if (!secretReady || !bearerToken) return reply.code(503).send({ status: 'not_ready' })
    return { status: 'ready' }
  })
  app.post('/internal/run', async (request, reply) => {
    const authorization = request.headers.authorization ?? ''
    const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
    if (!tokenMatches(bearerToken, supplied)) {
      return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized', requestId: request.id } })
    }
    const parsed = orchestratorRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: 'INVALID_REQUEST', message: 'Invalid request data', requestId: request.id } })
    }
    const startedAt = process.hrtime.bigint()
    try {
      const result = await runner!(parsed.data)
      const validated = chatSuccessSchema.safeParse(result)
      if (!validated.success) throw new Error('Invalid model response')
      request.log.info({
        requestId: parsed.data.requestId,
        inputTokens: validated.data.usage?.inputTokens,
        outputTokens: validated.data.usage?.outputTokens,
        totalTokens: validated.data.usage?.totalTokens,
      }, 'model request completed')
      return reply.send(validated.data)
    } catch (error) {
      const code = classifyModelError(error)
      const status = code === 'MODEL_SECRET_MISSING' ? 503 : code === 'MODEL_TIMEOUT' ? 504 : 502
      const upstreamClass = code === 'MODEL_FAILURE' ? classifyOpenAiUpstreamError(error) : undefined
      const diagnostic = code === 'MODEL_FAILURE' ? extractOpenAiDiagnostic(error) : {}
      const latencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
      request.log.warn({
        requestId: request.id,
        code,
        model,
        upstreamClass,
        ...diagnostic,
        latencyMs: Math.round(latencyMs),
      }, 'model request failed')
      return reply.code(status).send({
        error: {
          code,
          message: code === 'MODEL_SECRET_MISSING' ? 'Model service is not configured' : code === 'MODEL_TIMEOUT' ? 'Model service timed out' : 'Model service failed',
          requestId: request.id,
        },
      })
    }
  })
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ requestId: request.id, errorType: error instanceof Error ? error.name : 'unknown' }, 'orchestrator request failed')
    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500
    const status = statusCode < 500 ? statusCode : 500
    return reply.code(status).send({
      error: { code: status === 400 || status === 413 || status === 415 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR', message: status === 400 || status === 413 || status === 415 ? 'Invalid request data' : 'Internal server error', requestId: request.id },
    })
  })
  return app
}

if (require.main === module) {
  const host = process.env.ORCHESTRATOR_BIND_HOST ?? '0.0.0.0'
  const port = Number(process.env.ORCHESTRATOR_PORT ?? 8080)
  createOrchestratorServer()
    .then((app) => {
      let shuttingDown = false
      const shutdown = async () => {
        if (shuttingDown) return
        shuttingDown = true
        await app.close()
        process.exit(0)
      }
      process.once('SIGTERM', () => void shutdown())
      process.once('SIGINT', () => void shutdown())
      return app.listen({ host, port })
    })
    .catch(() => {
      console.error('orchestrator startup failed')
      process.exitCode = 1
    })
}
