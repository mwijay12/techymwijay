'use client'

import { motion } from 'framer-motion'
import { Mic, MicOff, Pause, Play, Cpu, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { STTEngine, STTLanguage } from '@/hooks/use-speech-recognition'

interface RecordingControlsProps {
  isListening: boolean
  isPaused: boolean
  isProcessing: boolean
  activeEngine: STTEngine
  language: STTLanguage
  onLanguageChange: (lang: STTLanguage) => void
  onStart: () => void
  onStop: () => void
  onPause: () => void
  onResume: () => void
}

export function RecordingControls({
  isListening,
  isPaused,
  isProcessing,
  activeEngine,
  language,
  onLanguageChange,
  onStart,
  onStop,
  onPause,
  onResume,
}: RecordingControlsProps) {
  const toggleRecord = () => {
    if (isListening) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Engine and Language selectors */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
          {(['auto', 'sw', 'en'] as STTLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold transition-all',
                language === lang
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {lang === 'auto'
                ? '🇹🇿 Code-Switch (Auto)'
                : lang === 'sw'
                ? '🇹🇿 Swahili'
                : '🇬🇧 English'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Engine:</span>
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            {activeEngine === 'groq'
              ? 'Groq Whisper-v3'
              : activeEngine === 'webspeech'
              ? 'Web Speech API'
              : 'Auto-Select'}
          </span>
        </div>
      </div>

      {/* Mic Record Button */}
      <div className="relative flex items-center justify-center">
        {isListening && !isPaused && (
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.15, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-red-600 to-purple-600 blur-xl pointer-events-none"
          />
        )}

        <button
          onClick={toggleRecord}
          disabled={isProcessing}
          className={cn(
            'relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-2xl focus:outline-none',
            isListening
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/40'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-purple-500/40',
            isProcessing && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isProcessing ? (
            <Sparkles className="w-8 h-8 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-9 h-9" />
          ) : (
            <Mic className="w-9 h-9" />
          )}
        </button>
      </div>

      {/* Control Buttons (Pause / Resume / Status) */}
      <div className="flex items-center gap-3">
        {isListening && (
          <button
            onClick={isPaused ? onResume : onPause}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-white hover:bg-white/15 transition-all flex items-center gap-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        )}

        <span className="text-xs text-gray-400 font-medium">
          {isProcessing
            ? 'Processing audio with Groq Whisper...'
            : isListening
            ? isPaused
              ? 'Recording paused'
              : 'Recording... Speak in Swahili or English'
            : 'Click mic to start recording'}
        </span>
      </div>
    </div>
  )
}

export default RecordingControls