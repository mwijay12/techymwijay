/**
 * AI Provider Rotation Engine
 *
 * Unified interface for all AI chat calls.
 * Automatically rotates through providers on failure.
 *
 * Priority order is read from app settings (Prompt 1).
 * Health tracking via provider-health.ts.
 */

import { loadAppSettings } from '@/lib/app-settings'
import { providerHealth } from '@/lib/provider-health'
import { puterAdapter } from '@/lib/providers/puter-adapter'
import { groqAdapter } from '@/lib/providers/groq-adapter'
import { geminiAdapter } from '@/lib/providers/gemini-adapter'
import { cerebrasAdapter } from '@/lib/providers/cerebras-adapter'
import { openrouterAdapter } from '@/lib/providers/openrouter-adapter'
import { huggingfaceAdapter } from '@/lib/providers/huggingface-adapter'
import type { AIProviderAdapter, AIMessage, AIRequestOptions, AIResponse, AIError } from '@/lib/providers/index'

const ALL_ADAPTERS: Record<string, AIProviderAdapter> = {
  puter: puterAdapter,
  groq: groqAdapter,
  gemini: geminiAdapter,
  cerebras: cerebrasAdapter,
  openrouter: openrouterAdapter,
  huggingface: huggingfaceAdapter,
}

export type AIEngineOptions = AIRequestOptions & {
  forceProvider?: string
  skipProviders?: string[]
}

export type AIEngineResult = AIResponse & {
  attemptedProviders: string[]
  fallbackUsed: boolean
}

function getProviderOrder(): string[] {
  try {
    const settings = loadAppSettings()
    return settings.ai.providerPriority?.length > 0
      ? settings.ai.providerPriority
      : ['puter', 'groq', 'gemini', 'cerebras', 'openrouter', 'huggingface']
  } catch {
    return ['puter', 'groq', 'gemini', 'cerebras', 'openrouter', 'huggingface']
  }
}

export async function aiChat(
  messages: AIMessage[],
  options: AIEngineOptions = {}
): Promise<AIEngineResult> {
  const { forceProvider, skipProviders = [], ...requestOptions } = options

  const providerOrder = forceProvider ? [forceProvider] : getProviderOrder()
  const attemptedProviders: string[] = []
  const errors: AIError[] = []

  for (const providerId of providerOrder) {
    if (skipProviders.includes(providerId)) continue

    const adapter = ALL_ADAPTERS[providerId]
    if (!adapter) continue

    // Skip if health tracker marks as unusable
    if (!providerHealth.isUsable(providerId)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[AI Engine] Skipping ${providerId} — health: ${providerHealth.getStatus(providerId)}`)
      }
      continue
    }

    // Skip if adapter is unavailable (missing key, SSR, etc.)
    const available = await adapter.isAvailable()
    if (!available) continue

    attemptedProviders.push(providerId)

    try {
      const result = await adapter.chat(messages, requestOptions)
      providerHealth.recordSuccess(providerId)

      return {
        ...result,
        attemptedProviders,
        fallbackUsed: attemptedProviders[0] !== providerId,
      }
    } catch (err) {
      const aiError = err as AIError
      errors.push(aiError)
      providerHealth.recordFailure(providerId, aiError.code ?? 'unknown')

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[AI Engine] Provider ${providerId} failed:`, aiError.message)
      }

      // Auth errors are not retryable — skip immediately
      if (aiError.code === 'auth_error') continue
      // Other errors — rotate to next
      continue
    }
  }

  // All providers failed
  const errorSummary = errors.map((e) => `${e.provider}: ${e.message}`).join(' | ')
  throw new Error(
    `All AI providers failed. Attempted: [${attemptedProviders.join(', ')}]. Errors: ${errorSummary}`
  )
}

/** Convenience shortcut for single-turn prompts */
export async function aiPrompt(
  prompt: string,
  systemPrompt?: string,
  options: AIEngineOptions = {}
): Promise<AIEngineResult> {
  const messages: AIMessage[] = [{ role: 'user', content: prompt }]
  return aiChat(messages, { ...options, systemPrompt })
}

/** Convenience shortcut for translation */
export async function aiTranslate(
  text: string,
  fromLang: string,
  toLang: string,
  options: AIEngineOptions = {}
): Promise<string> {
  const result = await aiPrompt(
    `Translate this text from ${fromLang} to ${toLang}. Return ONLY the translation, nothing else:\n\n${text}`,
    'You are a professional translator. Return only the translated text without any explanation or context.',
    { ...options, model: options.model ?? 'gpt-4o-mini', maxTokens: 512 }
  )
  return result.text.trim()
}

export { providerHealth }
export type { AIMessage, AIRequestOptions, AIResponse, AIError }