import { CheckCircle, AlertCircle, Loader2, XCircle, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

type BadgeStatus = 'healthy' | 'unconfigured' | 'testing' | 'error'

interface SettingsStatusBadgeProps {
  status: BadgeStatus
  keyCount?: number
  latencyMs?: number
  className?: string
}

const STATUS_CONFIG = {
  healthy: {
    icon: CheckCircle,
    label: 'Configured',
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  unconfigured: {
    icon: AlertCircle,
    label: 'Not Configured',
    className: 'text-gray-400 bg-white/5 border-white/10',
  },
  testing: {
    icon: Loader2,
    label: 'Testing...',
    className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'text-red-400 bg-red-500/10 border-red-500/20',
  },
}

export function SettingsStatusBadge({
  status,
  keyCount,
  latencyMs,
  className,
}: SettingsStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unconfigured
  const Icon = config.icon
  const isSpinning = status === 'testing'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
        'text-xs font-medium border transition-all duration-200',
        config.className,
        className
      )}
    >
      <Icon className={cn('w-3 h-3', isSpinning && 'animate-spin')} />
      <span>{config.label}</span>

      {keyCount !== undefined && keyCount > 0 && status !== 'unconfigured' && (
        <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] font-bold">
          {keyCount} {keyCount === 1 ? 'key' : 'keys'}
        </span>
      )}

      {latencyMs !== undefined && status === 'healthy' && (
        <span className="ml-0.5 flex items-center gap-0.5 text-[10px] opacity-70 font-mono">
          <Wifi className="w-2.5 h-2.5" />
          {latencyMs}ms
        </span>
      )}
    </div>
  )
}

export default SettingsStatusBadge