'use client'

import { motion } from 'framer-motion'
import { FileText, Hash, ListChecks, Download, RotateCcw, Clock, Type } from 'lucide-react'
import type { MeetingSession } from '@/lib/meeting-store'

type Props = {
  session: MeetingSession
  isGeneratingSummary: boolean
  onExport: () => void
  onNewMeeting: () => void
}

export function MeetingSessionSummary({
  session, isGeneratingSummary, onExport, onNewMeeting,
}: Props) {
  const duration = session.durationMs
    ? `${Math.round(session.durationMs / 60000)} min`
    : 'N/A'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
          <FileText className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">{session.title}</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            {session.wordCount.toLocaleString()} words
          </span>
        </div>
      </div>

      {/* Summary */}
      {isGeneratingSummary ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-white/50">
            <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
            Generating AI summary...
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 rounded bg-white/5" style={{ width: `${70 + i * 10}%` }} />
          ))}
        </div>
      ) : (
        <>
          {session.summary && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-2">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Summary</h3>
              <p className="text-sm text-white/80 leading-relaxed">{session.summary}</p>
            </div>
          )}

          {session.keyTopics && session.keyTopics.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />Key Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {session.keyTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {session.actionItems && session.actionItems.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" />Action Items
              </h3>
              <ul className="space-y-2">
                {session.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Full transcript accordion */}
      <details className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <summary className="px-5 py-4 cursor-pointer text-sm text-white/60 hover:text-white/80 transition-colors select-none">
          View Full Transcript ({session.segments.length} segments)
        </summary>
        <div className="px-5 pb-5 space-y-2 max-h-80 overflow-y-auto">
          {session.segments.map((seg, i) => (
            <p key={seg.id} className="text-sm text-white/60 leading-relaxed py-1 border-b border-white/5 last:border-0">
              <span className="text-white/25 text-xs font-mono mr-2">{i + 1}.</span>
              {seg.text}
              {seg.translatedText && (
                <span className="ml-2 text-blue-400/50 italic text-xs">— {seg.translatedText}</span>
              )}
            </p>
          ))}
        </div>
      </details>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export .txt
        </button>
        <button
          onClick={onNewMeeting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Meeting
        </button>
      </div>
    </motion.div>
  )
}