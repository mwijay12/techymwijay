'use client'

import { useState, useCallback } from 'react'
import type { AIMessage, AIProvider } from '@/types/ai'

interface UseAIOptions {
  preferredProvider?: AIProvider
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

interface UseAIReturn {
  sendMessage: (
    message: string,
    history?: AIMessage[],
    userContext?: { name?: string; language?: string; timezone?: string }
  ) => Promise<string>
  translate: (
    text: string,
    sourceLang: string,
    targetLang: string,
    opts?: { maxTokens?: number }
  ) => Promise<string>
  isLoading: boolean
  loading: boolean
  error: string | null
  lastProvider: AIProvider | null
  clearError: () => void
}

async function callPuterAI(prompt: string): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).puter?.ai) {
    throw new Error('Puter.js not available')
  }

  const response = await (window as any).puter.ai.chat(prompt, {
    model: 'gpt-4o-mini',
  })

  if (typeof response === 'string') return response
  if (response?.toString) return response.toString()
  return String(response ?? '')
}

export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastProvider, setLastProvider] = useState<AIProvider | null>(null)

  const sendMessage = useCallback(
    async (
      message: string,
      history: AIMessage[] = [],
      userContext?: { name?: string; language?: string; timezone?: string }
    ): Promise<string> => {
      setIsLoading(true)
      setError(null)

      const messages: AIMessage[] = [
        ...history,
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
      ]

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            model: options.model,
            maxTokens: options.maxTokens,
            temperature: options.temperature,
            systemPrompt: options.systemPrompt,
            preferredProvider: options.preferredProvider,
            userContext,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.usePuterFallback) {
            setLastProvider('puter')
            const puterResult = await callPuterAI(message)
            return puterResult
          }
          throw new Error(data.error ?? 'AI request failed')
        }

        setLastProvider(data.provider ?? 'openrouter')
        return data.content ?? ''
      } catch (err) {
        try {
          setLastProvider('puter')
          const puterResult = await callPuterAI(message)
          return puterResult
        } catch {
          const msg = err instanceof Error ? err.message : 'AI request failed'
          setError(msg)
          throw new Error(msg)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  const translate = useCallback(
    async (
      text: string,
      sourceLang: string,
      targetLang: string,
      opts?: { maxTokens?: number }
    ): Promise<string> => {
      const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Return ONLY the translated text without extra formatting or explanation:\n\n${text}`
      return sendMessage(prompt, [], undefined)
    },
    [sendMessage]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    sendMessage,
    translate,
    isLoading,
    loading: isLoading,
    error,
    lastProvider,
    clearError,
  }
}