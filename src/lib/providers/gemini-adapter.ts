/**
 * Google Gemini AI Provider Adapter
 *
 * REST API via fetch — Gemini GenerateContent endpoint.
 */

import type { AIProviderAdapter, AIMessage, AIRequestOptions, AIResponse, AIError } from './index'
import { loadAppSettings } from '@/lib/app-settings'

const DEFAULT_MODEL = 'gemini-2.0-flash'

export const geminiAdapter: AIProviderAdapter = {
  id: 'gemini',
  label: 'Google Gemini',

  isAvailable(): boolean {
    const settings = loadAppSettings()
    return !!settings.keys.geminiApiKey && settings.keys.geminiApiKey.trim().length > 0
  },

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const settings = loadAppSettings()
    const apiKey = settings.keys.geminiApiKey

    if (!apiKey) {
      throw { provider: 'gemini', code: 'auth_error', message: 'No Gemini API key configured', retryable: false } satisfies AIError
    }

    const model = options?.model ?? DEFAULT_MODEL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const start = Date.now()

    // Convert messages to Gemini format
    const geminiContents: { role: string; parts: { text: string }[] }[] = []

    if (options?.systemPrompt) {
      geminiContents.push({ role: 'user', parts: [{ text: options.systemPrompt }] })
      geminiContents.push({ role: 'model', parts: [{ text: 'Understood. I will follow those instructions.' }] })
    }

    messages.forEach((m) => {
      if (m.role === 'system') return
      geminiContents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 1024,
        },
      }),
    })

    const latencyMs = Date.now() - start

    if (res.status === 429) throw { provider: 'gemini', code: 'rate_limit', message: 'Gemini rate limit reached', retryable: true } satisfies AIError
    if (res.status === 401 || res.status === 403) throw { provider: 'gemini', code: 'auth_error', message: 'Invalid Gemini API key', retryable: false } satisfies AIError
    if (!res.ok) throw { provider: 'gemini', code: 'network_error', message: `Gemini API error: ${res.status}`, retryable: true } satisfies AIError

    const data = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (!text) throw { provider: 'gemini', code: 'model_error', message: 'Gemini returned an empty response', retryable: true } satisfies AIError

    return { text, provider: 'gemini', model, latencyMs }
  },
}