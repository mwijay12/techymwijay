/**
 * AI Provider Catalog
 *
 * Typed catalog of all supported AI providers and their models.
 * Easy to extend — just add a new entry to the array.
 */

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
    id: 'groq',
    label: 'Groq',
    description: 'Ultra-fast inference with open-source models.',
    requiresApiKey: true,
    defaultModel: 'llama-3.3-70b-versatile',
    supportsModels: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', description: 'Fast & powerful' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', description: 'Strong 32K context' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', description: 'Lightning fast' },
      { id: 'whisper-large-v3', label: 'Whisper Large V3', description: 'STT (future)' },
    ],
    colorToken: '#f97316',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: 'Google Gemini family — multimodal, capable models.',
    requiresApiKey: true,
    defaultModel: 'gemini-2.0-flash',
    supportsModels: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Fast & efficient' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Powerful long context' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Balanced speed/quality' },
    ],
    colorToken: '#4285f4',
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    description: 'Hardware-accelerated LLM inference — very fast.',
    requiresApiKey: true,
    defaultModel: 'llama3.1-8b',
    supportsModels: [
      { id: 'llama3.1-8b', label: 'Llama 3.1 8B', description: 'Fast inference' },
      { id: 'llama3.1-70b', label: 'Llama 3.1 70B', description: 'Heavy lifter' },
    ],
    colorToken: '#06b6d4',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    description: 'Unified API for many models. Bring your own key.',
    requiresApiKey: true,
    defaultModel: 'openai/gpt-4o-mini',
    supportsModels: [
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', description: 'Affordable & capable' },
      { id: 'openai/gpt-4o', label: 'GPT-4o', description: 'Premium OpenAI' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Best for code' },
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', description: 'Via OpenRouter' },
    ],
    colorToken: '#10b981',
  },
  {
    id: 'huggingface',
    label: 'HuggingFace',
    description: 'Open-source models via HuggingFace Inference API.',
    requiresApiKey: true,
    defaultModel: 'mistralai/Mistral-7B-Instruct-v0.3',
    supportsModels: [
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B', description: 'Solid open model' },
      { id: 'meta-llama/Llama-3.2-3B', label: 'Llama 3.2 3B', description: 'Lightweight' },
      { id: 'HuggingFaceH4/zephyr-7b-beta', label: 'Zephyr 7B', description: 'Chat-tuned' },
    ],
    colorToken: '#fbbf24',
  },
]

/** Helper to get a provider entry by ID */
export function getProviderById(id: AIProviderId): AIProviderEntry | undefined {
  return AI_PROVIDERS.find((p) => p.id === id)
}

/** Helper to get models for a provider */
export function getModelsForProvider(id: AIProviderId): AIProviderModel[] {
  const provider = getProviderById(id)
  return provider?.supportsModels ?? []
}

/** Helper to get default model for a provider */
export function getDefaultModelForProvider(id: AIProviderId): string {
  const provider = getProviderById(id)
  return provider?.defaultModel ?? 'gpt-4o-mini'
}

/** Default priority order */
export const DEFAULT_PROVIDER_PRIORITY: AIProviderId[] = [
  'puter',
  'groq',
  'gemini',
  'cerebras',
  'openrouter',
  'huggingface',
]