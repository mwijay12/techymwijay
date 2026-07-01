'use client'

import type { TranscriptSegment } from '@/lib/meeting-store'

type Props = {
  segment: TranscriptSegment
  showTranslation: boolean
  index: number
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function MeetingSegment({ segment, showTranslation, index }: Props) {
  return (
    <div className="flex gap-4 py-3 border-b border-white/5 last:border-0 group">
      <div className="flex-shrink-0 w-20 text-right">
        <span className="text-xs text-white/25 font-mono">{formatTimestamp(segment.timestamp)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 leading-relaxed">{segment.text}</p>
        {showTranslation && segment.translatedText && (
          <p className="text-xs text-blue-400/70 mt-1 italic">{segment.translatedText}</p>
        )}
      </div>
    </div>
  )
}