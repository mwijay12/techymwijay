/**
 * App Settings — schema, defaults, persistence layer
 *
 * Storage: browser localStorage under key "mwj-app-settings"
 * Priority: user saved > env defaults > hardcoded defaults
 *
 * Designed for personal use. API keys are stored locally only.
 * Future: swap for Electron safeStorage or authenticated Firestore.
 */

import { z } from 'zod'
import { env } from './env'
import { getItem, setItem, removeItem } from './browser-storage'
import type { AIProviderId } from './ai-provider-catalog'
import { DEFAULT_PROVIDER_PRIORITY } from './ai-provider-catalog'

// ─── Storage Key ────────────────────────────────────────────
const STORAGE_KEY = 'mwj-app-settings'

// ─── Zod Schema ─────────────────────────────────────────────
const aiProviderIdSchema = z.enum([
  'puter',
  'groq',
  'gemini',
  'cerebras',
  'openrouter',
  'huggingface',
])

const appSettingsSchema = z.object({
  ai: z.object({
    usePuter: z.boolean(),
    defaultProvider: aiProviderIdSchema,
    defaultModel: z.string().min(1),
    providerPriority: z.array(aiProviderIdSchema),
  }),
  keys: z.object({
    groqApiKey: z.string().optional().default(''),
    geminiApiKey: z.string().optional().default(''),
    cerebrasApiKey: z.string().optional().default(''),
    openrouterApiKey: z.string().optional().default(''),
    huggingfaceApiKey: z.string().optional().default(''),
    puterMode: z.enum(['builtin', 'manual']).optional().default('builtin'),
  }),
  cloudinary: z.object({
    cloudName: z.string().optional().default(''),
    uploadPreset: z.string().optional().default(''),
    apiKey: z.string().optional().default(''),
  }),
  ui: z.object({
    settingsLastUpdatedAt: z.number().nullable().optional().default(null),
  }),
})

export type AppSettings = z.infer<typeof appSettingsSchema>
export type AppSettingsAI = AppSettings['ai']
export type AppSettingsKeys = AppSettings['keys']
export type AppSettingsCloudinary = AppSettings['cloudinary']

// ─── Defaults ───────────────────────────────────────────────
export function getDefaultSettings(): AppSettings {
  return {
    ai: {
      usePuter: env.ai.usePuter,
      defaultProvider: env.ai.defaultProvider as AIProviderId,
      defaultModel: env.ai.defaultModel,
      providerPriority: [...DEFAULT_PROVIDER_PRIORITY],
    },
    keys: {
      groqApiKey: '',
      geminiApiKey: '',
      cerebrasApiKey: '',
      openrouterApiKey: '',
      huggingfaceApiKey: '',
      puterMode: 'builtin',
    },
    cloudinary: {
      cloudName: env.cloudinary.cloudName ?? '',
      uploadPreset: env.cloudinary.uploadPreset ?? '',
      apiKey: '',
    },
    ui: {
      settingsLastUpdatedAt: null,
    },
  }
}

// ─── Load / Save / Reset ────────────────────────────────────

/**
 * Load settings from localStorage, merging with defaults.
 * Returns defaults if storage is empty, corrupt, or unavailable.
 * Never throws.
 */
export function loadAppSettings(): AppSettings {
  try {
    const raw = getItem(STORAGE_KEY)
    if (!raw) return getDefaultSettings()

    const parsed = JSON.parse(raw)
    const validated = appSettingsSchema.parse(parsed)
    return validated
  } catch (err) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('[app-settings] Failed to load settings, using defaults:', err)
    }
    return getDefaultSettings()
  }
}

/**
 * Save full settings object to localStorage.
 * Returns true on success.
 */
export function saveAppSettings(settings: AppSettings): boolean {
  try {
    const withTimestamp: AppSettings = {
      ...settings,
      ui: {
        ...settings.ui,
        settingsLastUpdatedAt: Date.now(),
      },
    }
    const raw = JSON.stringify(withTimestamp)
    return setItem(STORAGE_KEY, raw)
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[app-settings] Failed to save settings:', err)
    }
    return false
  }
}

/**
 * Reset all settings to defaults and clear stored data.
 */
export function resetAppSettings(): AppSettings {
  removeItem(STORAGE_KEY)
  return getDefaultSettings()
}

/**
 * Merge partial settings with defaults.
 * Useful for applying only changed fields.
 */
export function mergeWithDefaults(partial: Partial<AppSettings>): AppSettings {
  return {
    ...getDefaultSettings(),
    ...partial,
    ai: {
      ...getDefaultSettings().ai,
      ...partial.ai,
    },
    keys: {
      ...getDefaultSettings().keys,
      ...partial.keys,
    },
    cloudinary: {
      ...getDefaultSettings().cloudinary,
      ...partial.cloudinary,
    },
    ui: {
      ...getDefaultSettings().ui,
      ...partial.ui,
    },
  }
}

// ─── Computed Helpers ───────────────────────────────────────

export type ProviderKeyMap = Record<
  Exclude<AIProviderId, 'puter'>,
  { hasKey: boolean; keyPreview: string | null }
>

/**
 * Returns a map of which providers have keys configured.
 * Excludes Puter since it doesn't need a key.
 */
export function getProviderConfiguredMap(keys: AppSettingsKeys): ProviderKeyMap {
  return {
    groq: { hasKey: !!keys.groqApiKey, keyPreview: maskKey(keys.groqApiKey) },
    gemini: { hasKey: !!keys.geminiApiKey, keyPreview: maskKey(keys.geminiApiKey) },
    cerebras: { hasKey: !!keys.cerebrasApiKey, keyPreview: maskKey(keys.cerebrasApiKey) },
    openrouter: { hasKey: !!keys.openrouterApiKey, keyPreview: maskKey(keys.openrouterApiKey) },
    huggingface: { hasKey: !!keys.huggingfaceApiKey, keyPreview: maskKey(keys.huggingfaceApiKey) },
  }
}

/**
 * Mask an API key for display — shows first 4 + last 4 chars.
 * Returns null if key is empty.
 */
function maskKey(key?: string): string | null {
  if (!key || key.length < 8) return key ?? null
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

/**
 * Safe partial preview of config map (for exports, logs).
 */
export function getSafeProviderMap(
  keys: AppSettingsKeys
): Record<string, { configured: boolean; preview: string | null }> {
  const map = getProviderConfiguredMap(keys)
  return Object.fromEntries(
    Object.entries(map).map(([id, info]) => [id, { configured: info.hasKey, preview: info.keyPreview }])
  )
}

/**
 * Export settings without secret keys (for debugging or sync).
 */
export function exportSafeSettings(settings: AppSettings) {
  const { keys, ...safe } = settings
  return {
    ...safe,
    keyStatus: getSafeProviderMap(keys),
    _note: 'API keys omitted for safety',
  }
}