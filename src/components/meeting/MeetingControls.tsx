'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Pause, Play, Radio, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/meeting-service'
import type { MeetingState } from '@/hooks/use-meeting'

interface MeetingSetupProps {
  onStart: (title: string, context?: string) => void
}

function MeetingSetup({ onStart }: MeetingSetupProps) {
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')

  const handleStart = () => {
    onStart(
      title.trim() || `Meeting — ${new Date().toLocaleDateString('sw-TZ')}`,
      context.trim() || undefined
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4 max-w-lg mx-auto shadow-2xl">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
          <Radio className="w-7 h-7 text-purple-400" />
        </div>
        <h2 className="text-lg font-bold text-white">
          Start Meeting Recording
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Swahili-English · Groq Whisper v3 · Live Auto-transcription
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
          Meeting Title — Anwani ya Mkutano
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. BIT Database Lecture Week 5"
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all font-sans"
          onKeyDown={e => {
            if (e.key === 'Enter') handleStart()
          }}
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
          Context / Venue (optional)
        </label>
        <input
          type="text"
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="e.g. UDSM, Prof. Mwangi, Tuesday 2pm"
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all font-sans"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] text-gray-400 self-center">Quick:</span>
        {[
          'BIT Lecture',
          'Business Meeting',
          'Team Standup',
          'Interview',
          'Workshop',
        ].map(preset => (
          <button
            key={preset}
            type="button"
            onClick={() => setTitle(preset)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/5 border border-white/10 text-gray-300 hover:text-purple-300 hover:border-purple-500/30 transition-all"
          >
            {preset}
          </button>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={handleStart}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-200 shadow-xl shadow-purple-500/25"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Mic className="w-4 h-4" />
        </div>
        Anza Kurekodi — Start Recording
      </motion.button>

      <p className="text-[10px] text-gray-400 text-center">
        🎙️ Microphone access required · Audio processed via Groq Whisper
      </p>
    </div>
  )
}

interface MeetingControlsProps {
  meetingState: MeetingState
  sessionDuration: number
  activeEngine: 'groq' | 'webspeech'
  error: string | null
  onStart: (title: string, context?: string) => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onClearError: () => void
  className?: string
}

export function MeetingControls({
  meetingState,
  sessionDuration,
  activeEngine,
  error,
  onStart,
  onPause,
  onResume,
  onStop,
  onClearError,
  className,
}: MeetingControlsProps) {
  if (meetingState === 'idle' || meetingState === 'setup') {
    return (
      <div className={className}>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 max-w-lg mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={onClearError} className="ml-auto font-bold">
              ×
            </button>
          </div>
        )}
        <MeetingSetup onStart={onStart} />
      </div>
    )
  }

  const isRecording = meetingState === 'recording'
  const isPaused = meetingState === 'paused'
  const isProcessing = meetingState === 'processing'
  const isComplete = meetingState === 'complete'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-5 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          {isRecording && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
          )}
          {isPaused && <div className="w-3 h-3 rounded-full bg-amber-400" />}
          {isProcessing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
            />
          )}

          <div>
            <p className="text-sm font-bold text-white font-mono">
              {formatDuration(sessionDuration)}
            </p>
            <p className="text-[10px] text-gray-400">
              {isRecording
                ? 'Inarekodi...'
                : isPaused
                ? 'Imesimamishwa'
                : isProcessing
                ? 'Inachambua...'
                : 'Imekamilika'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              activeEngine === 'groq' ? 'bg-purple-400' : 'bg-cyan-400'
            )}
          />
          <span className="text-gray-400 font-mono">
            {activeEngine === 'groq' ? 'Groq Whisper' : 'Browser STT'}
          </span>
        </div>

        {!isComplete && !isProcessing && (
          <div className="flex items-center gap-2">
            {isRecording && (
              <button
                type="button"
                onClick={onPause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Pause className="w-3.5 h-3.5" />
                Simama
              </button>
            )}
            {isPaused && (
              <button
                type="button"
                onClick={onResume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                Endelea
              </button>
            )}

            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-red-400" />
              Maliza
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingControls