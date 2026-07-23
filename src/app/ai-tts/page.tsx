'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Sparkles, AlertCircle, Zap, Globe, MessageSquare } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { VoiceSelector } from '@/components/tts/VoiceSelector'
import { TextInput } from '@/components/tts/TextInput'
import { PlaybackControls } from '@/components/tts/PlaybackControls'
import { WaveformDisplay } from '@/components/tts/WaveformDisplay'
import { QuotaTracker } from '@/components/tts/QuotaTracker'
import { useTTS } from '@/hooks/use-tts'

const SWAHILI_PRESETS = [
  'Habari gani! Karibu kwenye Mwijay Tech AI Voice Studio.',
  'Mimi ni msaidizi wako wa sauti wa Mwijay Tech OS.',
  'Welcome to Davie Mwijay personal productivity workspace.',
  'Swahili and English text to speech synthesis in Dar es Salaam 🇹🇿',
]

export default function TTSPage() {
  const {
    playbackState,
    isPlaying,
    isPaused,
    isLoading,
    activeEngine,
    error,
    currentChunk,
    totalChunks,
    progress,
    selectedVoice,
    availableVoices,
    setVoice,
    speed,
    setSpeed,
    totalCharsAvailable,
    totalCharsUsed,
    speak,
    pause,
    resume,
    stop,
    previewVoice,
    downloadAudio,
  } = useTTS()

  const [text, setText] = useState('Habari gani! Karibu kwenye Mwijay Tech AI Voice Studio.')

  const handleSpeak = () => {
    speak(text)
  }

  const handleDownload = () => {
    downloadAudio(text)
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PageWrapper maxWidth="7xl">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6 py-4">
            {/* Header */}
            <div className="pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1 text-xs text-blue-300 mb-3">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Puter.js & ElevenLabs Multilingual Studio</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  AI Text to Speech Studio
                </h1>
                <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                  Puter.js free unlimited engine is active by default. You can also switch to ElevenLabs HD voice models.
                </p>
              </div>

              {/* Default Engine Badge */}
              <div className="bg-[#121225] border border-blue-500/30 p-3 rounded-2xl flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Puter.js / Free Engine Active
                  </span>
                  <span className="text-[10px] text-blue-300">
                    Unlimited Free Speech Synthesis
                  </span>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quota Tracker */}
            <QuotaTracker
              totalCharsAvailable={totalCharsAvailable}
              totalCharsUsed={totalCharsUsed}
            />

            {/* Swahili Preset Phrases */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Quick Swahili Presets — Maneno ya Haraka
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SWAHILI_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setText(preset)}
                    className="p-3 text-left rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all text-xs text-gray-300 hover:text-white"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Select Voice Model — Chagua Sauti (Puter.js Default)
              </label>
              <VoiceSelector
                selectedVoice={selectedVoice}
                availableVoices={availableVoices}
                onSelect={setVoice}
                onPreview={previewVoice}
                isPlaying={isPlaying}
              />
            </div>

            {/* Text Input */}
            <TextInput
              value={text}
              onChange={setText}
            />

            {/* Waveform Display */}
            <WaveformDisplay isPlaying={isPlaying} />

            {/* Playback Controls */}
            <PlaybackControls
              playbackState={playbackState}
              activeEngine={activeEngine}
              text={text}
              currentChunk={currentChunk}
              totalChunks={totalChunks}
              progress={progress}
              speed={speed}
              onSpeedChange={setSpeed}
              onPlay={handleSpeak}
              onPause={pause}
              onResume={resume}
              onStop={stop}
              onDownload={handleDownload}
            />
          </div>
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}