/**
 * OpenRouter AI Provider Adapter
 *
 * OpenAI-compatible REST endpoint with referral headers.
 */

import type { AIProviderAdapter, AIMessage, AIRequestOptions, AIResponse, AIError } from './index'
import { loadAppSettings } from '@/lib/app-settings'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free'

export const openrouterAdapter: AIProviderAdapter = {
  id: 'openrouter',
  label: 'OpenRouter',

  isAvailable(): boolean {
    const settings = loadAppSettings()
    return !!settings.keys.openrouterApiKey && settings.keys.openrouterApiKey.trim().length > 0
  },

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const settings = loadAppSettings()
    const apiKey = settings.keys.openrouterApiKey

    if (!apiKey) {
      throw { provider: 'openrouter', code: 'auth_error', message: 'No OpenRouter API key configured', retryable: false } satisfies AIError
    }

    const start = Date.now()

    const formattedMessages = options?.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages

    const res = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mwijaytech.com',
        'X-Title': 'Mwijay AI Voice Studio',
      },
      body: JSON.stringify({
        model: options?.model ?? DEFAULT_MODEL,
        messages: formattedMessages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    })

    const latencyMs = Date.now() - start

    if (res.status === 429) throw { provider: 'openrouter', code: 'rate_limit', message: 'OpenRouter rate limit', retryable: true } satisfies AIError
    if (res.status === 401) throw { provider: 'openrouter', code: 'auth_error', message: 'Invalid OpenRouter key', retryable: false } satisfies AIError
    if (!res.ok) throw { provider: 'openrouter', code: 'network_error', message: `OpenRouter error: ${res.status}`, retryable: true } satisfies AIError

    const data = await res.json()
    const text: string = data?.choices?.[0]?.message?.content ?? ''

    if (!text) throw { provider: 'openrouter', code: 'model_error', message: 'Empty response', retryable: true } satisfies AIError

    return { text, provider: 'openrouter', model: options?.model ?? DEFAULT_MODEL, tokensUsed: data?.usage?.total_tokens, latencyMs }
  },
}