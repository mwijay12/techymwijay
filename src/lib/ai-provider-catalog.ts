/**
 * AI Provider Catalog
 * Defines all available providers, their models, capabilities,
 * and configuration for the key rotation engine.
 */

import type { AIProvider, AIModel } from '@/types/ai'

export type AIProviderId =
  | 'puter'
  | 'groq'
  | 'gemini'
  | 'cerebras'
  | 'openrouter'
  | 'huggingface'

export interface AIProviderModel {
  id: string
  label: string
  description?: string
}

export interface AIProviderEntry {
  id: AIProviderId
  label: string
  description: string
  requiresApiKey: boolean
  supportsModels: AIProviderModel[]
  defaultModel: string
  statusNote?: string
  colorToken?: string
  icon?: string
}

// ─── Model Definitions ─────────────────────────────────────

export const OPENROUTER_MODELS: AIModel[] = [
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini Flash 1.5',
    provider: 'openrouter',
    contextLength: 1000000,
    supportsStreaming: true,
    costPer1kTokens: 0,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B (Free)',
    provider: 'openrouter',
    contextLength: 131072,
    supportsStreaming: true,
    costPer1kTokens: 0,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openrouter',
    contextLength: 128000,
    supportsStreaming: true,
    costPer1kTokens: 0.00015,
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B (Free)',
    provider: 'openrouter',
    contextLength: 32768,
    supportsStreaming: true,
    costPer1kTokens: 0,
  },
]

export const GROQ_MODELS: AIModel[] = [
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    contextLength: 128000,
    supportsStreaming: true,
    costPer1kTokens: 0,
  },
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B',
    provider: 'groq',
    contextLength: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    contextLength: 32768,
    supportsStreaming: true,
    costPer1kTokens: 0,
  },
]

export const HUGGINGFACE_MODELS: AIModel[] = [
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B Instruct',
    provider: 'huggingface',
    contextLength: 32768,
    supportsStreaming: false,
    costPer1kTokens: 0,
  },
  {
    id: 'meta-llama/Meta-Llama-3-8B-Instruct',
    name: 'Llama 3 8B Instruct',
    provider: 'huggingface',
    contextLength: 8192,
    supportsStreaming: false,
    costPer1kTokens: 0,
  },
]

export const PUTER_MODELS: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini (via Puter)',
    provider: 'puter',
    contextLength: 128000,
    supportsStreaming: false,
    costPer1kTokens: 0,
  },
]

// ─── Provider Failover Order ───────────────────────────────
export const PROVIDER_FAILOVER_ORDER: AIProvider[] = [
  'openrouter',
  'groq',
  'huggingface',
  'puter',
]

// ─── Default Models Per Provider ──────────────────────────
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openrouter: 'google/gemini-flash-1.5',
  groq: 'llama-3.1-70b-versatile',
  elevenlabs: 'eleven_multilingual_v2',
  huggingface: 'mistralai/Mistral-7B-Instruct-v0.3',
  puter: 'gpt-4o-mini',
}

// ─── All Models Flat List ──────────────────────────────────
export const ALL_MODELS: AIModel[] = [
  ...OPENROUTER_MODELS,
  ...GROQ_MODELS,
  ...HUGGINGFACE_MODELS,
  ...PUTER_MODELS,
]

// ─── Provider Display Info ─────────────────────────────────
export const PROVIDER_INFO: Record<AIProvider, {
  displayName: string
  description: string
  docsUrl: string
  color: string
  isFree: boolean
}> = {
  openrouter: {
    displayName: 'OpenRouter',
    description: 'Multi-model AI gateway with 18 key pool',
    docsUrl: 'https://openrouter.ai/keys',
    color: '#7c3aed',
    isFree: true,
  },
  groq: {
    displayName: 'Groq',
    description: 'Ultra-fast LPU inference with 10 key pool',
    docsUrl: 'https://console.groq.com/keys',
    color: '#f97316',
    isFree: true,
  },
  elevenlabs: {
    displayName: 'ElevenLabs',
    description: 'Natural TTS voice generation with 17 key pool',
    docsUrl: 'https://elevenlabs.io',
    color: '#0ea5e9',
    isFree: true,
  },
  huggingface: {
    displayName: 'HuggingFace',
    description: 'Open source model inference with 2 key pool',
    docsUrl: 'https://huggingface.co/settings/tokens',
    color: '#fbbf24',
    isFree: true,
  },
  puter: {
    displayName: 'Puter.js',
    description: 'Zero-config browser AI fallback — no key needed',
    docsUrl: 'https://puter.com',
    color: '#10b981',
    isFree: true,
  },
}

