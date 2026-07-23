'use client'

import { ArrowDown, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROVIDER_INFO, PROVIDER_FAILOVER_ORDER } from '@/lib/ai-provider-catalog'
import type { AIProvider } from '@/types/ai'
import { SettingsStatusBadge } from './SettingsStatusBadge'
import type { ProviderHealth } from '@/hooks/use-settings-health'

interface ProviderPriorityListProps {
  health: Record<AIProvider, ProviderHealth>
  className?: string
}

export function ProviderPriorityList({
  health,
  className,
}: ProviderPriorityListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-white">
          Failover Order
        </span>
        <span className="text-xs text-gray-400">
          (automatic — requests cascade down)
        </span>
      </div>

      <div className="space-y-1.5">
        {PROVIDER_FAILOVER_ORDER.map((provider, index) => {
          const info = PROVIDER_INFO[provider]
          const providerHealth = health[provider]

          return (
            <div
              key={provider}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                'bg-white/5 border transition-all duration-200',
                providerHealth?.status === 'healthy'
                  ? 'border-white/10 hover:border-purple-500/30'
                  : 'border-white/5 opacity-60'
              )}
            >
              <div
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${info.color}20`, color: info.color }}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {info.displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {info.description}
                </p>
              </div>

              <SettingsStatusBadge
                status={providerHealth?.status ?? 'unconfigured'}
                keyCount={providerHealth?.keyCount}
              />

              {index < PROVIDER_FAILOVER_ORDER.length - 1 && (
                <ArrowDown className="flex-shrink-0 w-3 h-3 text-gray-600" />
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2 pl-1">
        💡 If provider 1 fails or rate-limits, provider 2 is tried automatically.
        Puter.js is always the final fallback and requires no key.
      </p>
    </div>
  )
}

export default ProviderPriorityList