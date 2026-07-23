'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG, type SpendingEntry } from '@/types/spending'
import { formatCurrency } from '@/lib/spending-service'

interface SpendingEntryCardProps {
  entry: SpendingEntry
  onEdit: (entry: SpendingEntry) => void
  onDelete: (id: string) => void
}

export function SpendingEntryCard({
  entry,
  onEdit,
  onDelete,
}: SpendingEntryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const config = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.nyingine

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(entry.id)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const formattedDate = format(parseISO(entry.date), 'dd MMM yyyy')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 transition-all duration-200 hover:border-white/20 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border',
            config.bgClass
          )}
          style={{ borderColor: `${config.color}30` }}
        >
          {config.emoji}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {entry.description}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span className={cn('font-medium', config.textClass)}>
              {config.labelSw}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              {formattedDate}
            </span>
          </div>
          {entry.notes && (
            <p className="text-[11px] text-gray-500 truncate mt-1">
              {entry.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <span className="text-sm font-bold text-white font-mono block">
            {formatCurrency(entry.amount, entry.currency)}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showDeleteConfirm
                ? 'text-red-400 bg-red-500/20'
                : 'text-gray-400 hover:text-red-400 hover:bg-white/10'
            )}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default SpendingEntryCard
