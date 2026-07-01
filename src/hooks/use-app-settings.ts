'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  loadAppSettings,
  saveAppSettings,
  resetAppSettings,
  mergeWithDefaults,
  exportSafeSettings,
} from '@/lib/app-settings'
import type { AppSettings, AppSettingsKeys, AppSettingsCloudinary } from '@/lib/app-settings'
import type { AIProviderId } from '@/lib/ai-provider-catalog'

interface UseAppSettingsReturn {
  /** Current settings (loaded on mount) */
  settings: AppSettings
  /** True while initial load is happening */
  isLoading: boolean
  /** Error message if something went wrong */
  error: string | null

  // ─── Update helpers ────────────────────────────────────
  /** Update AI section (usePuter, defaultProvider, defaultModel, priority) */
  updateAISettings: (partial: Partial<AppSettings['ai']>) => void
  /** Update a single API key by provider id */
  updateKey: (providerId: Exclude<AIProviderId, 'puter'>, value: string) => void
  /** Update Cloudinary settings */
  updateCloudinarySettings: (partial: Partial<AppSettingsCloudinary>) => void
  /** Persist current settings to localStorage */
  saveAll: () => boolean
  /** Reset everything to defaults */
  resetAll: () => void

  // ─── Computed flags ────────────────────────────────────
  hasGroqKey: boolean
  hasGeminiKey: boolean
  hasOpenRouterKey: boolean
  hasCerebrasKey: boolean
  hasHuggingFaceKey: boolean
  hasCloudinaryConfig: boolean
  /** List of provider IDs that have valid API keys or don't need one */
  configuredProviders: AIProviderId[]
  /** Last saved timestamp */
  lastUpdatedAt: number | null
}

export function useAppSettings(): UseAppSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load on mount
  useEffect(() => {
    try {
      const loaded = loadAppSettings()
      setSettings(loaded)
    } catch (err) {
      setError('Failed to load settings')
      // Fall back to defaults
      setSettings(loadAppSettings())
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ─── Updates ───────────────────────────────────────────
  const updateAISettings = useCallback((partial: Partial<AppSettings['ai']>) => {
    setSettings((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        ai: { ...prev.ai, ...partial },
      }
    })
  }, [])

  const updateKey = useCallback(
    (providerId: Exclude<AIProviderId, 'puter'>, value: string) => {
      setSettings((prev) => {
        if (!prev) return prev
        const keyMap: Record<string, keyof AppSettingsKeys> = {
          groq: 'groqApiKey',
          gemini: 'geminiApiKey',
          cerebras: 'cerebrasApiKey',
          openrouter: 'openrouterApiKey',
          huggingface: 'huggingfaceApiKey',
        }
        const keyField = keyMap[providerId]
        if (!keyField) return prev
        return {
          ...prev,
          keys: { ...prev.keys, [keyField]: value },
        }
      })
    },
    []
  )

  const updateCloudinarySettings = useCallback(
    (partial: Partial<AppSettingsCloudinary>) => {
      setSettings((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          cloudinary: { ...prev.cloudinary, ...partial },
        }
      })
    },
    []
  )

  const saveAll = useCallback(() => {
    if (!settings) return false
    const ok = saveAppSettings(settings)
    if (ok) {
      // Update timestamp in local state
      setSettings((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          ui: { ...prev.ui, settingsLastUpdatedAt: Date.now() },
        }
      })
    }
    return ok
  }, [settings])

  const resetAll = useCallback(() => {
    const defaults = resetAppSettings()
    setSettings(defaults)
  }, [])

  // ─── Computed flags ────────────────────────────────────
  const computed = useMemo(() => {
    const ks = settings?.keys
    return {
      hasGroqKey: !!ks?.groqApiKey,
      hasGeminiKey: !!ks?.geminiApiKey,
      hasOpenRouterKey: !!ks?.openrouterApiKey,
      hasCerebrasKey: !!ks?.cerebrasApiKey,
      hasHuggingFaceKey: !!ks?.huggingfaceApiKey,
      hasCloudinaryConfig: !!(
        settings?.cloudinary.cloudName && settings?.cloudinary.uploadPreset
      ),
      lastUpdatedAt: settings?.ui?.settingsLastUpdatedAt ?? null,
      configuredProviders: ['puter' as AIProviderId, ...([] as AIProviderId[])]
        .concat(
          ks?.groqApiKey ? ['groq' as AIProviderId] : [],
          ks?.geminiApiKey ? ['gemini' as AIProviderId] : [],
          ks?.cerebrasApiKey ? ['cerebras' as AIProviderId] : [],
          ks?.openrouterApiKey ? ['openrouter' as AIProviderId] : [],
          ks?.huggingfaceApiKey ? ['huggingface' as AIProviderId] : []
        ),
    }
  }, [settings])

  // Return safe defaults if not loaded yet
  if (!settings) {
    return {
      settings: loadAppSettings(),
      isLoading: true,
      error: null,
      updateAISettings,
      updateKey,
      updateCloudinarySettings,
      saveAll: () => false,
      resetAll,
      hasGroqKey: false,
      hasGeminiKey: false,
      hasOpenRouterKey: false,
      hasCerebrasKey: false,
      hasHuggingFaceKey: false,
      hasCloudinaryConfig: false,
      configuredProviders: ['puter'],
      lastUpdatedAt: null,
    }
  }

  return {
    settings,
    isLoading,
    error,
    updateAISettings,
    updateKey,
    updateCloudinarySettings,
    saveAll,
    resetAll,
    ...computed,
  }
}