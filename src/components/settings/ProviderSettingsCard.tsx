'use client'

import { useState } from 'react'
import { ExternalLink, Play, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROVIDER_INFO } from '@/lib/ai-provider-catalog'
import { SettingsStatusBadge } from './SettingsStatusBadge'
import { ModelSelector } from './ModelSelector'
import { ApiKeyInput } from './ApiKeyInput'
import type { AIProvider } from '@/types/ai'
import type { ProviderHealth } from '@/hooks/use-settings-health'
import type { AppSettings } from '@/lib/app-settings'

interface ProviderSettingsCardProps {
  provider: AIProvider
  health: ProviderHealth
  settings: AppSettings
  onToggle: (provider: AIProvider, enabled: boolean) => void
  onModelChange: (model: string) => void
  onTest: (provider: AIProvider) => Promise<boolean>
  className?: string
}

export function ProviderSettingsCard({
  provider,
  health,
  settings,
  onToggle,
  onModelChange,
  onTest,
  className,
}: ProviderSettingsCardProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)

  const info = PROVIDER_INFO[provider] || {
    displayName: provider,
    description: '',
    docsUrl: '#',
    color: '#8b5cf6',
    isFree: true,
  }

  const isEnabled = settings.providers?.[provider as keyof typeof settings.providers] ?? true

  const handleTest = async () => {
    if (isTesting) return
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await onTest(provider)
      setTestResult(result)
      setTimeout(() => setTestResult(null), 4000)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300 overflow-hidden',
        isEnabled
          ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
          : 'bg-black/20 border-white/5 opacity-60',
        className
      )}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: info.color }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">
              {info.displayName}
            </h3>
            {info.isFree && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                FREE
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {info.description}
          </p>
        </div>

        <SettingsStatusBadge
          status={
            isTesting
              ? 'testing'
              : testResult === true
              ? 'healthy'
              : testResult === false
              ? 'error'
              : health.status
          }
          keyCount={health.keyCount}
          latencyMs={health.latencyMs}
        />

        <label className="relative flex-shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onToggle(provider, e.target.checked)}
            className="sr-only peer"
          />
          <div className={cn(
            'w-9 h-5 rounded-full transition-all duration-200',
            'peer-checked:bg-purple-600 bg-gray-700',
            'after:content-[""] after:absolute after:top-0.5 after:left-0.5',
            'after:w-4 after:h-4 after:rounded-full after:bg-white',
            'after:transition-all after:duration-200',
            'peer-checked:after:translate-x-4'
          )} />
        </label>
      </div>

      {isEnabled && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
          <ApiKeyInput
            label={`${info.displayName} API Keys`}
            value=""
            onChange={() => {}}
            isPoolMode
            keyCount={health.keyCount}
            hint={
              provider === 'puter'
                ? 'Puter.js requires no API key — it is always available as a browser-side fallback.'
                : `Add comma-separated keys to .env.local as ${provider.toUpperCase()}_API_KEYS`
            }
          />

          {provider !== 'elevenlabs' && provider !== 'puter' && (
            <ModelSelector
              provider={provider}
              selectedModel={settings.preferredModel}
              onSelect={onModelChange}
              disabled={!isEnabled}
            />
          )}

          <div className="flex items-center justify-between pt-1">
            <a
              href={info.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              <ExternalLink className="w-3 h-3" />
              Get API Keys
            </a>

            <button
              onClick={handleTest}
              disabled={isTesting || (!health.isConfigured && provider !== 'puter')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                'transition-all duration-200 border',
                testResult === true
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : testResult === false
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10',
                (isTesting || (!health.isConfigured && provider !== 'puter')) &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              {isTesting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              {isTesting
                ? 'Testing...'
                : testResult === true
                ? 'Connected ✓'
                : testResult === false
                ? 'Failed ✗'
                : 'Test Connection'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderSettingsCard