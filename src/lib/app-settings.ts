/**
 * App Settings Schema & Persistence
 * Manages user preferences and provider configurations.
 */

import { z } from 'zod'
import type { AIProvider } from '@/types/ai'

const aiProviderIdSchema = z.enum([
  'openrouter', 'groq', 'huggingface', 'puter', 'gemini', 'cerebras'
])

// ─── Zod Schema ────────────────────────────────────────────
export const AppSettingsSchema = z.object({
  // AI section (backward-compatible structure)
  ai: z.object({
    usePuter: z.boolean().default(true),
    defaultProvider: aiProviderIdSchema.default('openrouter'),
    defaultModel: z.string().default('google/gemini-flash-1.5'),
    providerPriority: z.array(aiProviderIdSchema).default(['openrouter', 'groq', 'huggingface', 'puter', 'gemini', 'cerebras']),
  }).default({
    usePuter: true,
    defaultProvider: 'openrouter',
    defaultModel: 'google/gemini-flash-1.5',
    providerPriority: ['openrouter', 'groq', 'huggingface', 'puter', 'gemini', 'cerebras'],
  }),

  // Flat AI preferences
  preferredProvider: aiProviderIdSchema.default('openrouter'),
  preferredModel: z.string().default('google/gemini-flash-1.5'),

  // Provider enable/disable toggles
  providers: z.object({
    openrouter: z.boolean().default(true),
    groq: z.boolean().default(true),
    elevenlabs: z.boolean().default(true),
    huggingface: z.boolean().default(true),
    puter: z.boolean().default(true),
  }).default({
    openrouter: true,
    groq: true,
    elevenlabs: true,
    huggingface: true,
    puter: true,
  }),

  // Voice settings
  voice: z.object({
    ttsVoiceId: z.string().default(''),
    ttsSpeed: z.number().min(0.5).max(2.0).default(1.0),
    ttsPitch: z.number().min(0.5).max(2.0).default(1.0),
    sttLanguage: z.string().default('sw-KE'),
    sttAutoSave: z.boolean().default(true),
  }).default({
    ttsVoiceId: '',
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    sttLanguage: 'sw-KE',
    sttAutoSave: true,
  }),

  // Personal preferences
  personal: z.object({
    currency: z.enum(['TZS', 'USD', 'KES']).default('TZS'),
    language: z.enum(['sw', 'en', 'sw-en']).default('sw-en'),
    theme: z.enum(['dark', 'light']).default('dark'),
    timezone: z.string().default('Africa/Dar_es_Salaam'),
  }).default({
    currency: 'TZS',
    language: 'sw-en',
    theme: 'dark',
    timezone: 'Africa/Dar_es_Salaam',
  }),

  // Vault settings
  vault: z.object({
    autoLockMinutes: z.number().min(0).max(60).default(15),
    defaultCategory: z.enum(['passwords', 'code', 'keys', 'notes']).default('notes'),
    showSecretsByDefault: z.boolean().default(false),
  }).default({
    autoLockMinutes: 15,
    defaultCategory: 'notes',
    showSecretsByDefault: false,
  }),

  // App behaviour
  app: z.object({
    showOnboarding: z.boolean().default(true),
    analyticsEnabled: z.boolean().default(true),
    notificationsEnabled: z.boolean().default(true),
    autoSyncEnabled: z.boolean().default(true),
  }).default({
    showOnboarding: true,
    analyticsEnabled: true,
    notificationsEnabled: true,
    autoSyncEnabled: true,
  }),

  // Cloudinary configuration
  cloudinary: z.object({
    cloudName: z.string().default('kgwfenp9'),
    uploadPreset: z.string().default('mwijay_preset'),
    apiKey: z.string().default(''),
  }).default({
    cloudName: 'kgwfenp9',
    uploadPreset: 'mwijay_preset',
    apiKey: '',
  }),

  // Keys object
  keys: z.object({
    groqApiKey: z.string().default(''),
    geminiApiKey: z.string().default(''),
    cerebrasApiKey: z.string().default(''),
    openrouterApiKey: z.string().default(''),
    huggingfaceApiKey: z.string().default(''),
    puterMode: z.string().default('builtin'),
  }).default({
    groqApiKey: '',
    geminiApiKey: '',
    cerebrasApiKey: '',
    openrouterApiKey: '',
    huggingfaceApiKey: '',
    puterMode: 'builtin',
  }),

  // UI state
  ui: z.object({
    settingsLastUpdatedAt: z.number().nullable().default(null),
  }).default({
    settingsLastUpdatedAt: null,
  }),

  // Metadata
  version: z.string().default('1.0.0'),
  lastUpdatedAt: z.string().default(''),
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

export const DEFAULT_SETTINGS: AppSettings = AppSettingsSchema.parse({})

const SETTINGS_KEY = 'mwijay_app_settings'
const LEGACY_STORAGE_KEY = 'mwj-app-settings'

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const stored = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS

    const parsed = JSON.parse(stored)

    const merged = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
      providers: { ...DEFAULT_SETTINGS.providers, ...parsed.providers },
      voice: { ...DEFAULT_SETTINGS.voice, ...parsed.voice },
      personal: { ...DEFAULT_SETTINGS.personal, ...parsed.personal },
      vault: { ...DEFAULT_SETTINGS.vault, ...parsed.vault },
      app: { ...DEFAULT_SETTINGS.app, ...parsed.app },
      cloudinary: { ...DEFAULT_SETTINGS.cloudinary, ...parsed.cloudinary },
      keys: { ...DEFAULT_SETTINGS.keys, ...parsed.keys },
      ui: { ...DEFAULT_SETTINGS.ui, ...parsed.ui },
    }

    return AppSettingsSchema.parse(merged)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const current = loadSettings()
    const updated: AppSettings = {
      ...current,
      ...settings,
      ai: { ...current.ai, ...settings.ai },
      providers: { ...current.providers, ...settings.providers },
      voice: { ...current.voice, ...settings.voice },
      personal: { ...current.personal, ...settings.personal },
      vault: { ...current.vault, ...settings.vault },
      app: { ...current.app, ...settings.app },
      cloudinary: { ...current.cloudinary, ...settings.cloudinary },
      keys: { ...current.keys, ...settings.keys },
      ui: { ...current.ui, ...settings.ui, settingsLastUpdatedAt: Date.now() },
      lastUpdatedAt: new Date().toISOString(),
      version: '1.0.0',
    }

    const validated = AppSettingsSchema.parse(updated)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(validated))
    return validated
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function resetSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  localStorage.removeItem(SETTINGS_KEY)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
  return DEFAULT_SETTINGS
}

