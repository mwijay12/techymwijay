'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio } from 'lucide-react'
import { MeetingChunk } from './MeetingChunk'
import type {
  MeetingChunk as MeetingChunkType,
  SpeakerTag,
} from '@/lib/meeting-service'

interface MeetingTimelineProps {
  chunks: MeetingChunkType[]
  interimText?: string
  isRecording?: boolean
  onTagChange: (chunkId: string, tag: SpeakerTag | undefined) => void
  className?: string
}

export function MeetingTimeline({
  chunks,
  interimText,
  isRecording,
  onTagChange,
  className,
}: MeetingTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chunks.length, interimText])

  if (chunks.length === 0 && !interimText) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 rounded-3xl border border-white/10 p-8">
        <Radio className="w-10 h-10 text-gray-500 mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">
          Ready for transcript
        </h3>
        <p className="text-xs text-gray-400 max-w-sm">
          Transcript chunks will stream live here during the meeting.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {chunks.map((chunk, index) => (
            <motion.div
              key={chunk.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MeetingChunk
                chunk={chunk}
                onTagChange={onTagChange}
                isLatest={index === chunks.length - 1 && isRecording}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {interimText && (
          <div className="flex gap-3 py-2 opacity-70">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping mt-1 flex-shrink-0" />
            <p className="text-sm text-cyan-300 italic font-sans">
              {interimText}...
            </p>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

export default MeetingTimeline
