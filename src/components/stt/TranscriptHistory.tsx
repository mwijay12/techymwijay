'use client'

import { Clock, Copy, ArrowUpRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { STTSession } from '@/hooks/use-speech-recognition'

interface TranscriptHistoryProps {
  sessions: STTSession[]
  onSelect: (transcript: string) => void
}

export function TranscriptHistory({
  sessions,
  onSelect,
}: TranscriptHistoryProps) {
  if (sessions.length === 0) return null

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-5 space-y-3">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Clock className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Recent Voice Dictations ({sessions.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelect(session.transcript)}
            className="group p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all duration-150 flex items-start justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
                {session.transcript}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                <span>{format(parseISO(session.createdAt), 'HH:mm — d MMM')}</span>
                <span>·</span>
                <span>{session.wordCount} words</span>
                <span>·</span>
                <span className="uppercase font-mono">{session.engine}</span>
              </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TranscriptHistory
