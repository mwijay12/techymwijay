'use client'

import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'configured'
  | 'missing'
  | 'default'
  | 'puter'
  | 'local-only'

interface SettingsStatusBadgeProps {
  variant: BadgeVariant
  label?: string
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  configured:
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  missing:
    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  default:
    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  puter:
    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'local-only':
    'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const defaultLabels: Record<BadgeVariant, string> = {
  configured: 'Configured',
  missing: 'Missing Key',
  default: 'Default',
  puter: 'Using Puter',
  'local-only': 'Local Only',
}

export default function SettingsStatusBadge({
  variant,
  label,
  className,
}: SettingsStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'configured' && 'bg-emerald-400',
          variant === 'missing' && 'bg-amber-400',
          variant === 'default' && 'bg-blue-400',
          variant === 'puter' && 'bg-purple-400',
          variant === 'local-only' && 'bg-gray-400'
        )}
      />
      {label ?? defaultLabels[variant]}
    </span>
  )
}