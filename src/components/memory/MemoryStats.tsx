import { Brain, Zap, TrendingUp, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MEMORY_TYPE_CONFIG, ALL_MEMORY_TYPES } from '@/lib/memory-service'
import type { getMemoryStats } from '@/lib/memory-service'

type MemoryStats = ReturnType<typeof getMemoryStats>

interface MemoryStatsProps {
  stats: MemoryStats
  className?: string
}

export function MemoryStats({ stats, className }: MemoryStatsProps) {
  const capacityColor =
    stats.capacityPercent >= 90
      ? 'bg-red-500'
      : stats.capacityPercent >= 70
      ? 'bg-amber-400'
      : 'bg-purple-500'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Memories',
            value: stats.total,
            icon: <Brain className="w-4 h-4" />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
          },
          {
            label: 'Total Usages',
            value: stats.totalUsages,
            icon: <Zap className="w-4 h-4" />,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Capacity',
            value: `${stats.capacityPercent}%`,
            icon: <Database className="w-4 h-4" />,
            color:
              stats.capacityPercent >= 90
                ? 'text-red-400'
                : 'text-emerald-400',
            bg:
              stats.capacityPercent >= 90
                ? 'bg-red-500/10'
                : 'bg-emerald-500/10',
          },
          {
            label: 'Most Used',
            value: stats.mostUsed[0]
              ? `${stats.mostUsed[0].useCount ?? 0}x`
              : '0x',
            icon: <TrendingUp className="w-4 h-4" />,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', stat.bg)}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
            <p className={cn('text-xl font-black font-mono', stat.color)}>
              {stat.value}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">
            Memory capacity — {stats.total}/{stats.maxAllowed} entries
          </span>
          <span className="text-xs font-mono text-purple-400 font-bold">
            {stats.capacityPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              capacityColor
            )}
            style={{ width: `${stats.capacityPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          By Type — Kwa Aina
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ALL_MEMORY_TYPES.map(type => {
            const conf = MEMORY_TYPE_CONFIG[type]
            const count = stats.byType[type] ?? 0
            return (
              <div
                key={type}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150',
                  count > 0
                    ? `${conf.bgClass} border-white/10`
                    : 'bg-white/5 border-white/5 opacity-50'
                )}
                style={count > 0 ? { borderColor: `${conf.color}40` } : {}}
              >
                <span className="text-lg">{conf.emoji}</span>
                <p className={cn('text-lg font-black font-mono', conf.textClass)}>
                  {count}
                </p>
                <p className="text-[9px] text-gray-400 text-center">
                  {conf.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
