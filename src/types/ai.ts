export type AIProvider = 'openrouter' | 'groq' | 'elevenlabs' | 'huggingface' | 'puter'

export interface AIProviderConfig {
  id: AIProvider
  name: string
  displayName: string
  models: AIModel[]
  keyPool: string[]
  currentKeyIndex: number
  isEnabled: boolean
  failureCount: number
  lastFailedAt?: string
}

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  contextLength: number
  supportsStreaming: boolean
  costPer1kTokens: number
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  provider?: AIProvider
  model?: string
}

export interface AIMemoryEntry {
  id: string
  userId: string
  type: 'preference' | 'fact' | 'context' | 'correction' | 'skill'
  content: string
  embedding?: number[]
  createdAt: string
  lastUsedAt: string
  useCount: number
}
