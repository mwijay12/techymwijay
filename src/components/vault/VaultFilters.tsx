'use client'

import { SlidersHorizontal, Tag, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG } from './CategoryBadge'
import type { VaultCategory } from '@/types/vault'
import type { VaultFilter, VaultSortOption } from '@/hooks/use-vault'

interface VaultFiltersProps {
  filter: VaultFilter
  countByCategory: Record<string, number>
  allTags: string[]
  onFilterChange: (updates: Partial<VaultFilter>) => void
  onReset: () => void
  className?: string
}

const CATEGORY_TABS: { id: VaultCategory | 'all'; label: string }[] = [
  { id: 'all',       label: 'All Items' },
  { id: 'passwords', label: 'Passwords' },
  { id: 'code',      label: 'Code Snippets' },
  { id: 'keys',      label: 'API Keys' },
  { id: 'notes',     label: 'Notes' },
]

const SORT_OPTIONS: { value: VaultSortOption; label: string }[] = [
  { value: 'newest',       label: 'Newest First' },
  { value: 'oldest',       label: 'Oldest First' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'pinned',       label: 'Pinned First' },
]

export function VaultFilters({
  filter,
  countByCategory,
  allTags,
  onFilterChange,
  onReset,
  className,
}: VaultFiltersProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Category Tabs & Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => {
            const isActive = filter.category === tab.id
            const count = countByCategory[tab.id] ?? 0
            const config = tab.id !== 'all' ? CATEGORY_CONFIG[tab.id] : null

            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange({ category: tab.id })}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 flex-shrink-0 border',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-purple-500/50 shadow-md shadow-purple-500/20'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                )}
              >
                {config && <config.icon className="w-3.5 h-3.5" style={{ color: isActive ? '#ffffff' : config.color }} />}
                <span>{tab.label}</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filter.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value as VaultSortOption })}
            className="bg-gray-900 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1 flex-shrink-0">
            <Tag className="w-2.5 h-2.5" /> Tags:
          </span>
          {filter.tag && (
            <button
              onClick={() => onFilterChange({ tag: null })}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex-shrink-0"
            >
              Clear Tag filter ✕
            </button>
          )}
          {allTags.map((tag) => {
            const isSelected = filter.tag === tag
            return (
              <button
                key={tag}
                onClick={() => onFilterChange({ tag: isSelected ? null : tag })}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-all duration-150 flex-shrink-0 border',
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 font-semibold'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                )}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VaultFilters
