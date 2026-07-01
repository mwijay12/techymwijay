'use client'

import { useEffect, useState } from 'react'
import { providerHealth } from '@/lib/ai-engine'
import type { ProviderHealthStatus } from '@/lib/provider-health'

const STATUS_CONFIG: Record<ProviderHealthStatus, { label: string; color: string; dot: string }> = {
  healthy:      { label: 'Online',       color: 'text-emerald-400', dot: 'bg-emerald-400' },
  degraded:     { label: 'Degraded',     color: 'text-yellow-400',  dot: 'bg-yellow-400' },
  down:         { label: 'Down',         color: 'text-red-400',     dot: 'bg-red-400' },
  rate_limited: { label: 'Rate Limited', color: 'text-orange-400',  dot: 'bg-orange-400' },
  unconfigured: { label: 'No Key',       color: 'text-zinc-500',    dot: 'bg-zinc-500' },
}

type Props = {
  providerId: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ProviderStatusBadge({ providerId, showLabel = true, size = 'sm' }: Props) {
  const [status, setStatus] = useState<ProviderHealthStatus>('healthy')

  useEffect(() => {
    setStatus(providerHealth.getStatus(providerId))
    const interval = setInterval(() => {
      setStatus(providerHealth.getStatus(providerId))
    }, 5000)
    return () => clearInterval(interval)
  }, [providerId])

  const config = STATUS_CONFIG[status]

  return (
    <span className={`inline-flex items-center gap-1.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <span
        className={`inline-block rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${config.dot} ${
          status === 'healthy' ? 'animate-pulse' : ''
        }`}
      />
      {showLabel && <span className={config.color}>{config.label}</span>}
    </span>
  )
}