export function toggleProvider(
  provider: keyof AppSettings['providers'],
  enabled: boolean
): AppSettings {
  const current = loadSettings()
  return saveSettings({
    providers: {
      ...current.providers,
      [provider]: enabled,
    },
  })
}

// Backward-compatible exports
export function loadAppSettings(): AppSettings { return loadSettings() }
export function saveAppSettings(settings: AppSettings): boolean {
  try { saveSettings(settings); return true } catch { return false }
}
export function resetAppSettings(): AppSettings { return resetSettings() }
export function getDefaultSettings(): AppSettings { return DEFAULT_SETTINGS }

function maskKey(key?: string): string | null {
  if (!key || key.length < 8) return key ?? null
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

export function getProviderConfiguredMap(keys: AppSettings['keys']) {
  return {
    groq: { hasKey: !!keys.groqApiKey, keyPreview: maskKey(keys.groqApiKey) },
    gemini: { hasKey: !!keys.geminiApiKey, keyPreview: maskKey(keys.geminiApiKey) },
    cerebras: { hasKey: !!keys.cerebrasApiKey, keyPreview: maskKey(keys.cerebrasApiKey) },
    openrouter: { hasKey: !!keys.openrouterApiKey, keyPreview: maskKey(keys.openrouterApiKey) },
    huggingface: { hasKey: !!keys.huggingfaceApiKey, keyPreview: maskKey(keys.huggingfaceApiKey) },
  }
}

export function getSafeProviderMap(keys: AppSettings['keys']) {
  const map = getProviderConfiguredMap(keys)
  return Object.fromEntries(
    Object.entries(map).map(([id, info]) => [id, { configured: info.hasKey, preview: info.keyPreview }])
  )
}

export function exportSafeSettings(settings: AppSettings) {
  const { keys, ...safe } = settings
  return {
    ...safe,
    keyStatus: getSafeProviderMap(keys),
    _note: 'API keys omitted for safety',
  }
}