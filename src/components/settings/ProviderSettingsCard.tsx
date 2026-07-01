'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import ApiKeyInput from './ApiKeyInput'
import SettingsStatusBadge from './SettingsStatusBadge'
import type { AIProviderEntry } from '@/lib/ai-provider-catalog'

interface ProviderSettingsCardProps {
  provider: AIProviderEntry
  apiKeyValue: string
  onApiKeyChange: (value: string) => void
  isDefaultProvider: boolean
  isSelected: boolean
}

export default function ProviderSettingsCard({
  provider,
  apiKeyValue,
  onApiKeyChange,
  isDefaultProvider,
  isSelected,
}: ProviderSettingsCardProps) {
  const [expanded, setExpanded] = useState(apiKeyValue.length > 0)
  const hasApiKey = provider.requiresApiKey ? apiKeyValue.length > 0 : true

  const statusBadge = !provider.requiresApiKey ? (
    <SettingsStatusBadge variant="puter" label="No key needed" />
  ) : hasApiKey ? (
    <SettingsStatusBadge variant="configured" />
  ) : (
    <SettingsStatusBadge variant="missing" />
  )

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border transition-all duration-300 overflow-hidden',
        isSelected
          ? 'border-purple-500/30 bg-purple-500/5'
          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: `${provider.colorToken}20`,
              color: provider.colorToken,
            }}
          >
            {provider.label.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {provider.label}
              </span>
              {isDefaultProvider && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{provider.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusBadge}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </button>

      {expanded && provider.requiresApiKey && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4"
        >
          <div className="border-t border-white/5 pt-4">
            <ApiKeyInput
              label={`${provider.label} API Key`}
              description={`Enter your ${provider.label} API key to enable this provider.`}
              value={apiKeyValue}
              onChange={onApiKeyChange}
              placeholder={`${provider.label.toLowerCase()}_...`}
              providerColor={provider.colorToken}
              isSaved={hasApiKey}
              badge={
                hasApiKey ? (
                  <SettingsStatusBadge variant="configured" label="Saved" />
                ) : undefined
              }
            />
          </div>
        </motion.div>
      )}

      {expanded && !provider.requiresApiKey && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4"
        >
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300/80">
                {provider.statusNote || 'This provider does not require an API key.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}