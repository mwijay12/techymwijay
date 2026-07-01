'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Zap, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AI_PROVIDERS } from '@/lib/ai-provider-catalog'
import { useAppSettings } from '@/hooks/use-app-settings'
import { ProviderStatusBadge } from '@/components/ai/ProviderStatusBadge'

type Props = {
  activeProvider: string
  activeModel: string
  onProviderChange: (provider: string) => void
  onModelChange: (model: string) => void
}

export function ModelSwitcher({
  activeProvider,
  activeModel,
  onProviderChange,
  onModelChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { settings } = useAppSettings()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build available providers from catalog + configured keys
  const availableProviders = AI_PROVIDERS.filter((p) => {
    if (p.id === 'puter') return settings?.ai?.usePuter !== false
    if (!p.requiresApiKey) return true
    // Check if key exists in settings
    const keyField = `${p.id}ApiKey` as keyof typeof settings.keys
    return !!settings?.keys?.[keyField]
  })

  const currentProvider = AI_PROVIDERS.find((p) => p.id === activeProvider)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm"
      >
        <Zap className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-white/80 truncate max-w-[120px]">
          {activeProvider === 'auto' ? 'Auto' : currentProvider?.label ?? activeProvider}
        </span>
        <span className="text-white/40 text-xs truncate max-w-[80px]">
          {activeModel}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 glass-card p-2 z-50 max-h-80 overflow-y-auto"
          >
            {/* Auto option */}
            <button
              onClick={() => { onProviderChange('auto'); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors ${
                activeProvider === 'auto' ? 'bg-purple-500/10 border border-purple-500/20' : ''
              }`}
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/90">Auto Rotate</div>
                <div className="text-xs text-white/40">Uses best available provider</div>
              </div>
              {activeProvider === 'auto' && <Check className="w-4 h-4 text-purple-400" />}
            </button>

            <div className="h-px bg-white/5 my-1" />

            {/* Provider list */}
            {availableProviders.map((provider) => (
              <div key={provider.id}>
                <button
                  onClick={() => {
                    onProviderChange(provider.id)
                    // Auto-select default model for this provider
                    if (provider.defaultModel) {
                      onModelChange(provider.defaultModel)
                    }
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors ${
                    activeProvider === provider.id ? 'bg-purple-500/10 border border-purple-500/20' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/90">{provider.label}</span>
                      <ProviderStatusBadge providerId={provider.id} showLabel={false} size="sm" />
                    </div>
                    <div className="text-xs text-white/40">{provider.description}</div>
                  </div>
                  {activeProvider === provider.id && <Check className="w-4 h-4 text-purple-400" />}
                </button>

                {/* Show models if this provider is selected */}
                {activeProvider === provider.id && provider.supportsModels?.length > 0 && (
                  <div className="ml-6 mt-1 mb-2 space-y-0.5">
                    {provider.supportsModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => { onModelChange(model.id); setOpen(false) }}
                        className={`w-full text-left px-3 py-1 rounded text-xs transition-colors ${
                          activeModel === model.id
                            ? 'text-purple-300 bg-purple-500/10'
                            : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {model.label}
                        {model.description && (
                          <span className="text-white/30 ml-1">· {model.description}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}