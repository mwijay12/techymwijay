 /**
 * Groq AI Provider Adapter
 *
 * REST API via fetch — OpenAI-compatible endpoint.
 * Reads API key from settings at call time (not import time).
 */

import type { AIProviderAdapter, AIMessage, AIRequestOptions, AIResponse, AIError } from './index'
import { loadAppSettings } from '@/lib/app-settings'

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export const groqAdapter: AIProviderAdapter = {
  id: 'groq',
  label: 'Groq',

  isAvailable(): boolean {
    const settings = loadAppSettings()
    return !!settings.keys.groqApiKey && settings.keys.groqApiKey.trim().length > 0
  },

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const settings = loadAppSettings()
    const apiKey = settings.keys.groqApiKey

    if (!apiKey) {
      throw { provider: 'groq', code: 'auth_error', message: 'No Groq API key configured', retryable: false } satisfies AIError
    }

    const start = Date.now()

    const body: Record<string, unknown> = {
      model: options?.model ?? DEFAULT_MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      stream: false,
    }

    if (options?.systemPrompt) {
      ;(body.messages as AIMessage[]).unshift({ role: 'system', content: options.systemPrompt })
    }

    const res = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const latencyMs = Date.now() - start

    if (res.status === 429) throw { provider: 'groq', code: 'rate_limit', message: 'Groq rate limit reached', retryable: true } satisfies AIError
    if (res.status === 401) throw { provider: 'groq', code: 'auth_error', message: 'Invalid Groq API key', retryable: false } satisfies AIError
    if (!res.ok) throw { provider: 'groq', code: 'network_error', message: `Groq API error: ${res.status}`, retryable: true } satisfies AIError

    const data = await res.json()
    const text: string = data?.choices?.[0]?.message?.content ?? ''

    if (!text) throw { provider: 'groq', code: 'model_error', message: 'Groq returned an empty response', retryable: true } satisfies AIError

    return {
      text,
      provider: 'groq',
      model: options?.model ?? DEFAULT_MODEL,
      tokensUsed: data?.usage?.total_tokens,
      latencyMs,
    }
  },
}