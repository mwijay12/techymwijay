'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Search, Grid3X3, List, Download, Trash2, Star } from 'lucide-react'
import { MemoryEntry } from './MemoryEntry'
import type { MemoryEntry as MemoryEntryType } from '@/lib/stt-memory'

type Props = {
  showMemory: boolean
  memory: MemoryEntryType[]
  filteredEntries: MemoryEntryType[]
  searchQuery: string
  onSearchChange: (q: string) => void
  viewMode: 'list' | 'grid'
  onViewModeChange: (mode: 'list' | 'grid') => void
  onReplay: (entry: MemoryEntryType) => void
  onFavorite: (id: string) => void
  onDelete: (id: string) => void
  onExport: () => void
  onClearAll: () => void
}

export function MemoryPanel({
  showMemory,
  memory,
  filteredEntries,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onReplay,
  onFavorite,
  onDelete,
  onExport,
  onClearAll,
}: Props) {
  return (
    <AnimatePresence>
      {showMemory && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white text-xs font-semibold">Kumbukumbu</span>
                <span className="text-[10px] text-gray-500">({memory.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <Search className="w-3 h-3 text-gray-500 absolute left-1.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Tafuta..."
                    className="bg-black/40 border border-white/10 rounded px-5 py-0.5 text-[10px] text-white w-20 focus:outline-none placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={() => onViewModeChange(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-1 rounded text-gray-400 hover:text-white"
                >
                  {viewMode === 'list' ? <Grid3X3 className="w-3 h-3" /> : <List className="w-3 h-3" />}
                </button>
                {memory.length > 0 && (
                  <>
                    <button onClick={onExport} className="p-1 rounded text-gray-400 hover:text-emerald-400" title="Export">
                      <Download className="w-3 h-3" />
                    </button>
                    <button onClick={onClearAll} className="p-1 rounded text-gray-400 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <p className="text-gray-500 text-xs">Hakuna kumbukumbu bado. Anza kuongea!</p>
              </div>
            ) : (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-1.5' : 'space-y-1'} max-h-60 overflow-y-auto`}>
                {filteredEntries.map((entry) => (
                  <MemoryEntry
                    key={entry.id}
                    entry={entry}
                    viewMode={viewMode}
                    onReplay={onReplay}
                    onFavorite={onFavorite}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}