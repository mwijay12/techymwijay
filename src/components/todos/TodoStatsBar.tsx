import { CheckCircle, Flame, AlertTriangle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { computeTodoStats } from '@/lib/todo-service'

type TodoStats = ReturnType<typeof computeTodoStats>

interface TodoStatsBarProps {
  stats: TodoStats
  className?: string
}

export function TodoStatsBar({ stats, className }: TodoStatsBarProps) {
  const statItems = [
    {
      labelSw: 'Zilizokamilika',
      value: stats.done,
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      labelSw: 'Zinaendelea',
      value: stats.inProgress,
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      labelSw: 'Zimechelewa',
      value: stats.overdue,
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      color: stats.overdue > 0 ? 'text-red-400' : 'text-gray-400',
      bg: stats.overdue > 0 ? 'bg-red-500/10' : 'bg-white/5',
      border: stats.overdue > 0 ? 'border-red-500/20' : 'border-white/10',
    },
    {
      labelSw: 'Msururu',
      value: stats.streak,
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      color: stats.streak > 0 ? 'text-amber-400' : 'text-gray-400',
      bg: stats.streak > 0 ? 'bg-amber-500/10' : 'bg-white/5',
      border: stats.streak > 0 ? 'border-amber-500/20' : 'border-white/10',
      isStreak: true,
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {statItems.map((item, i) => (
        <div
          key={i}
          className={cn(
            'bg-white/5 backdrop-blur-xl rounded-2xl border p-3.5 flex items-center gap-3',
            item.border
          )}
        >
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', item.bg)}>
            {item.icon}
          </div>
          <div className="min-w-0">
            <p className={cn('text-lg font-black leading-tight font-mono', item.color)}>
              {item.isStreak ? `${item.value} 🔥` : item.value}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight truncate">
              {item.labelSw}
            </p>
          </div>
        </div>
      ))}

      {stats.total > 0 && (
        <div className="col-span-2 sm:col-span-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">
              Completion Rate — Kiwango cha Ukamilishaji
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono">
              {stats.completionRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5">
            {stats.done} of {stats.total} tasks completed · {stats.doneThisWeek} completed this week
          </p>
        </div>
      )}
    </div>
  )
}

export default TodoStatsBar
