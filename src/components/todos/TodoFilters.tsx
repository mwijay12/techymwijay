'use client'

import { Search, X, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALL_STATUSES, ALL_PRIORITIES, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/todo'
import type { TodoFilter, TodoStatus, TodoPriority } from '@/types/todo'

interface TodoFiltersProps {
  filter: TodoFilter
  allTags: string[]
  onFilterChange: (updates: Partial<TodoFilter>) => void
  onReset: () => void
}

export function TodoFilters({
  filter,
  allTags,
  onFilterChange,
  onReset,
}: TodoFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={filter.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search tasks by title, description, or tags..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
        />
        {filter.search && (
          <button
            onClick={() => onFilterChange({ search: '' })}
            className="absolute right-3 p-1 text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status tabs & options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => onFilterChange({ status: 'all' })}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 border',
              filter.status === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-purple-500/50 font-semibold'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
            )}
          >
            All Tasks
          </button>

          {ALL_STATUSES.map((s) => {
            const conf = STATUS_CONFIG[s]
            const isSelected = filter.status === s
            return (
              <button
                key={s}
                onClick={() => onFilterChange({ status: isSelected ? 'all' : s })}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 border',
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 font-semibold'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{conf.emoji}</span>
                <span>{conf.labelSw}</span>
              </button>
            )
          })}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={filter.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value as TodoPriority | 'all' })}
            className="bg-gray-900 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
          >
            <option value="all" className="bg-gray-900 text-white">All Priorities</option>
            {ALL_PRIORITIES.map((p) => (
              <option key={p} value={p} className="bg-gray-900 text-white">
                {PRIORITY_CONFIG[p].emoji} {PRIORITY_CONFIG[p].labelSw} ({PRIORITY_CONFIG[p].labelEn})
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
          {allTags.map((t) => {
            const isSelected = filter.tag === t
            return (
              <button
                key={t}
                onClick={() => onFilterChange({ tag: isSelected ? null : t })}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-all duration-150 flex-shrink-0 border',
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 font-semibold'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                )}
              >
                #{t}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TodoFilters
