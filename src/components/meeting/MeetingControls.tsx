'use client'

import { motion } from 'framer-motion'
import { Mic, Square, Pause, Play, Maximize2, Minimize2, Languages, Bot, Download, StopCircle } from 'lucide-react'
import type { MeetingStatus } from '@/hooks/use-meeting-session'
import { MeetingTimer } from './MeetingTimer'

type Props = {
  status: MeetingStatus
  elapsedSeconds: number
  translationEnabled: boolean
  isFullscreen: boolean
  showSidebar: boolean
  wordCount: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onEnd: () => void
  onToggleTranslation: () => void
  onToggleFullscreen: () => void
  onToggleSidebar: () => void
  onExport: () => void
}

export function MeetingControls({
  status, elapsedSeconds, translationEnabled, isFullscreen,
  showSidebar, wordCount, onStart, onPause, onResume, onEnd,
  onToggleTranslation, onToggleFullscreen, onToggleSidebar, onExport,
}: Props) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-xl border-t border-white/10 mx-0"
    >
      <div className="flex items-center gap-6">
        <MeetingTimer elapsedSeconds={elapsedSeconds} isActive={status === 'active'} />
        {status !== 'idle' && (
          <span className="text-xs text-white/30 font-mono">{wordCount.toLocaleString()} words</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {status === 'idle' && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={onStart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-medium transition-colors"
          ><Mic className="w-4 h-4" />Start Meeting</motion.button>
        )}
        {status === 'active' && (
          <>
            <button onClick={onPause} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Pause"><Pause className="w-5 h-5" /></button>
            <button onClick={onEnd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"><StopCircle className="w-4 h-4" />End</button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button onClick={onResume} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><Play className="w-4 h-4" />Resume</button>
            <button onClick={onEnd} className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="End Meeting"><Square className="w-4 h-4" /></button>
          </>
        )}
        {status === 'ending' && (
          <div className="flex items-center gap-2 px-5 py-2.5 text-yellow-400 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
            Generating summary...
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToggleTranslation} title={translationEnabled ? 'Disable translation' : 'Enable translation'}
          className={`p-2.5 rounded-lg transition-colors ${translationEnabled ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/40 hover:text-white/70'}`}
        ><Languages className="w-4 h-4" /></button>
        <button onClick={onToggleSidebar}
          className={`p-2.5 rounded-lg transition-colors ${showSidebar ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/40 hover:text-white/70'}`}
        ><Bot className="w-4 h-4" /></button>
        {status !== 'idle' && (
          <button onClick={onExport} className="p-2.5 rounded-lg bg-white/5 text-white/40 hover:text-white/70 transition-colors" title="Export transcript"><Download className="w-4 h-4" /></button>
        )}
        <button onClick={onToggleFullscreen} className="p-2.5 rounded-lg bg-white/5 text-white/40 hover:text-white/70 transition-colors" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  )
}