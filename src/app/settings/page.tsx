'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  RotateCcw,
  AlertTriangle,
  Cloud,
  CheckCircle2,
  Sparkles,
  Download,
} from 'lucide-react'
import SettingsShell from '@/components/settings/SettingsShell'
import SettingsSection from '@/components/settings/SettingsSection'
import SettingsStatusBadge from '@/components/settings/SettingsStatusBadge'
import ProviderSettingsCard from '@/components/settings/ProviderSettingsCard'
import ModelSelector from '@/components/settings/ModelSelector'
import ProviderPriorityList from '@/components/settings/ProviderPriorityList'
import ApiKeyInput from '@/components/settings/ApiKeyInput'
import { useAppSettings } from '@/hooks/use-app-settings'
import { AI_PROVIDERS, getModelsForProvider, getDefaultModelForProvider } from '@/lib/ai-provider-catalog'
import type { AIProviderId } from '@/lib/ai-provider-catalog'
import { exportSafeSettings } from '@/lib/app-settings'
import { cn } from '@/lib/utils'

type ProviderWithKeys = Exclude<AIProviderId, 'puter'>

export default function SettingsPage() {
  const {
    settings,
    isLoading,
    updateAISettings,
    updateKey,
    updateCloudinarySettings,
    saveAll,
    resetAll,
    hasGroqKey,
    hasGeminiKey,
    hasOpenRouterKey,
    hasCerebrasKey,
    hasHuggingFaceKey,
    configuredProviders,
    lastUpdatedAt,
  } = useAppSettings()

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Handle save
  const handleSave = () => {
    setSaveStatus('saving')
    const ok = saveAll()
    if (ok) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // Handle reset
  const handleReset = () => {
    resetAll()
    setShowResetConfirm(false)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  // Handle provider change - auto-update model
  const handleProviderChange = (providerId: AIProviderId) => {
    const models = getModelsForProvider(providerId)
    const defaultModel = getDefaultModelForProvider(providerId)
    updateAISettings({
      defaultProvider: providerId,
      defaultModel: models.length > 0 ? defaultModel : settings.ai.defaultModel,
    })
  }

  // Format last updated
  const lastUpdatedStr = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString()
    : null

  // Compute provider status for badge
  const providerStatusMap = useMemo(() => {
    return {
      groq: hasGroqKey,
      gemini: hasGeminiKey,
      cerebras: hasCerebrasKey,
      openrouter: hasOpenRouterKey,
      huggingface: hasHuggingFaceKey,
    } as Record<ProviderWithKeys, boolean>
  }, [hasGroqKey, hasGeminiKey, hasOpenRouterKey, hasCerebrasKey, hasHuggingFaceKey])

  const configuredCount = configuredProviders.length - 1 // exclude puter from count

  if (isLoading) {
    return (
      <SettingsShell>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        </div>
      </SettingsShell>
    )
  }

  return (
    <SettingsShell>
      {/* ─── AI Engine Section ─────────────────────────────── */}
      <SettingsSection
        title="AI Engine"
        description="Configure your default AI provider and model used across the app."
      >
        {/* Puter toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Use Puter.js as primary</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Puter works without your own API key. Toggle off to use your own configured providers.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.ai.usePuter}
            onClick={() => updateAISettings({ usePuter: !settings.ai.usePuter })}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
              settings.ai.usePuter
                ? 'bg-purple-600'
                : 'bg-gray-700'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm',
                settings.ai.usePuter && 'translate-x-5'
              )}
            />
          </button>
        </div>

        {/* Default provider selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Default AI Provider</label>
            <select
              value={settings.ai.defaultProvider}
              onChange={(e) => handleProviderChange(e.target.value as AIProviderId)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white hover:bg-white/[0.07] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25rem',
              }}
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <ModelSelector
            models={getModelsForProvider(settings.ai.defaultProvider)}
            value={settings.ai.defaultModel}
            onChange={(modelId) => updateAISettings({ defaultModel: modelId })}
          />
        </div>

        {settings.ai.usePuter && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <p className="text-xs text-purple-300/80">
              Puter.js is active. Your API keys below will be used as fallback if Puter is unavailable.
            </p>
          </div>
        )}
      </SettingsSection>

      {/* ─── Provider Keys Section ─────────────────────────── */}
      <SettingsSection
        title="Provider API Keys"
        description={
          configuredCount > 0
            ? `${configuredCount} provider(s) configured. Expand a provider to enter or update its API key.`
            : 'No external API keys configured yet. Add keys to enable fallback providers.'
        }
      >
        <div className="space-y-3">
          {AI_PROVIDERS.filter((p) => p.id !== 'puter').map((provider) => {
            const providerId = provider.id as ProviderWithKeys
            return (
              <ProviderSettingsCard
                key={provider.id}
                provider={provider}
                apiKeyValue={settings.keys[`${providerId}ApiKey` as keyof typeof settings.keys] as string}
                onApiKeyChange={(value) => updateKey(providerId, value)}
                isDefaultProvider={settings.ai.defaultProvider === provider.id}
                isSelected={settings.ai.defaultProvider === provider.id}
              />
            )
          })}
        </div>
      </SettingsSection>

      {/* ─── Provider Priority Section ─────────────────────── */}
      <SettingsSection
        title="Provider Priority"
        description="Reorder providers for fallback. When the primary provider fails, the next configured provider is tried."
      >
        <ProviderPriorityList
          priority={settings.ai.providerPriority}
          onChange={(newPriority) => updateAISettings({ providerPriority: newPriority })}
        />
      </SettingsSection>

      {/* ─── Cloudinary Section ────────────────────────────── */}
      <SettingsSection
        title="Cloudinary"
        description="Configure Cloudinary credentials for media uploads (audio, images, etc.). Used later for storing generated assets."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ApiKeyInput
            label="Cloud Name"
            description="Your Cloudinary cloud name (e.g., 'mycompany')"
            value={settings.cloudinary.cloudName}
            onChange={(value) => updateCloudinarySettings({ cloudName: value })}
            placeholder="mycloud"
            providerColor="#0284c7"
            isSaved={!!settings.cloudinary.cloudName}
            badge={
              settings.cloudinary.cloudName ? (
                <SettingsStatusBadge variant="configured" label="Set" />
              ) : undefined
            }
          />
          <ApiKeyInput
            label="Upload Preset"
            description="Your Cloudinary unsigned upload preset"
            value={settings.cloudinary.uploadPreset}
            onChange={(value) => updateCloudinarySettings({ uploadPreset: value })}
            placeholder="my_preset"
            providerColor="#0284c7"
            isSaved={!!settings.cloudinary.uploadPreset}
            badge={
              settings.cloudinary.uploadPreset ? (
                <SettingsStatusBadge variant="configured" label="Set" />
              ) : undefined
            }
          />
        </div>
        <div className="md:col-span-2">
          <ApiKeyInput
            label="API Key (optional)"
            description="Cloudinary API key for server-side operations (future use)"
            value={settings.cloudinary.apiKey}
            onChange={(value) => updateCloudinarySettings({ apiKey: value })}
            placeholder="Optional for now..."
            providerColor="#0284c7"
            isSaved={!!settings.cloudinary.apiKey}
          />
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-blue-300/80">
            Used later for storing generated audio, images, and media assets.
          </p>
        </div>
      </SettingsSection>

      {/* ─── Data Actions Section ──────────────────────────── */}
      <SettingsSection
        title="Data Actions"
        description="Save, reset, or export your settings. API keys are stored locally for personal use."
      >
        <div className="space-y-4">
          {/* Save / Reset buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                saveStatus === 'saved'
                  ? 'bg-emerald-600 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20',
                'disabled:opacity-50'
              )}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Save Failed
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>

            <button
              type="button"
              onClick={() => {
                const safe = exportSafeSettings(settings)
                const blob = new Blob([JSON.stringify(safe, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'mwj-settings-backup.json'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Download className="w-4 h-4" />
              Export (safe)
            </button>
          </div>

          {/* Reset confirmation */}
          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300 font-medium">
                      Are you sure? This will clear all API keys and reset all settings.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/70">
              API keys are currently stored locally in your browser for personal use.
              This is <strong>not</strong> fully secure — treat it like a local config file.
              Secure storage (Electron safeStorage, OS keychain, or server-side vault)
              can be added later.
            </p>
          </div>

          {/* Last updated */}
          {lastUpdatedStr && (
            <p className="text-xs text-gray-600 text-right">
              Last saved: {lastUpdatedStr}
            </p>
          )}
        </div>
      </SettingsSection>

      {/* ─── Provider Status Summary ─────────────────────── */}
      <SettingsSection
        title="Provider Status"
        description="Quick overview of all configured providers."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {AI_PROVIDERS.map((provider) => {
            const providerId = provider.id
            const needsKey = provider.requiresApiKey
            const hasKey = providerId !== 'puter'
              ? providerStatusMap[providerId as ProviderWithKeys]
              : true
            const isDefault = settings.ai.defaultProvider === providerId

            return (
              <div
                key={providerId}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors',
                  isDefault
                    ? 'border-purple-500/20 bg-purple-500/5'
                    : 'border-white/5 bg-white/[0.02]'
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: `${provider.colorToken}20`,
                    color: provider.colorToken,
                  }}
                >
                  {provider.label.charAt(0)}
                </div>
                <span className="text-xs text-gray-400 text-center">{provider.label}</span>
                {needsKey ? (
                  hasKey ? (
                    <span className="text-[10px] text-emerald-400">Key set</span>
                  ) : (
                    <span className="text-[10px] text-amber-400">No key</span>
                  )
                ) : (
                  <span className="text-[10px] text-purple-400">Built-in</span>
                )}
                {isDefault && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Default
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </SettingsSection>
    </SettingsShell>
  )
}