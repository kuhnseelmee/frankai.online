import OpenAI from 'openai'
import { readFile } from 'node:fs/promises'
import { OrchestratorRequest, ChatSuccess } from '../../../packages/contracts/src/chat'

export type ModelRunner = (request: OrchestratorRequest) => Promise<ChatSuccess>

type ResponsesClient = Pick<OpenAI, 'responses'>

export async function loadFrankCorePrompt(path: string): Promise<string> {
  return (await readFile(path, 'utf8')).trim()
}

export function createOpenAiModelRunner(options: {
  client: ResponsesClient
  model: string
  prompt: string
  timeoutMs: number
  maxOutputTokens: number
}): ModelRunner {
  return async (request) => {
    const response = await options.client.responses.create(
      {
        model: options.model,
        instructions: options.prompt,
        input: request.message,
        max_output_tokens: options.maxOutputTokens,
        store: false,
      },
      { signal: AbortSignal.timeout(options.timeoutMs) },
    )

    const message = response.output_text.trim()
    if (!message) throw new Error('Model returned no text')
    return {
      requestId: request.requestId,
      conversationId: request.conversationId,
      agent: 'frank-core',
      message,
      usage: response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    }
  }
}
