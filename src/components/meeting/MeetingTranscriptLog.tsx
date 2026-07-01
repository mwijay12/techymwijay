'use client'

import { useRef, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { MeetingSegment } from './MeetingSegment'
import type { TranscriptSegment } from '@/lib/meeting-store'

type Props = {
  segments: TranscriptSegment[]
  showTranslation: boolean
  isOpen: boolean
}

export function MeetingTranscriptLog({ segments, showTranslation, isOpen }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [segments.length, isOpen])

  if (!isOpen) return null

  return (
    <div className="border-t border-white/5 bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <FileText className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Transcript Log</span>
        <span className="text-xs text-white/30 ml-auto">{segments.length} segments</span>
      </div>
      <div ref={scrollRef} className="overflow-y-auto max-h-64 px-4">
        {segments.length === 0 ? (
          <p className="text-sm text-white/20 text-center py-8 italic">Transcript will appear here as you speak...</p>
        ) : (
          segments.map((seg, i) => (
            <MeetingSegment key={seg.id} segment={seg} showTranslation={showTranslation} index={i} />
          ))
        )}
      </div>
    </div>
  )
}