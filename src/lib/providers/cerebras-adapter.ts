/**
 * Cerebras AI Provider Adapter
 *
 * REST API via fetch — OpenAI-compatible endpoint.
 */

import type { AIProviderAdapter, AIMessage, AIRequestOptions, AIResponse, AIError } from './index'
import { loadAppSettings } from '@/lib/app-settings'

const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1/chat/completions'
const DEFAULT_MODEL = 'llama3.1-8b'

export const cerebrasAdapter: AIProviderAdapter = {
  id: 'cerebras',
  label: 'Cerebras',

  isAvailable(): boolean {
    const settings = loadAppSettings()
    return !!settings.keys.cerebrasApiKey && settings.keys.cerebrasApiKey.trim().length > 0
  },

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const settings = loadAppSettings()
    const apiKey = settings.keys.cerebrasApiKey

    if (!apiKey) {
      throw { provider: 'cerebras', code: 'auth_error', message: 'No Cerebras API key configured', retryable: false } satisfies AIError
    }

    const start = Date.now()

    const formattedMessages = options?.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages

    const res = await fetch(CEREBRAS_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model ?? DEFAULT_MODEL,
        messages: formattedMessages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
        stream: false,
      }),
    })

    const latencyMs = Date.now() - start

    if (res.status === 429) throw { provider: 'cerebras', code: 'rate_limit', message: 'Cerebras rate limit', retryable: true } satisfies AIError
    if (res.status === 401) throw { provider: 'cerebras', code: 'auth_error', message: 'Invalid Cerebras key', retryable: false } satisfies AIError
    if (!res.ok) throw { provider: 'cerebras', code: 'network_error', message: `Cerebras error: ${res.status}`, retryable: true } satisfies AIError

    const data = await res.json()
    const text: string = data?.choices?.[0]?.message?.content ?? ''

    if (!text) throw { provider: 'cerebras', code: 'model_error', message: 'Empty response', retryable: true } satisfies AIError

    return { text, provider: 'cerebras', model: options?.model ?? DEFAULT_MODEL, tokensUsed: data?.usage?.total_tokens, latencyMs }
  },
}