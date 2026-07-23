import { KeyRound, Code2, Key, FileText, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VaultCategory } from '@/types/vault'

export const CATEGORY_CONFIG: Record<
  VaultCategory,
  {
    label: string
    icon: LucideIcon
    color: string
    bg: string
    border: string
    textColor: string
  }
> = {
  passwords: {
    label: 'Password',
    icon: KeyRound,
    color: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    textColor: 'text-red-400',
  },
  code: {
    label: 'Code',
    icon: Code2,
    color: '#6366f1',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    textColor: 'text-indigo-400',
  },
  keys: {
    label: 'API Key',
    icon: Key,
    color: '#f59e0b',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    textColor: 'text-amber-400',
  },
  notes: {
    label: 'Note',
    icon: FileText,
    color: '#10b981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
  },
}

interface CategoryBadgeProps {
  category: VaultCategory
  size?: 'sm' | 'md'
  className?: string
}

export function CategoryBadge({
  category,
  size = 'md',
  className,
}: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.notes
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-medium border',
        'transition-all duration-200',
        config.bg,
        config.border,
        config.textColor,
        size === 'sm'
          ? 'px-2 py-0.5 text-[10px]'
          : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {config.label}
    </span>
  )
}

export default CategoryBadge
