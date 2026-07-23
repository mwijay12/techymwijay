'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Mic,
  User,
  Shield,
  Settings,
  AlertTriangle,
  Save,
  RotateCcw,
  Info,
  CheckCircle,
  Zap,
} from 'lucide-react'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { SettingsSection } from '@/components/settings/SettingsSection'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { ProviderSettingsCard } from '@/components/settings/ProviderSettingsCard'
import { ProviderPriorityList } from '@/components/settings/ProviderPriorityList'
import { SettingsToast, useToast } from '@/components/settings/SettingsToast'
import { NotificationSettings } from '@/components/electron/NotificationSettings'
import { WidgetToggle } from '@/components/electron/WidgetToggle'

import { useAuth } from '@/components/auth/AuthProvider'
import { useAppSettings } from '@/hooks/use-app-settings'
import { useSettingsHealth } from '@/hooks/use-settings-health'
import { PROVIDER_FAILOVER_ORDER } from '@/lib/ai-provider-catalog'
import type { AIProvider } from '@/types/ai'
import { cn } from '@/lib/utils'

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <label className="relative cursor-pointer flex-shrink-0 ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={cn(
          'w-10 h-5 rounded-full transition-all duration-200',
          'peer-checked:bg-purple-600 bg-gray-700',
          'after:content-[""] after:absolute after:top-0.5 after:left-0.5',
          'after:w-4 after:h-4 after:rounded-full after:bg-white',
          'after:transition-all after:duration-200',
          'peer-checked:after:translate-x-5'
        )} />
      </label>
    </div>
  )
}

