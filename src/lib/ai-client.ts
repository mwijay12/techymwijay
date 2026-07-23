/**
 * Unified AI Client
 * Single interface for making AI completions across all providers.
 * Used exclusively in API routes (server-side) — never in client components.
 */

import OpenAI from 'openai'
import Groq from 'groq-sdk'
import { HfInference } from '@huggingface/inference'
import { SERVER_ENV } from '@/lib/env'
import {
  initPoolState,
  getNextAvailableIndex,
  recordSuccess,
  recordFailure,
  MAX_RETRIES_PER_REQUEST,
  type PoolRotationState,
} from '@/lib/key-rotation'
import { DEFAULT_MODELS } from '@/lib/ai-provider-catalog'
import type { AIProvider, AIMessage } from '@/types/ai'

// ─── Types ─────────────────────────────────────────────────
export interface AIRequestOptions {
  messages: AIMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  preferredProvider?: AIProvider
}

export interface AIResponse {
  content: string
  provider: AIProvider
  model: string
  usedKeyIndex: number
  latencyMs: number
}

const serverPoolStates: Map<string, PoolRotationState> = new Map()

function getServerPoolState(
  provider: string,
  keyCount: number
): PoolRotationState {
  const existing = serverPoolStates.get(provider)
  if (existing && existing.keys.length === keyCount) {
    return existing
  }
  const fresh = initPoolState(provider, keyCount)
  serverPoolStates.set(provider, fresh)
  return fresh
}

function updateServerPoolState(state: PoolRotationState): void {
  serverPoolStates.set(state.provider, state)
}

// ─── OpenRouter Client ─────────────────────────────────────
async function callOpenRouter(
  key: string,
  messages: AIMessage[],
  model: string,
  maxTokens: number,
  temperature: number,
  systemPrompt?: string
): Promise<string> {
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: key,
    defaultHeaders: {
      'HTTP-Referer': 'https://mwijaytech.vercel.app',
      'X-Title': 'Mwijay Tech',
    },
  })

  const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt })
  }

  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })
  })

  const completion = await client.chat.completions.create({
    model,
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature,
  })

  return completion.choices[0]?.message?.content ?? ''
}

// ─── Groq Client ───────────────────────────────────────────
async function callGroq(
  key: string,
  messages: AIMessage[],
  model: string,
  maxTokens: number,
  temperature: number,
  systemPrompt?: string
): Promise<string> {
  const client = new Groq({ apiKey: key })

  const formattedMessages: Groq.Chat.ChatCompletionMessageParam[] = []

  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt })
  }

  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })
  })

  const completion = await client.chat.completions.create({
    model,
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature,
  })

  return completion.choices[0]?.message?.content ?? ''
}

// ─── HuggingFace Client ────────────────────────────────────
async function callHuggingFace(
  key: string,
  messages: AIMessage[],
  model: string,
  maxTokens: number,
  systemPrompt?: string
): Promise<string> {
  const client = new HfInference(key)

  const promptParts: string[] = []
  if (systemPrompt) {
    promptParts.push(`<s>[INST] ${systemPrompt} [/INST]`)
  }
  messages.forEach(msg => {
    if (msg.role === 'user') {
      promptParts.push(`[INST] ${msg.content} [/INST]`)
    } else if (msg.role === 'assistant') {
      promptParts.push(msg.content)
    }
  })

  const prompt = promptParts.join('\n')

  const response = await client.textGeneration({
    model,
    inputs: prompt,
    parameters: {
      max_new_tokens: maxTokens,
      return_full_text: false,
    },
  })

  return response.generated_text ?? ''
}

