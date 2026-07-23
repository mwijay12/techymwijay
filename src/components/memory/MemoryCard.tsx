'use client'

import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, Zap, Tag, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { MEMORY_TYPE_CONFIG } from '@/lib/memory-service'
import type { AIMemoryEntry } from '@/types/ai'
import type { MemoryType } from '@/lib/memory-service'

interface MemoryCardProps {
  memory: AIMemoryEntry & {
    tags?: string[]
    source?: string
    confidence?: number
    updatedAt?: string
  }
  onEdit: (memory: AIMemoryEntry) => void
  onDelete: (id: string) => void
}

export const MemoryCard = forwardRef<HTMLDivElement, MemoryCardProps>(
  function MemoryCard(
    {
      memory,
      onEdit,
      onDelete,
    },
    ref
  ) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    const conf = MEMORY_TYPE_CONFIG[memory.type as MemoryType] ?? MEMORY_TYPE_CONFIG.fact

    const handleDelete = () => {
      if (confirmDelete) {
        onDelete(memory.id)
      } else {
        setConfirmDelete(true)
        setTimeout(() => setConfirmDelete(false), 3000)
      }
    }

    const useCount = memory.useCount ?? 0
    const lastUsed = memory.lastUsedAt
      ? formatDistanceToNow(new Date(memory.lastUsedAt), { addSuffix: true })
      : 'never'

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'group bg-white/5 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-200 hover:border-opacity-60 hover:-translate-y-0.5'
        )}
        style={{
          borderColor: `${conf.color}25`,
          borderLeftWidth: '3px',
          borderLeftColor: conf.color,
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border',
                conf.bgClass,
                conf.textClass
              )}
              style={{ borderColor: `${conf.color}30` }}
            >
              {conf.emoji}
              {conf.label}
            </span>

            {useCount > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-purple-400 font-mono">
                <Zap className="w-2.5 h-2.5" />
                <span className="font-bold">{useCount}x</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-200 leading-relaxed mb-3 font-sans">
            {memory.content}
          </p>

          {(memory as any).tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {((memory as any).tags as string[]).slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                >
                  <Tag className="w-2 h-2" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              <Clock className="w-2.5 h-2.5" />
              <span>Used {lastUsed}</span>
              {(memory as any).source && (
                <>
                  <span>·</span>
                  <span className="capitalize">
                    {((memory as any).source as string).replace('_', ' ')}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() => onEdit(memory)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Edit3 className="w-3 h-3" />
              </button>

              <button
                onClick={handleDelete}
                title={confirmDelete ? 'Click again to confirm' : 'Delete'}
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                  confirmDelete
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                )}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
)

export default MemoryCard
