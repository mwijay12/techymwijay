'use client'

import { motion } from 'framer-motion'
import { Star, Trash2 } from 'lucide-react'
import type { MemoryEntry as MemoryEntryType } from '@/lib/stt-memory'

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString('sw-TZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type Props = {
  entry: MemoryEntryType
  onReplay: (entry: MemoryEntryType) => void
  onFavorite: (id: string) => void
  onDelete: (id: string) => void
  viewMode: 'list' | 'grid'
}

export function MemoryEntry({ entry, onReplay, onFavorite, onDelete, viewMode }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -3 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
      onClick={() => onReplay(entry)}
    >
      <div className="flex-1 min-w-0 mr-2">
        <p className="text-[10px] text-gray-300 truncate">{entry.text}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] text-emerald-400">{entry.language === 'sw' ? '🇹🇿' : '🇬🇧'}</span>
          <span className="text-[9px] text-gray-500">{formatTimestamp(entry.timestamp)}</span>
          {entry.favorite && <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />}
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(entry.id) }}
          className="p-0.5 rounded text-gray-400 hover:text-yellow-400"
        >
          <Star className={`w-2.5 h-2.5 ${entry.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
          className="p-0.5 rounded text-gray-400 hover:text-red-400"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>
    </motion.div>
  )
}