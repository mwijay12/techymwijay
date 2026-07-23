'use client'

import { useState } from 'react'
import { ChevronDown, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/meeting-service'
import type {
  MeetingChunk as MeetingChunkType,
  SpeakerTag,
} from '@/lib/meeting-service'

const SPEAKER_TAGS: SpeakerTag[] = [
  'Lecturer',
  'Me',
  'Q&A',
  'Discussion',
  'Note',
  'Action Item',
]

const TAG_COLORS: Record<SpeakerTag, string> = {
  Lecturer: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Me: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Q&A': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Discussion: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Note: 'text-gray-400 bg-white/5 border-white/10',
  'Action Item': 'text-red-400 bg-red-500/10 border-red-500/20',
}

interface MeetingChunkProps {
  chunk: MeetingChunkType
  onTagChange: (chunkId: string, tag: SpeakerTag | undefined) => void
  isLatest?: boolean
}

export function MeetingChunk({
  chunk,
  onTagChange,
  isLatest = false,
}: MeetingChunkProps) {
  const [showTagPicker, setShowTagPicker] = useState(false)

  const langEmoji =
    chunk.language === 'sw' ? '🇹🇿' : chunk.language === 'en' ? '🇺🇸' : '🌍'

  return (
    <div
      className={cn(
        'group relative flex gap-3 py-3 border-b border-white/5 last:border-0',
        isLatest && 'bg-purple-500/5 -mx-3 px-3 rounded-xl'
      )}
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={cn(
            'w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0',
            chunk.isProcessing
              ? 'bg-purple-500 animate-ping'
              : chunk.engine === 'groq'
              ? 'bg-purple-400'
              : 'bg-cyan-400'
          )}
        />
        <div className="w-0.5 flex-1 bg-white/5 mt-1 group-last:hidden" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 font-bold">
              {formatDuration(chunk.timestamp)}
            </span>
            <span className="text-xs">{langEmoji}</span>

            {chunk.speakerTag && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                  TAG_COLORS[chunk.speakerTag]
                )}
              >
                {chunk.speakerTag}
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowTagPicker(!showTagPicker)}
              className="text-[10px] text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{chunk.speakerTag ? 'Change' : 'Tag'}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {showTagPicker && (
              <div className="absolute right-0 top-6 z-20 w-36 bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    onTagChange(chunk.id, undefined)
                    setShowTagPicker(false)
                  }}
                  className="w-full text-left px-2 py-1 rounded-lg text-[10px] text-gray-400 hover:bg-white/10"
                >
                  None
                </button>
                {SPEAKER_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      onTagChange(chunk.id, tag)
                      setShowTagPicker(false)
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all',
                      TAG_COLORS[tag]
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {chunk.isProcessing && !chunk.text ? (
          <p className="text-xs text-gray-500 italic animate-pulse">
            Transcribing audio chunk via Groq Whisper...
          </p>
        ) : (
          <p className="text-sm text-gray-200 leading-relaxed font-sans font-normal">
            {chunk.text}
          </p>
        )}
      </div>
    </div>
  )
}

export default MeetingChunk