function SelectRow({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm bg-gray-900 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all duration-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-white font-medium">{label}</p>
        <span className="text-sm font-mono text-purple-400">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
      />
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function ResetDialog({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Reset All Settings?</h3>
            <p className="text-xs text-gray-400">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-gray-300">
          This will restore all provider models, voice parameters, security lock timeouts, and personal preferences back to system defaults.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25 transition-all"
          >
            Reset Everything
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { settings, updateSettings, resetToDefaults, toggleProvider } = useAppSettings()
  const { health, totalKeys, testProvider } = useSettingsHealth()
  const { toasts, addToast, dismiss } = useToast()

  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    updateSettings(settings)
    setIsSaving(false)
    addToast('success', 'Settings saved successfully!')
  }

  const handleResetConfirm = () => {
    resetToDefaults()
    setShowResetDialog(false)
    addToast('success', 'All settings reset to system defaults')
  }

  return (
    <ProtectedRoute>
      <SettingsShell>
        {(activeSection) => (
          <div className="space-y-6">
            {/* Top Bar with Save / Reset buttons */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>
                  Key pool status:{' '}
                  <strong className="text-white font-mono">{totalKeys} keys</strong> active
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowResetDialog(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>

            {/* Section 1: AI Providers */}
            {(activeSection === 'ai' || activeSection === 'all') && (
              <SettingsSection
                title="AI Providers & Key Pools"
                description="Round-robin rotation, models & failover order"
                icon={Bot}
                iconColor="text-purple-400"
                badge={`${totalKeys} active keys`}
              >
                <div className="space-y-4">
                  {PROVIDER_FAILOVER_ORDER.map((provider) => (
                    <ProviderSettingsCard
                      key={provider}
                      provider={provider}
                      health={health[provider]}
                      settings={settings}
                      onToggle={toggleProvider}
                      onModelChange={(model) => updateSettings({ preferredModel: model })}
                      onTest={testProvider}
                    />
                  ))}

                  <div className="pt-4 border-t border-white/10">
                    <ProviderPriorityList health={health} />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Section 2: Voice & Speech */}
            {(activeSection === 'voice' || activeSection === 'all') && (
              <SettingsSection
                title="Voice & Speech Settings"
                description="Configure TTS synthesis & STT dictation options"
                icon={Mic}
                iconColor="text-blue-400"
              >
                <div className="space-y-1">
                  <SelectRow
                    label="STT Primary Language"
                    description="Default dictation model target language"
                    value={settings.voice?.sttLanguage ?? 'sw-KE'}
                    options={[
                      { value: 'sw-KE', label: 'Swahili (Tanzania & Kenya) 🇹🇿' },
                      { value: 'en-US', label: 'English (United States)' },
                      { value: 'auto', label: 'Auto Detect Language' },
                    ]}
                    onChange={(v) =>
                      updateSettings({
                        voice: { ...settings.voice, sttLanguage: v },
                      })
                    }
                  />

                  <SliderRow
                    label="TTS Speech Speed"
                    value={settings.voice?.ttsSpeed ?? 1.0}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    unit="x"
                    onChange={(v) =>
                      updateSettings({
                        voice: { ...settings.voice, ttsSpeed: v },
                      })
                    }
                  />

                  <SliderRow
                    label="TTS Pitch"
                    value={settings.voice?.ttsPitch ?? 1.0}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    unit=""
                    onChange={(v) =>
                      updateSettings({
                        voice: { ...settings.voice, ttsPitch: v },
                      })
                    }
                  />

                  <ToggleRow
                    label="Auto-save Transcriptions to Vault"
                    description="Automatically save completed STT transcripts"
                    checked={settings.voice?.sttAutoSave ?? true}
                    onChange={(v) =>
                      updateSettings({
                        voice: { ...settings.voice, sttAutoSave: v },
                      })
                    }
                  />
                </div>
              </SettingsSection>
            )}

            {/* Section 3: Personal Settings */}
            {(activeSection === 'personal' || activeSection === 'all') && (
              <SettingsSection
                title="Personal Preferences"
                description="Locale, currency, and user defaults"
                icon={User}
                iconColor="text-yellow-400"
              >
                <div className="space-y-1">
                  <SelectRow
                    label="Default Currency"
                    description="Used in spending tracker and budget summary"
                    value={settings.personal?.currency ?? 'TZS'}
                    options={[
                      { value: 'TZS', label: 'Tanzanian Shilling (TZS / TSh)' },
                      { value: 'USD', label: 'US Dollar (USD / $)' },
                      { value: 'KES', label: 'Kenyan Shilling (KES)' },
                    ]}
                    onChange={(v) =>
                      updateSettings({
                        personal: { ...settings.personal, currency: v as 'TZS' | 'USD' | 'KES' },
                      })
                    }
                  />

                  <SelectRow
                    label="Language Mode"
                    description="AI response language preference"
                    value={settings.personal?.language ?? 'sw-en'}
                    options={[
                      { value: 'sw-en', label: 'Swahili + English (Mixed Code-Switching)' },
                      { value: 'en', label: 'English Only' },
                      { value: 'sw', label: 'Swahili Only' },
                    ]}
                    onChange={(v) =>
                      updateSettings({
                        personal: { ...settings.personal, language: v as 'sw' | 'en' | 'sw-en' },
                      })
                    }
                  />

                  <SelectRow
                    label="Timezone"
                    description="Used for logs, todos, and meeting scheduler"
                    value={settings.personal?.timezone ?? 'Africa/Dar_es_Salaam'}
                    options={[
                      { value: 'Africa/Dar_es_Salaam', label: 'Africa/Dar_es_Salaam (EAT +03:00)' },
                      { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
                    ]}
                    onChange={(v) =>
                      updateSettings({
                        personal: { ...settings.personal, timezone: v },
                      })
                    }
                  />
                </div>
              </SettingsSection>
            )}

            {/* Section 4: Vault Security */}
            {(activeSection === 'vault' || activeSection === 'all') && (
              <SettingsSection
                title="Vault & Encryption Controls"
                description="Local storage auto-lock and secret protection"
                icon={Shield}
                iconColor="text-emerald-400"
              >
                <div className="space-y-1">
                  <SliderRow
                    label="Auto-Lock Timeout"
                    value={settings.vault?.autoLockMinutes ?? 15}
                    min={0}
                    max={60}
                    step={5}
                    unit=" min"
                    onChange={(v) =>
                      updateSettings({
                        vault: { ...settings.vault, autoLockMinutes: v },
                      })
                    }
                  />

                  <ToggleRow
                    label="Mask Secret Content by Default"
                    description="Keep passwords and API keys blurred until clicked"
                    checked={!settings.vault?.showSecretsByDefault}
                    onChange={(v) =>
                      updateSettings({
                        vault: { ...settings.vault, showSecretsByDefault: !v },
                      })
                    }
                  />
                </div>
              </SettingsSection>
            )}

            {/* Section 5: App Behavior */}
            {(activeSection === 'app' || activeSection === 'all') && (
              <SettingsSection
                title="App Behavior & Electron Desktop"
                description="Offline cache, desktop notifications, widget & sync controls"
                icon={Settings}
                iconColor="text-gray-400"
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <ToggleRow
                      label="Firestore Cloud Auto-Sync"
                      description="Keep local state continuously backed up to Firestore"
                      checked={settings.app?.autoSyncEnabled ?? true}
                      onChange={(v) =>
                        updateSettings({
                          app: { ...settings.app, autoSyncEnabled: v },
                        })
                      }
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Electron Desktop Advanced Features
                    </h4>
                    <NotificationSettings />
                    <div className="pt-3">
                      <WidgetToggle />
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Section 6: Danger Zone */}
            {(activeSection === 'danger' || activeSection === 'all') && (
              <SettingsSection
                title="Danger Zone"
                description="Reset app preferences to factory defaults"
                icon={AlertTriangle}
                iconColor="text-red-400"
              >
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-red-400">Reset System Preferences</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Clears local storage preferences. Server API key pools in .env.local remain untouched.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResetDialog(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all flex-shrink-0"
                  >
                    Reset All Preferences
                  </button>
                </div>
              </SettingsSection>
            )}

            {/* Toast Notifications */}
            <SettingsToast toasts={toasts} onDismiss={dismiss} />

            {/* Reset Confirmation Dialog */}
            <ResetDialog
              isOpen={showResetDialog}
              onConfirm={handleResetConfirm}
              onCancel={() => setShowResetDialog(false)}
            />
          </div>
        )}
      </SettingsShell>
    </ProtectedRoute>
  )
}