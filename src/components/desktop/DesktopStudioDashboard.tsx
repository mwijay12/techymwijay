'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Volume2,
  Mic,
  Video,
  Shield,
  Brain,
  Wallet,
  CheckSquare,
  Sparkles,
  Zap,
  Play,
  Square,
  Download,
  Flame,
  Globe,
  Sliders,
  Clock,
  Keyboard,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
  Radio,
} from 'lucide-react'
import { Minimize2, Maximize2 } from 'lucide-react'
import { useTTS, ELEVENLABS_VOICES, PUTER_DEFAULT_VOICE, TTSVoice } from '@/hooks/use-tts'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useVault } from '@/hooks/use-vault'
import { useTodos } from '@/hooks/use-todos'
import { MiniVoiceStudioWidget } from '@/components/stt/MiniVoiceStudioWidget'
import { QuotaTracker } from '@/components/tts/QuotaTracker'
import { WaveformDisplay } from '@/components/tts/WaveformDisplay'
import { cn } from '@/lib/utils'

interface AudioGeneration {
  id: string
  text: string
  voiceName: string
  timestamp: string
  engine: string
}

export function DesktopStudioDashboard() {
  const [isMiniMode, setIsMiniMode] = useState(false)
  const {
    playbackState,
    isPlaying,
    isLoading,
    activeEngine,
    error,
    selectedVoice,
    availableVoices,
    setVoice,
    speed,
    setSpeed,
    totalCharsAvailable,
    totalCharsUsed,
    speak,
    stop,
    downloadAudio,
  } = useTTS()

  const {
    isListening,
    isPaused,
    isProcessing,
    interimTranscript,
    fullTranscript,
    language,
    setLanguage,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
  } = useSpeechRecognition()

  const { addItem: addVaultItem } = useVault()
  const { addTodo } = useTodos()

  const [text, setText] = useState(
    'Habari gani! Karibu kwenye Mwijay Tech AI Voice Studio Desktop Edition. Powerful offline & cloud speech synthesis.'
  )
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null)
  const [recentHistory, setRecentHistory] = useState<AudioGeneration[]>([
    {
      id: '1',
      text: 'Habari gani! Karibu kwenye Mwijay Tech AI Voice Studio.',
      voiceName: 'Rachel (ElevenLabs HD)',
      timestamp: 'Just now',
      engine: 'elevenlabs',
    },
    {
      id: '2',
      text: 'Mimi ni msaidizi wako wa sauti wa Mwijay Tech OS.',
      voiceName: 'Puter.js Free Engine',
      timestamp: '10 mins ago',
      engine: 'browser',
    },
    {
      id: '3',
      text: 'Welcome to Davie Mwijay personal productivity desktop workspace.',
      voiceName: 'Adam (ElevenLabs HD)',
      timestamp: '1 hour ago',
      engine: 'elevenlabs',
    },
  ])

  const handleSaveToVault = async (t: string) => {
    if (!t.trim()) return
    await addVaultItem({
      title: `Desktop Note — ${new Date().toLocaleTimeString()}`,
      category: 'notes',
      content: t,
      secretContent: t,
      tags: ['desktop', 'voice'],
    })
  }

  const handleSaveTask = async (t: string) => {
    if (!t.trim()) return
    await addTodo({
      title: t.length > 50 ? t.slice(0, 50) + '...' : t,
      description: t,
      priority: 'medium',
      tags: ['voice'],
    })
  }

  const handleGenerate = async () => {
    if (!text.trim()) return
    await speak(text)

    const newItem: AudioGeneration = {
      id: Date.now().toString(),
      text: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
      voiceName: selectedVoice.name,
      timestamp: 'Just now',
      engine: selectedVoice.engine,
    }
    setRecentHistory(prev => [newItem, ...prev.slice(0, 4)])
  }

  const handleCopyShortcut = (sc: string) => {
    navigator.clipboard.writeText(sc)
    setCopiedShortcut(sc)
    setTimeout(() => setCopiedShortcut(null), 2000)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto text-white">
      {/* ─── Top Studio Banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900/60 via-indigo-950/80 to-slate-900/90 border border-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-xs font-semibold text-violet-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Mwijay Tech Desktop App • Pro AI Voice Workstation</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-100 to-gray-400 bg-clip-text text-transparent">
              AI Voice & Productivity Studio
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Generate ultra-realistic Swahili & English speech using ElevenLabs HD models and free unlimited Puter.js synthesis. Built for high-performance desktop workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMiniMode(!isMiniMode)}
              className={cn(
                'px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2',
                isMiniMode
                  ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
              )}
            >
              {isMiniMode ? (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Full Dashboard</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-4 h-4 text-cyan-400" />
                  <span>Mini Floating Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMiniMode && (
        <MiniVoiceStudioWidget
          isListening={isListening}
          isPaused={isPaused}
          isProcessing={isProcessing}
          language={language}
          onLanguageChange={setLanguage}
          transcript={fullTranscript || text}
          interimTranscript={interimTranscript}
          onTranscriptChange={setText}
          onStart={startListening}
          onStop={stopListening}
          onPause={pauseListening}
          onResume={resumeListening}
          onSaveToVault={handleSaveToVault}
          onSaveTask={handleSaveTask}
          onSpeak={speak}
          onExpand={() => setIsMiniMode(false)}
        />
      )}

      {/* ─── Main Grid Layout: Voice Generator + Side Stats ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Quick Voice Studio Generator */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl bg-[#121222]/80 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
            
            {/* Header / Engine Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Instant Speech Synthesizer</h2>
                  <p className="text-xs text-gray-400">Puter.js Cloud & ElevenLabs HD Engine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Engine:</span>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold font-mono border',
                  selectedVoice.engine === 'elevenlabs'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                )}>
                  {selectedVoice.engine === 'elevenlabs' ? 'ElevenLabs HD' : 'Puter.js Free'}
                </span>
              </div>
            </div>

            {/* Voice Dropdown Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span>Select Voice Model</span>
                <span className="text-[11px] font-normal text-violet-400">Swahili & English Supported</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[PUTER_DEFAULT_VOICE, ...ELEVENLABS_VOICES.slice(0, 5)].map((v) => {
                  const isSelected = selectedVoice.id === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => setVoice(v)}
                      className={cn(
                        'p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20',
                        isSelected
                          ? 'bg-violet-600/25 border-violet-500 text-white shadow-lg shadow-violet-500/10'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white'
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold truncate pr-2">{v.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono truncate">
                        {v.engine === 'elevenlabs' ? `${v.gender} • ${v.accent}` : 'Free Cloud Engine'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Text Editor Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Text Prompt</label>
                <span className="text-xs text-gray-400 font-mono">{text.length} characters</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full bg-[#0a0a14] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none leading-relaxed font-sans"
                placeholder="Type or paste Swahili/English text here to synthesize into speech..."
              />
            </div>

            {/* Live Waveform Display */}
            <WaveformDisplay isPlaying={isPlaying} />

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={isPlaying ? stop : handleGenerate}
                  disabled={isLoading}
                  className={cn(
                    'px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-xl flex items-center gap-2.5',
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                  )}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop Playback</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Generate & Play Speech</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => downloadAudio(text)}
                  disabled={isLoading || !text.trim()}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all disabled:opacity-50"
                  title="Download MP3 Audio File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-mono text-gray-300">Speed: {speed}x</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-20 accent-violet-500 cursor-pointer"
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

          </div>

          {/* Recent Generations History Log */}
          <div className="rounded-3xl bg-[#121222]/80 border border-white/10 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Audio Exports</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">{recentHistory.length} saved items</span>
            </div>

            <div className="space-y-2.5">
              {recentHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-200 font-medium truncate">"{item.text}"</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-violet-400 font-mono">{item.voiceName}</span>
                      <span className="text-[10px] text-gray-500">•</span>
                      <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setText(item.text)
                      speak(item.text)
                    }}
                    className="p-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 transition-all shrink-0"
                    title="Replay Audio"
                  >
                    <Play className="w-3.5 h-3.5 fill-violet-300" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Quick Apps, Shortcuts & Quota Tracker */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quota Tracker Component */}
          <QuotaTracker
            totalCharsAvailable={totalCharsAvailable}
            totalCharsUsed={totalCharsUsed}
          />

          {/* Desktop Quick Shortcuts Card */}
          <div className="rounded-3xl bg-[#121222]/80 border border-white/10 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Desktop Hotkeys</h3>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Voice Dictation (STT)', key: 'Alt + M' },
                { label: 'Read Clipboard Text (TTS)', key: 'Alt + V' },
                { label: 'Desktop Screenshot', key: 'Ctrl + Shift + S' },
                { label: 'Toggle Floating Widget', key: 'Alt + W' },
              ].map((hk) => (
                <div
                  key={hk.key}
                  onClick={() => handleCopyShortcut(hk.key)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="text-xs text-gray-300 font-medium">{hk.label}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-violet-300">
                    {copiedShortcut === hk.key ? 'Copied!' : hk.key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Workstation Modules Navigation */}
          <div className="rounded-3xl bg-[#121222]/80 border border-white/10 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Studio Workstation Modules</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Voice Dictate', href: '/ai-stt', icon: Mic, color: 'text-violet-400' },
                { label: 'Meeting Room', href: '/meeting', icon: Video, color: 'text-teal-400' },
                { label: 'Secrets Vault', href: '/blog', icon: Shield, color: 'text-amber-400' },
                { label: 'Spending AI', href: '/spending', icon: Wallet, color: 'text-emerald-400' },
                { label: 'Tasks Board', href: '/todos', icon: CheckSquare, color: 'text-cyan-400' },
                { label: 'Memory Bank', href: '/memory', icon: Brain, color: 'text-pink-400' },
              ].map((mod) => {
                const Icon = mod.icon
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group flex flex-col justify-between h-24"
                  >
                    <Icon className={cn('w-5 h-5 transition-transform group-hover:scale-110', mod.color)} />
                    <span className="text-xs font-semibold text-gray-200 group-hover:text-white">{mod.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default DesktopStudioDashboard
