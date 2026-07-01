/**
 * HuggingFace AI Provider Adapter
 *
 * Uses HuggingFace Inference API (serverless).
 */

import type { AIProviderAdapter, AIMessage, AIRequestOptions, AIResponse, AIError } from './index'
import { loadAppSettings } from '@/lib/app-settings'

const HF_BASE_URL = 'https://api-inference.huggingface.co/models'
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'

export const huggingfaceAdapter: AIProviderAdapter = {
  id: 'huggingface',
  label: 'HuggingFace',

  isAvailable(): boolean {
    const settings = loadAppSettings()
    return !!settings.keys.huggingfaceApiKey && settings.keys.huggingfaceApiKey.trim().length > 0
  },

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const settings = loadAppSettings()
    const apiKey = settings.keys.huggingfaceApiKey

    if (!apiKey) {
      throw { provider: 'huggingface', code: 'auth_error' as const, message: 'No HuggingFace API key', retryable: false } satisfies AIError
    }

    const model = options?.model ?? DEFAULT_MODEL
    const start = Date.now()

    // Build a prompt string for text-generation
    const promptParts: string[] = []
    for (const m of messages) {
      if (m.role === 'system') {
        promptParts.push(`[INST] <<SYS>>\n${m.content}\n<</SYS>>\n\n`)
      } else if (m.role === 'user') {
        promptParts.push(`[INST] ${m.content} [/INST]`)
      } else {
        promptParts.push(m.content)
      }
    }
    const prompt = promptParts.join('\n')

    const res = await fetch(`${HF_BASE_URL}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options?.maxTokens ?? 512,
          temperature: options?.temperature ?? 0.7,
          return_full_text: false,
        },
      }),
    })

    const latencyMs = Date.now() - start

    if (res.status === 429) throw { provider: 'huggingface', code: 'rate_limit' as const, message: 'HuggingFace rate limit', retryable: true } satisfies AIError
    if (res.status === 401) throw { provider: 'huggingface', code: 'auth_error' as const, message: 'Invalid HuggingFace key', retryable: false } satisfies AIError
    if (!res.ok) throw { provider: 'huggingface', code: 'network_error' as const, message: `HuggingFace error: ${res.status}`, retryable: true } satisfies AIError

    const data = await res.json()
    const text: string = Array.isArray(data) ? data[0]?.generated_text ?? '' : data?.generated_text ?? ''

    if (!text) throw { provider: 'huggingface', code: 'model_error' as const, message: 'Empty response', retryable: true } satisfies AIError

    return { text, provider: 'huggingface', model, latencyMs }
  },
}