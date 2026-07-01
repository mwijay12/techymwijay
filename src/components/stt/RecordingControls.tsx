'use client'

import { motion } from 'framer-motion'
import { Mic, Square, Loader2, FileAudio, Upload, Play, StopCircle, AlertCircle, Sparkles } from 'lucide-react'
import type { RecordingState } from './useSTTRecorder'

type Props = {
  state: RecordingState
  isSupported: boolean
  isClient: boolean
  errorMsg: string
  recordingDuration: number
  onStart: () => void
  onStop: () => void
  activeTab: 'microphone' | 'file'
  onTabChange: (tab: 'microphone' | 'file') => void
  selectedFile: File | null
  isFileTranscribing: boolean
  audioPreviewUrl: string | null
  isPlaying: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTranscribeFile: () => void
  onTogglePlay: () => void
  onClearFile: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onReset: () => void
  showCaptionView: boolean
  onToggleCaptionView: () => void
  showAISidebar: boolean
  onToggleAISidebar: () => void
  showMemory: boolean
  onToggleMemory: () => void
}

function formatDuration(seconds?: number) {
  if (!seconds) return ''
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

export function RecordingControls({
  state,
  isSupported,
  isClient,
  errorMsg,
  recordingDuration,
  onStart,
  onStop,
  activeTab,
  onTabChange,
  selectedFile,
  isFileTranscribing,
  audioPreviewUrl,
  isPlaying,
  onFileSelect,
  onTranscribeFile,
  onTogglePlay,
  onClearFile,
  fileInputRef,
  onReset,
  showCaptionView,
  onToggleCaptionView,
  showAISidebar,
  onToggleAISidebar,
  showMemory,
  onToggleMemory,
}: Props) {
  return (
    <>
      {/* Tab + Lang Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          {(['microphone', 'file'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { onTabChange(tab); onReset() }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 border border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'microphone' ? <Mic className="w-3 h-3" /> : <FileAudio className="w-3 h-3" />}
              {tab === 'microphone' ? 'Mic' : 'Faili'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCaptionView}
            className={`p-1.5 rounded-lg transition-colors ${showCaptionView ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Caption View"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M8 12h8M10 15h4" />
            </svg>
          </button>
          <button
            onClick={onToggleAISidebar}
            className={`p-1.5 rounded-lg transition-colors ${showAISidebar ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="AI Assistant"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
            </svg>
          </button>
          <button
            onClick={onToggleMemory}
            className={`p-1.5 rounded-lg transition-colors ${showMemory ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Memory"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </button>
          {(state === 'done' || state === 'recording') && (
            <button onClick={onReset} className="px-2 py-1 rounded text-[10px] text-gray-400 border border-white/10 hover:text-white transition-colors">
              Mpya
            </button>
          )}
        </div>
      </div>

      {/* Mic Section */}
      {activeTab === 'microphone' && (
        <div className="text-center py-4">
          {state === 'recording' ? (
            <div className="space-y-3">
              <div className="relative inline-block">
                <motion.div
                  className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <motion.div
                    className="w-18 h-18 rounded-full bg-red-500/30 flex items-center justify-center"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="text-red-400 text-xs font-medium">Inarekodi...</p>
                <p className="text-gray-500 text-[10px]">{formatDuration(recordingDuration)}</p>
              </div>
              <motion.button
                onClick={onStop}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Square className="w-3 h-3" /> Simamisha
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              <motion.button
                onClick={onStart}
                disabled={state === 'processing'}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-10 h-10 text-white" />
              </motion.button>
              <p className="text-gray-400 text-[10px]">Bonyeza kuanza kuongea</p>
              {isClient && !isSupported && (
                <p className="text-amber-400 text-[10px]">⚠ Chrome au Edge inahitajika</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* File Section */}
      {activeTab === 'file' && (
        <div>
          <div
            className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-emerald-500/30 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={onFileSelect} className="hidden" />
            {selectedFile ? (
              <div className="space-y-2">
                <FileAudio className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-white text-xs">{selectedFile.name}</p>
                <p className="text-gray-500 text-[10px]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                {audioPreviewUrl && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onTogglePlay() }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-gray-300 text-[10px]"
                    >
                      {isPlaying ? <StopCircle className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {isPlaying ? 'Simama' : 'Sikiliza'}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClearFile() }} className="text-gray-500 hover:text-red-400 text-[10px]">
                      Ondoa
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-xs"><span className="text-emerald-400 font-medium">Bonyeza</span> kupakia faili</p>
                <p className="text-gray-600 text-[10px]">MP3, WAV, M4A, OGG</p>
              </div>
            )}
          </div>
          {selectedFile && (
            <motion.button
              onClick={onTranscribeFile}
              disabled={isFileTranscribing}
              className="mt-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isFileTranscribing ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Inatranscribe...</>
              ) : (
                <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" /></svg> Transcribe kwa AI</>
              )}
            </motion.button>
          )}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 min-h-[16px]">
        {state === 'processing' && (
          <div className="flex items-center gap-1 text-amber-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[10px]">Inachakata...</span>
          </div>
        )}
        {state === 'error' && (
          <div className="flex items-center gap-1 text-red-400">
            <AlertCircle className="w-3 h-3" />
            <span className="text-[10px]">{errorMsg}</span>
          </div>
        )}
        {state === 'done' && (
          <div className="flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px]">Imekamilika ✓</span>
          </div>
        )}
        {state === 'idle' && activeTab === 'microphone' && (
          <div className="flex items-center gap-1 text-gray-500">
            <Mic className="w-3 h-3" />
            <span className="text-[10px]">Tayari</span>
          </div>
        )}
      </div>
    </>
  )
}