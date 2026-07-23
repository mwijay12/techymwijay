'use client'

import { Play, Pause, Square, Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlaybackState, TTSEngine } from '@/hooks/use-tts'

interface PlaybackControlsProps {
  playbackState: PlaybackState
  activeEngine: TTSEngine
  text: string
  currentChunk: number
  totalChunks: number
  progress: number
  speed: number
  onSpeedChange: (speed: number) => void
  onPlay: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onDownload: () => void
  className?: string
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

const ENGINE_LABELS: Record<TTSEngine, { label: string; color: string }> = {
  elevenlabs: { label: 'ElevenLabs Multilingual v2', color: 'text-purple-400' },
  browser: { label: 'Browser Voice', color: 'text-blue-400' },
  detecting: { label: 'Detecting engine...', color: 'text-gray-400' },
}

export function PlaybackControls({
  playbackState,
  activeEngine,
  text,
  currentChunk,
  totalChunks,
  progress,
  speed,
  onSpeedChange,
  onPlay,
  onPause,
  onResume,
  onStop,
  onDownload,
  className,
}: PlaybackControlsProps) {
  const isPlaying = playbackState === 'playing'
  const isPaused = playbackState === 'paused'
  const isLoading = playbackState === 'loading'
  const hasText = text.trim().length > 0
  const engineInfo = ENGINE_LABELS[activeEngine] || ENGINE_LABELS.detecting

  const handleMainAction = () => {
    if (isPlaying) {
      onPause()
    } else if (isPaused) {
      onResume()
    } else {
      onPlay()
    }
  }

  return (
    <div className={cn('bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
            Engine:
          </span>
          <span className={cn('text-xs font-semibold font-mono', engineInfo.color)}>
            {engineInfo.label}
          </span>

          {totalChunks > 1 && (
            <span className="text-[10px] text-gray-500 font-mono">
              (Part {currentChunk} of {totalChunks})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">
            Speed:
          </span>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
          >
            {SPEED_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-gray-900 text-white">
                {s}x
              </option>
            ))}
          </select>
        </div>
      </div>

      {(isPlaying || isPaused || isLoading) && (
        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMainAction}
            disabled={!hasText || isLoading}
            className={cn(
              'px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg',
              isPlaying
                ? 'bg-amber-600 text-white shadow-amber-500/20 hover:bg-amber-500'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-purple-500/25 hover:from-blue-500 hover:to-purple-500',
              (!hasText || isLoading) && 'opacity-40 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>
              {isLoading
                ? 'Generating speech...'
                : isPlaying
                ? 'Pause'
                : isPaused
                ? 'Resume'
                : 'Speak Text'}
            </span>
          </button>

          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={onStop}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Stop playback"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDownload}
          disabled={!hasText || isLoading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 disabled:opacity-40"
          title="Download MP3 via ElevenLabs"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download MP3</span>
        </button>
      </div>
    </div>
  )
}

export default PlaybackControls
