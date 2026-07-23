import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG } from '@/types/todo'
import type { TodoPriority } from '@/types/todo'

interface PriorityBadgeProps {
  priority: TodoPriority
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

export function PriorityBadge({
  priority,
  size = 'sm',
  showLabel = true,
  className,
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1',
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-semibold border',
        'transition-all duration-200',
        config.bgClass,
        config.borderClass,
        config.textClass,
        sizeClasses[size],
        className
      )}
    >
      <span className="leading-none">{config.emoji}</span>
      {showLabel && <span>{config.labelSw}</span>}
    </span>
  )
}

export default PriorityBadge
