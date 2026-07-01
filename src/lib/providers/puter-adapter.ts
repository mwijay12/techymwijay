"C:\Users\MWIJAY TECH\Desktop\PROJECTS\taste-skill-main"/**
 * Puter.js AI Provider Adapter
 *
 * Uses the Puter.js SDK loaded via script tag.
 * Client-side only — guards against SSR.
 */

import type { AIProviderAdapter, AIMessage, AIRequestOptions, AIResponse, AIError } from './index'

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string | { role: string; content: string }[],
          options?: Record<string, unknown>
        ) => Promise<{ message?: { content?: string }; toString?: () => string } | string>
      }
    }
  }
}

export const puterAdapter: AIProviderAdapter = {
  id: 'puter',
  label: 'Puter.js',

  isAvailable(): boolean {
    if (typeof window === 'undefined') return false
    return (
      typeof window.puter !== 'undefined' &&
      typeof window.puter.ai !== 'undefined'
    )
  },

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw {
        provider: 'puter',
        code: 'network_error',
        message: 'Puter.js is not loaded in this environment',
        retryable: false,
      } satisfies AIError
    }

    const start = Date.now()

    const puterMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await window.puter!.ai.chat(puterMessages, {
      model: options?.model ?? 'gpt-4o-mini',
      stream: false,
    })

    const latencyMs = Date.now() - start

    let text = ''
    if (typeof response === 'string') {
      text = response
    } else if (response?.message?.content) {
      text = response.message.content
    } else if (response?.toString) {
      text = response.toString()
    }

    if (!text) {
      throw {
        provider: 'puter',
        code: 'model_error',
        message: 'Puter returned an empty response',
        retryable: true,
      } satisfies AIError
    }

    return {
      text,
      provider: 'puter',
      model: options?.model ?? 'gpt-4o-mini',
      latencyMs,
    }
  },
}