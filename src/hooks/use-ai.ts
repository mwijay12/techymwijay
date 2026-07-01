'use client'

import { useState, useCallback } from 'react'
import { aiChat, aiPrompt, aiTranslate } from '@/lib/ai-engine'
import type { AIMessage, AIEngineOptions, AIEngineResult } from '@/lib/ai-engine'

type UseAIState = {
  loading: boolean
  error: string | null
  lastResult: AIEngineResult | null
  lastProvider: string | null
}

export function useAI() {
  const [state, setState] = useState<UseAIState>({
    loading: false,
    error: null,
    lastResult: null,
    lastProvider: null,
  })

  const chat = useCallback(
    async (messages: AIMessage[], options?: AIEngineOptions): Promise<string | null> => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const result = await aiChat(messages, options)
        setState((s) => ({
          ...s,
          loading: false,
          lastResult: result,
          lastProvider: result.provider,
        }))
        return result.text
      } catch (err) {
        const message = err instanceof Error ? err.message : 'AI request failed'
        setState((s) => ({ ...s, loading: false, error: message }))
        return null
      }
    },
    []
  )

  const prompt = useCallback(
    async (text: string, systemPrompt?: string, options?: AIEngineOptions): Promise<string | null> => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const result = await aiPrompt(text, systemPrompt, options)
        setState((s) => ({
          ...s,
          loading: false,
          lastResult: result,
          lastProvider: result.provider,
        }))
        return result.text
      } catch (err) {
        const message = err instanceof Error ? err.message : 'AI request failed'
        setState((s) => ({ ...s, loading: false, error: message }))
        return null
      }
    },
    []
  )

  const translate = useCallback(
    async (text: string, fromLang: string, toLang: string, options?: AIEngineOptions): Promise<string | null> => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const translated = await aiTranslate(text, fromLang, toLang, options)
        setState((s) => ({ ...s, loading: false, error: null }))
        return translated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Translation failed'
        setState((s) => ({ ...s, loading: false, error: message }))
        return null
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    chat,
    prompt,
    translate,
    clearError,
  }
}