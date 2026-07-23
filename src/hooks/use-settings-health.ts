'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AIProvider } from '@/types/ai'

export interface ProviderHealth {
  provider: AIProvider
  keyCount: number
  isConfigured: boolean
  status: 'healthy' | 'unconfigured' | 'testing' | 'error'
  latencyMs?: number
}

interface HealthSummary {
  openrouter?: number
  groq?: number
  elevenlabs?: number
  huggingface?: number
  puter?: number
  total?: number
}

export function useSettingsHealth() {
  const [health, setHealth] = useState<Record<AIProvider, ProviderHealth>>({
    openrouter: {
      provider: 'openrouter',
      keyCount: 0,
      isConfigured: false,
      status: 'unconfigured',
    },
    groq: {
      provider: 'groq',
      keyCount: 0,
      isConfigured: false,
      status: 'unconfigured',
    },
    elevenlabs: {
      provider: 'elevenlabs',
      keyCount: 0,
      isConfigured: false,
      status: 'unconfigured',
    },
    huggingface: {
      provider: 'huggingface',
      keyCount: 0,
      isConfigured: false,
      status: 'unconfigured',
    },
    puter: {
      provider: 'puter',
      keyCount: 1,
      isConfigured: true,
      status: 'healthy',
    },
  })

  const [isLoading, setIsLoading] = useState(true)
  const [totalKeys, setTotalKeys] = useState(0)

  const fetchHealth = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/health')
      if (!res.ok) throw new Error('Health check failed')

      const data = await res.json()
      const summary: HealthSummary = data.providers || {}

      setTotalKeys(summary.total ?? 0)

      setHealth(prev => ({
        ...prev,
        openrouter: {
          provider: 'openrouter',
          keyCount: summary.openrouter ?? 0,
          isConfigured: (summary.openrouter ?? 0) > 0,
          status: (summary.openrouter ?? 0) > 0 ? 'healthy' : 'unconfigured',
        },
        groq: {
          provider: 'groq',
          keyCount: summary.groq ?? 0,
          isConfigured: (summary.groq ?? 0) > 0,
          status: (summary.groq ?? 0) > 0 ? 'healthy' : 'unconfigured',
        },
        elevenlabs: {
          provider: 'elevenlabs',
          keyCount: summary.elevenlabs ?? 0,
          isConfigured: (summary.elevenlabs ?? 0) > 0,
          status: (summary.elevenlabs ?? 0) > 0 ? 'healthy' : 'unconfigured',
        },
        huggingface: {
          provider: 'huggingface',
          keyCount: summary.huggingface ?? 0,
          isConfigured: (summary.huggingface ?? 0) > 0,
          status: (summary.huggingface ?? 0) > 0 ? 'healthy' : 'unconfigured',
        },
        puter: {
          provider: 'puter',
          keyCount: 1,
          isConfigured: true,
          status: 'healthy',
        },
      }))
    } catch {
      console.warn('[Settings] Failed to fetch health status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const testProvider = useCallback(
    async (provider: AIProvider): Promise<boolean> => {
      setHealth(prev => ({
        ...prev,
        [provider]: { ...prev[provider], status: 'testing' },
      }))

      const start = Date.now()

      try {
        if (provider === 'puter') {
          setHealth(prev => ({
            ...prev,
            puter: {
              ...prev.puter,
              status: 'healthy',
              latencyMs: Date.now() - start,
            },
          }))
          return true
        }

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                id: '1',
                role: 'user',
                content: 'Reply with just the word: OK',
                timestamp: new Date().toISOString(),
              },
            ],
            preferredProvider: provider,
            maxTokens: 10,
          }),
        })

        const data = await res.json()
        const success = res.ok && Boolean(data.content?.length)
        const latencyMs = Date.now() - start

        setHealth(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            status: success ? 'healthy' : 'error',
            latencyMs: success ? latencyMs : undefined,
          },
        }))

        return success
      } catch {
        setHealth(prev => ({
          ...prev,
          [provider]: { ...prev[provider], status: 'error' },
        }))
        return false
      }
    },
    []
  )

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  return {
    health,
    isLoading,
    totalKeys,
    fetchHealth,
    testProvider,
  }
}
