"C:\Users\MWIJAY TECH\Desktop\PROJECTS\taste-skill-main"/**
 * Unified AI Provider Interface
 *
 * Every provider adapter must implement AIProviderAdapter.
 * The engine (ai-engine.ts) rotates through adapters on failure.
 */

export type AIMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type AIRequestOptions = {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  stream?: boolean
}

export type AIResponse = {
  text: string
  provider: string
  model: string
  tokensUsed?: number
  latencyMs?: number
}

export type AIError = {
  provider: string
  code: 'rate_limit' | 'auth_error' | 'network_error' | 'model_error' | 'unknown'
  message: string
  retryable: boolean
}

export interface AIProviderAdapter {
  id: string
  label: string
  isAvailable: () => boolean | Promise<boolean>
  chat: (messages: AIMessage[], options?: AIRequestOptions) => Promise<AIResponse>
}