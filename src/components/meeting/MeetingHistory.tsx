'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Search, Trash2, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/meeting-service'
import type { MeetingSession } from '@/lib/meeting-service'

interface MeetingHistoryProps {
  sessions: MeetingSession[]
  activeSessionId?: string
  onSelect: (session: MeetingSession) => void
  onDelete: (sessionId: string) => void
  className?: string
}

export function MeetingHistory({
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
  className,
}: MeetingHistoryProps) {
  const [search, setSearch] = useState('')

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.context?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Past Meetings ({sessions.length})
          </h3>
        </div>
      </div>

      {sessions.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search past meetings..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4 italic">
          No past meetings saved yet.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.map(session => {
              const isActive = session.id === activeSessionId
              const langEmoji =
                session.language === 'sw'
                  ? '🇹🇿'
                  : session.language === 'en'
                  ? '🇺🇸'
                  : '🌍'

              return (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => onSelect(session)}
                  className={cn(
                    'group flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-150',
                    isActive
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  )}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs">{langEmoji}</span>
                      <p className="text-xs font-semibold text-white truncate">
                        {session.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {format(new Date(session.startedAt), 'd MMM, HH:mm')}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onDelete(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default MeetingHistory