// ─── Legacy Provider Entries List ─────────────────────────
export const AI_PROVIDERS: AIProviderEntry[] = [
  {
    id: 'puter',
    label: 'Puter.js',
    description: 'Built-in free AI provider via Puter.js. No API key required.',
    requiresApiKey: false,
    defaultModel: 'gpt-4o-mini',
    supportsModels: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast & free via Puter' },
      { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Premium via Puter' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Fast via Puter' },
    ],
    statusNote: 'Works without API key',
    colorToken: '#8b5cf6',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    description: 'Multi-model AI gateway with 18 key pool.',
    requiresApiKey: true,
    defaultModel: 'google/gemini-flash-1.5',
    supportsModels: [
      { id: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5', description: 'Fast & free' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', description: 'Affordable' },
      { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B', description: 'Free tier' },
    ],
    colorToken: '#10b981',
  },
  {
    id: 'groq',
    label: 'Groq',
    description: 'Ultra-fast inference with open-source models.',
    requiresApiKey: true,
    defaultModel: 'llama-3.1-70b-versatile',
    supportsModels: [
      { id: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B', description: 'Fast & powerful' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', description: '32K context' },
      { id: 'llama3-8b-8192', label: 'Llama 3 8B', description: 'Lightning fast' },
    ],
    colorToken: '#f97316',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: 'Google Gemini family.',
    requiresApiKey: true,
    defaultModel: 'gemini-2.0-flash',
    supportsModels: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Fast' },
    ],
    colorToken: '#4285f4',
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    description: 'Hardware-accelerated LLM inference.',
    requiresApiKey: true,
    defaultModel: 'llama3.1-8b',
    supportsModels: [
      { id: 'llama3.1-8b', label: 'Llama 3.1 8B', description: 'Fast' },
    ],
    colorToken: '#06b6d4',
  },
  {
    id: 'huggingface',
    label: 'HuggingFace',
    description: 'Open-source models via HuggingFace API.',
    requiresApiKey: true,
    defaultModel: 'mistralai/Mistral-7B-Instruct-v0.3',
    supportsModels: [
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B', description: 'Solid' },
    ],
    colorToken: '#fbbf24',
  },
]

export function getProviderById(id: AIProviderId): AIProviderEntry | undefined {
  return AI_PROVIDERS.find((p) => p.id === id)
}

export function getModelsForProvider(id: AIProviderId): AIProviderModel[] {
  const provider = getProviderById(id)
  return provider?.supportsModels ?? []
}

export function getDefaultModelForProvider(id: AIProviderId): string {
  const provider = getProviderById(id)
  return provider?.defaultModel ?? 'gpt-4o-mini'
}

export const DEFAULT_PROVIDER_PRIORITY: AIProviderId[] = [
  'openrouter',
  'groq',
  'huggingface',
  'puter',
  'gemini',
  'cerebras',
]

export function getProviderModels(provider: AIProvider): AIModel[] {
  const map: Record<AIProvider, AIModel[]> = {
    openrouter: OPENROUTER_MODELS,
    groq: GROQ_MODELS,
    elevenlabs: [],
    huggingface: HUGGINGFACE_MODELS,
    puter: PUTER_MODELS,
  }
  return map[provider] ?? []
}

export function getFreeModels(): AIModel[] {
  return ALL_MODELS.filter(m => m.costPer1kTokens === 0)
}