// ─── Provider Executor ─────────────────────────────────────
async function executeProviderCall(
  provider: AIProvider,
  keyPool: string[],
  messages: AIMessage[],
  model: string,
  maxTokens: number,
  temperature: number,
  systemPrompt?: string
): Promise<AIResponse> {
  if (keyPool.length === 0) {
    throw new Error(`No keys available for provider: ${provider}`)
  }

  const poolState = getServerPoolState(provider, keyPool.length)
  let currentState = poolState
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES_PER_REQUEST; attempt++) {
    const keyIndex = getNextAvailableIndex(currentState)
    if (keyIndex === -1) {
      throw new Error(`All keys exhausted for provider: ${provider}`)
    }

    const key = keyPool[keyIndex]
    const startTime = Date.now()

    try {
      let content = ''

      switch (provider) {
        case 'openrouter':
          content = await callOpenRouter(
            key, messages, model, maxTokens, temperature, systemPrompt
          )
          break
        case 'groq':
          content = await callGroq(
            key, messages, model, maxTokens, temperature, systemPrompt
          )
          break
        case 'huggingface':
          content = await callHuggingFace(
            key, messages, model, maxTokens, systemPrompt
          )
          break
        default:
          throw new Error(`Unknown provider: ${provider}`)
      }

      if (!content.trim()) {
        throw new Error('Empty response from AI provider')
      }

      currentState = recordSuccess(currentState, keyIndex)
      updateServerPoolState(currentState)

      return {
        content,
        provider,
        model,
        usedKeyIndex: keyIndex,
        latencyMs: Date.now() - startTime,
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(
        `[AI] ${provider} key[${keyIndex}] attempt ${attempt + 1} failed:`,
        lastError.message
      )

      currentState = recordFailure(currentState, keyIndex)
      updateServerPoolState(currentState)
    }
  }

  throw lastError ?? new Error(`${provider} failed after ${MAX_RETRIES_PER_REQUEST} attempts`)
}

// ─── Main Unified AI Call Function ────────────────────────
export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const {
    messages,
    model,
    maxTokens = 2048,
    temperature = 0.7,
    systemPrompt,
    preferredProvider,
  } = options

  const allProviders: AIProvider[] = ['openrouter', 'groq', 'huggingface']
  const orderedProviders = preferredProvider
    ? [
        preferredProvider,
        ...allProviders.filter(p => p !== preferredProvider),
      ]
    : allProviders

  const providerConfig: Record<string, { keys: string[]; defaultModel: string }> = {
    openrouter: {
      keys: SERVER_ENV.openrouterKeys,
      defaultModel: DEFAULT_MODELS.openrouter,
    },
    groq: {
      keys: SERVER_ENV.groqKeys,
      defaultModel: DEFAULT_MODELS.groq,
    },
    huggingface: {
      keys: SERVER_ENV.huggingFaceKeys,
      defaultModel: DEFAULT_MODELS.huggingface,
    },
  }

  let lastError: Error | null = null

  for (const provider of orderedProviders) {
    const config = providerConfig[provider]
    if (!config || config.keys.length === 0) {
      continue
    }

    try {
      const selectedModel = model ?? config.defaultModel
      const response = await executeProviderCall(
        provider,
        config.keys,
        messages,
        selectedModel,
        maxTokens,
        temperature,
        systemPrompt
      )

      return response
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw new Error(
    'USE_PUTER_FALLBACK:All server-side AI providers failed — use Puter.js client fallback'
  )
}

// ─── System prompt builder for Mwijay context ─────────────
export function buildMwijaySystemPrompt(userContext?: {
  name?: string
  language?: string
  timezone?: string
  memoryContext?: string
}): string {
  const name = userContext?.name ?? 'Davie'
  const lang = userContext?.language ?? 'sw-en'
  const tz = userContext?.timezone ?? 'Africa/Dar_es_Salaam'
  const memoryStr = userContext?.memoryContext ?? ''

  return `You are Mwijay AI, a personal assistant for ${name}, a developer and BIT student in Tanzania.

Key facts about ${name}:
- Located in Tanzania (timezone: ${tz})
- Speaks both Swahili and English, often mixes them (code-switching is normal)
- Is a developer who uses AI tools, manages API keys, tracks expenses, and takes voice notes
- Prefers concise, practical responses
- Language preference: ${lang === 'sw-en' ? 'Respond naturally in English but understand Swahili' : lang}${memoryStr}

Behavior rules:
- Be direct and helpful — no unnecessary filler
- If ${name} writes in Swahili or mixes Swahili-English, understand it perfectly
- For code questions, provide clean, working code with brief explanations  
- For general questions, keep answers short unless asked to elaborate
- You have access to ${name}'s memory, vault, todos, and spending data when provided as context
- Today's date: ${new Date().toLocaleDateString('en-TZ', { timeZone: tz })}

Always respond in plain text unless code formatting is explicitly needed.`
}
