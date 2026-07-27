'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Copy,
  Download,
  Shield,
  Maximize2,
  Volume2,
  Check,
  Edit3,
  CheckSquare,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MiniVoiceStudioWidgetProps {
  isListening: boolean
  isPaused: boolean
  isProcessing: boolean
  language: string
  onLanguageChange: (lang: string) => void
  transcript: string
  interimTranscript: string
  onTranscriptChange: (newText: string) => void
  onStart: () => void
  onStop: () => void
  onPause: () => void
  onResume: () => void
  onSaveToVault: (text: string) => void
  onSaveTask: (text: string) => void
  onSpeak?: (text: string) => void
  onExpand: () => void
}

export function MiniVoiceStudioWidget({
  isListening,
  isPaused,
  isProcessing,
  language,
  onLanguageChange,
  transcript,
  interimTranscript,
  onTranscriptChange,
  onStart,
  onStop,
  onSaveToVault,
  onSaveTask,
  onSpeak,
  onExpand,
}: MiniVoiceStudioWidgetProps) {
  const [copied, setCopied] = useState(false)
  const [inserted, setInserted] = useState(false)
  const [showTtsSection, setShowTtsSection] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentDisplay = transcript || interimTranscript

  const handleCopy = async () => {
    if (!currentDisplay.trim()) return
    try {
      await navigator.clipboard.writeText(currentDisplay)
      setCopied(true)
      showMiniToast('Copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleInsert = async () => {
    if (!currentDisplay.trim()) return
    try {
      await navigator.clipboard.writeText(currentDisplay)
      setInserted(true)
      showMiniToast('Pasted!')
      setTimeout(() => setInserted(false), 2000)
    } catch {}
  }

  const showMiniToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="relative z-50 w-full max-w-2xl mx-auto rounded-[2rem] p-4 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl bg-slate-950/85 text-white overflow-hidden"
    >
      {/* Specular Highlight Inset (Authentic Liquid Glass filter) */}
      <div className="absolute inset-0 rounded-[2rem] pointer-events-none shadow-[inset_1px_1px_0_rgba(255,255,255,0.4),inset_0_0_8px_rgba(255,255,255,0.15)] z-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10 pointer-events-none" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg backdrop-blur-md z-50 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 space-y-3">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          
          {/* Record Button with Animated Vinyl Record / Spinning Disc Visualizer */}
          <div className="flex items-center gap-3">
            <button
              onClick={isListening ? onStop : onStart}
              className={cn(
                'relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl overflow-hidden group',
                isListening
                  ? 'bg-red-600 text-white shadow-red-500/50'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-600/40 hover:scale-105'
              )}
              title={isListening ? 'Stop Recording' : 'Start Speech Dictation'}
            >
              {/* Spinning Vinyl SVG Disc */}
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
                  isListening ? 'animate-[spin_3s_linear_infinite] opacity-100' : 'opacity-40 group-hover:opacity-75'
                )}
              >
                <svg width={48} height={48} viewBox="0 0 128 128">
                  <rect width={128} height={128} fill="black" />
                  <circle cx={20} cy={20} r={2} fill="white" />
                  <circle cx={40} cy={30} r={2} fill="white" />
                  <circle cx={60} cy={10} r={2} fill="white" />
                  <circle cx={80} cy={40} r={2} fill="white" />
                  <circle cx={100} cy={20} r={2} fill="white" />
                  <circle cx={120} cy={50} r={2} fill="white" />
                  <circle cx={90} cy={30} r={10} fill="white" fillOpacity="0.5" />
                  <circle cx={90} cy={30} r={8} fill="white" />
                  <path d="M0 128 Q32 64 64 128 T128 128" fill="purple" stroke="black" strokeWidth={1} />
                  <path d="M0 128 Q32 48 64 128 T128 128" fill="mediumpurple" stroke="black" strokeWidth={1} />
                  <path d="M0 128 Q32 32 64 128 T128 128" fill="rebeccapurple" stroke="black" strokeWidth={1} />
                </svg>
              </div>

              <div className="relative z-10 w-7 h-7 rounded-full bg-slate-950/80 border border-white/30 flex items-center justify-center">
                <Mic className={cn('w-4 h-4', isListening ? 'text-red-400 animate-bounce' : 'text-white')} />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">
                  MVS
                </span>
                {isListening && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                {isListening ? 'Listening...' : 'Swahili / English'}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
            {[
              { id: 'sw-KE', flag: '🇹🇿', label: 'SW' },
              { id: 'auto', flag: '🌍', label: 'Auto' },
              { id: 'en-US', flag: '🇺🇸', label: 'EN' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1',
                  language === lang.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Controls: TTS Limit Toggle & Full View */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowTtsSection((prev) => !prev)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1',
                showTtsSection
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              )}
              title={showTtsSection ? 'Hide Speech Engine' : 'Show Speech Engine'}
            >
              {showTtsSection ? <Volume2 className="w-3 h-3 text-pink-400" /> : <VolumeX className="w-3 h-3" />}
              <span>TTS</span>
            </button>

            <button
              onClick={onExpand}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
              title="Full View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Editable Inline Transcript Area */}
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder={
              interimTranscript
                ? interimTranscript
                : 'Dictation text appears here... Edit directly anytime.'
            }
            rows={2}
            className="w-full bg-[#080914]/90 border border-white/10 rounded-2xl p-3 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all resize-none leading-relaxed font-sans scrollbar-thin"
          />
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1 text-[10px] text-gray-400 font-mono pointer-events-none">
            <Edit3 className="w-3 h-3 text-violet-400" />
            <span>{transcript.length} chars</span>
          </div>
        </div>

        {/* Collapsible TTS Section when enabled */}
        <AnimatePresence>
          {showTtsSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] text-gray-300">
                <span className="font-semibold text-pink-300">Text-to-Speech Engine</span>
                {onSpeak && (
                  <button
                    onClick={() => onSpeak(currentDisplay)}
                    disabled={!currentDisplay.trim()}
                    className="px-3 py-1 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-[10px] transition-all flex items-center gap-1 disabled:opacity-40"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play Audio</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInsert}
              disabled={!currentDisplay.trim()}
              className="px-3 py-1.5 rounded-full bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Insert / Paste Text"
            >
              {inserted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>Insert</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!currentDisplay.trim()}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>

            <button
              onClick={() => {
                if (transcript.trim()) {
                  onSaveToVault(transcript)
                  showMiniToast('Saved to Vault!')
                }
              }}
              disabled={!transcript.trim()}
              className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Save Note to Vault"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Vault</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (transcript.trim()) {
                onSaveTask(transcript)
                showMiniToast('Saved Task!')
              }
            }}
            disabled={!transcript.trim()}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all disabled:opacity-40"
            title="Save as Todo Task"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
