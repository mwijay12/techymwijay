'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  loadSettings,
  saveSettings,
  resetSettings,
  type AppSettings,
  DEFAULT_SETTINGS,
} from '@/lib/app-settings'
import type { AIProviderId } from '@/lib/ai-provider-catalog'

interface UseAppSettingsReturn {
  settings: AppSettings
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  updateSettings: (updates: Partial<AppSettings>) => void
  resetToDefaults: () => void
  toggleProvider: (provider: keyof AppSettings['providers'], enabled: boolean) => void
  updateAISettings: (partial: Partial<any>) => void
  updateKey: (providerId: Exclude<AIProviderId, 'puter'>, value: string) => void
  updateCloudinarySettings: (partial: Partial<any>) => void
  saveAll: () => boolean
  resetAll: () => void
  hasGroqKey: boolean
  hasGeminiKey: boolean
  hasOpenRouterKey: boolean
  hasCerebrasKey: boolean
  hasHuggingFaceKey: boolean
  hasCloudinaryConfig: boolean
  configuredProviders: AIProviderId[]
  lastUpdatedAt: number | null
}

export function useAppSettings(): UseAppSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const loaded = loadSettings()
      setSettings(loaded)
    } catch {
      setError('Failed to load settings')
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const updated = saveSettings(updates)
    setSettings(updated)
  }, [])

  const resetToDefaults = useCallback(() => {
    const defaults = resetSettings()
    setSettings(defaults)
  }, [])

  const toggleProvider = useCallback(
    (provider: keyof AppSettings['providers'], enabled: boolean) => {
      const current = loadSettings()
      const updated = saveSettings({
        providers: {
          ...current.providers,
          [provider]: enabled,
        },
      })
      setSettings(updated)
    },
    []
  )

  const updateAISettings = useCallback((partial: Partial<any>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial }
      saveSettings(updated)
      return updated
    })
  }, [])

  const updateKey = useCallback(
    (providerId: Exclude<AIProviderId, 'puter'>, value: string) => {
      setSettings((prev) => {
        const keyMap: Record<string, string> = {
          groq: 'groqApiKey',
          gemini: 'geminiApiKey',
          cerebras: 'cerebrasApiKey',
          openrouter: 'openrouterApiKey',
          huggingface: 'huggingfaceApiKey',
        }
        const field = keyMap[providerId]
        if (!field) return prev
        const updated = {
          ...prev,
          keys: { ...prev.keys, [field]: value },
        }
        saveSettings(updated)
        return updated
      })
    },
    []
  )

  const updateCloudinarySettings = useCallback((partial: Partial<any>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial }
      saveSettings(updated)
      return updated
    })
  }, [])

  const saveAll = useCallback(() => {
    saveSettings(settings)
    return true
  }, [settings])

  const resetAll = useCallback(() => {
    resetToDefaults()
  }, [resetToDefaults])

  const computed = useMemo(() => {
    const ks = settings.keys
    return {
      hasGroqKey: !!ks?.groqApiKey,
      hasGeminiKey: !!ks?.geminiApiKey,
      hasOpenRouterKey: !!ks?.openrouterApiKey,
      hasCerebrasKey: !!ks?.cerebrasApiKey,
      hasHuggingFaceKey: !!ks?.huggingfaceApiKey,
      hasCloudinaryConfig: true,
      lastUpdatedAt: settings.lastUpdatedAt ? new Date(settings.lastUpdatedAt).getTime() : null,
      configuredProviders: ['puter' as AIProviderId, 'openrouter' as AIProviderId, 'groq' as AIProviderId, 'huggingface' as AIProviderId],
    }
  }, [settings])

  return {
    settings,
    isLoaded,
    isLoading: !isLoaded,
    error,
    updateSettings,
    resetToDefaults,
    toggleProvider,
    updateAISettings,
    updateKey,
    updateCloudinarySettings,
    saveAll,
    resetAll,
    ...computed,
  }
}