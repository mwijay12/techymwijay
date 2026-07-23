'use client'

import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ALL_CATEGORIES, CATEGORY_CONFIG, type SpendingCategory } from '@/types/spending'

interface SpendingFiltersProps {
  viewYear: number
  viewMonth: number
  selectedCategory: SpendingCategory | 'all'
  onPreviousMonth: () => void
  onNextMonth: () => void
  onCurrentMonth: () => void
  isCurrentMonth: boolean
  onCategoryChange: (category: SpendingCategory | 'all') => void
  onExportCSV: () => void
}

export function SpendingFilters({
  viewYear,
  viewMonth,
  selectedCategory,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
  isCurrentMonth,
  onCategoryChange,
  onExportCSV,
}: SpendingFiltersProps) {
  const monthDate = new Date(viewYear, viewMonth, 1)
  const monthName = format(monthDate, 'MMMM yyyy')

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white min-w-[140px] justify-center">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>{monthName}</span>
          </div>

          <button
            onClick={onNextMonth}
            disabled={isCurrentMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isCurrentMonth && (
            <button
              onClick={onCurrentMonth}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors self-end sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 border',
            selectedCategory === 'all'
              ? 'bg-purple-600 text-white border-purple-400 font-semibold'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
          )}
        >
          All Categories
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const conf = CATEGORY_CONFIG[cat]
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(isSelected ? 'all' : cat)}
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
    </div>
  )
}

export default SpendingFilters
