import { z } from 'zod'

export const chatRequestSchema = z.strictObject({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().trim().min(1).max(128).optional(),
})

export const orchestratorRequestSchema = chatRequestSchema.extend({
  requestId: z.string().min(1).max(128),
})

export const usageSchema = z.object({
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
})

export const chatSuccessSchema = z.object({
  requestId: z.string().min(1),
  conversationId: z.string().min(1).max(128).optional(),
  agent: z.literal('frank-core'),
  message: z.string().min(1),
  usage: usageSchema.optional(),
})

export const errorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'INVALID_REQUEST',
  'ORCHESTRATOR_UNAVAILABLE',
  'MODEL_SECRET_MISSING',
  'MODEL_TIMEOUT',
  'MODEL_FAILURE',
  'INTERNAL_ERROR',
])

export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    requestId: z.string().min(1),
  }),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>
export type OrchestratorRequest = z.infer<typeof orchestratorRequestSchema>
export type ChatSuccess = z.infer<typeof chatSuccessSchema>
export type ErrorCode = z.infer<typeof errorCodeSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
