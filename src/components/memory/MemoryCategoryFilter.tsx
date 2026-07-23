'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MEMORY_TYPE_CONFIG, ALL_MEMORY_TYPES } from '@/lib/memory-service'
import type { MemoryType } from '@/lib/memory-service'

interface MemoryCategoryFilterProps {
  filterType: MemoryType | 'all'
  searchQuery: string
  onTypeChange: (type: MemoryType | 'all') => void
  onSearchChange: (q: string) => void
  counts: Record<string, number>
  className?: string
}

export function MemoryCategoryFilter({
  filterType,
  searchQuery,
  onTypeChange,
  onSearchChange,
  counts,
  className,
}: MemoryCategoryFilterProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search memories..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeChange('all')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150',
            filterType === 'all'
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
          )}
        >
          🧠 All
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/40">
            {counts.all ?? 0}
          </span>
        </button>

        {ALL_MEMORY_TYPES.map(type => {
          const conf = MEMORY_TYPE_CONFIG[type]
          const isActive = filterType === type
          const count = counts[type] ?? 0

          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150',
                isActive
                  ? `${conf.bgClass} ${conf.textClass}`
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              )}
              style={isActive ? { borderColor: `${conf.color}40` } : {}}
            >
              {conf.emoji} {conf.label}
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/40">
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MemoryCategoryFilter
