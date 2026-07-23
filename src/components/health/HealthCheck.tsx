'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type HealthStatus = 'checking' | 'healthy' | 'degraded' | 'down' | 'skipped'

export interface HealthCheckResult {
  status: HealthStatus
  message: string
  latencyMs?: number
  details?: Record<string, unknown>
}

interface HealthCheckProps {
  name: string
  description: string
  status: HealthStatus
  message?: string
  latencyMs?: number
  details?: Record<string, unknown>
  className?: string
}

export function HealthCheckItem({
  name,
  description,
  status,
  message,
  latencyMs,
  details,
  className,
}: HealthCheckProps) {
  const [showDetails, setShowDetails] = useState(false)

  const statusConfig = {
    checking: {
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      color: 'text-gray-400',
      bg: 'bg-white/5',
      border: 'border-white/10',
      label: 'Checking...',
    },
    healthy: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      label: 'Healthy',
    },
    degraded: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      label: 'Degraded',
    },
    down: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      label: 'Down',
    },
    skipped: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-gray-500',
      bg: 'bg-white/5',
      border: 'border-white/10',
      label: 'Skipped',
    },
  }

  const config = statusConfig[status]
  const hasDetails = details && Object.keys(details).length > 0

  return (
    <div className={cn(
      'rounded-xl border p-3 transition-all duration-200',
      config.bg,
      config.border,
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn('flex-shrink-0', config.color)}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-white">
              {name}
            </p>
            <span className={cn(
              'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
              config.bg,
              config.color
            )}>
              {config.label}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
            {message || description}
          </p>
        </div>

        {latencyMs !== undefined && (
          <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">
            {latencyMs}ms
          </span>
        )}

        {hasDetails && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {showDetails && hasDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-2 pt-2 border-t border-white/5 overflow-hidden"
        >
          <pre className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap overflow-auto max-h-32">
            {JSON.stringify(details, null, 2)}
          </pre>
        </motion.div>
      )}
    </div>
  )
}
