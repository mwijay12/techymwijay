'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Volume2,
  Sparkles,
  AlertCircle,
  Minimize2,
  Maximize2,
  Layers,
  Zap,
  Globe,
  Radio,
  ArrowRight,
} from 'lucide-react'
import { useElectron } from '@/hooks/use-electron'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { HeroSection } from '@/components/landing/HeroSection'
import { StatsBar } from '@/components/landing/StatsBar'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { VoiceDemo } from '@/components/landing/VoiceDemo'
import { PersonalStory } from '@/components/landing/PersonalStory'
import { CTASection } from '@/components/landing/CTASection'
import { DesktopStudioDashboard } from '@/components/desktop/DesktopStudioDashboard'
import { AudioVisualizer } from '@/components/stt/AudioVisualizer'
import { RecordingControls } from '@/components/stt/RecordingControls'
import { TranscriptEditor } from '@/components/stt/TranscriptEditor'
import { MiniVoiceStudioWidget } from '@/components/stt/MiniVoiceStudioWidget'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useTTS } from '@/hooks/use-tts'
import { useVault } from '@/hooks/use-vault'
import { useTodos } from '@/hooks/use-todos'
import { cn } from '@/lib/utils'

export default function MainPage() {
  const { isElectron } = useElectron()
  const [isMiniMode, setIsMiniMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'studio' | 'landing'>('studio')

  const {
    isListening,
    isPaused,
    isProcessing,
    interimTranscript,
    fullTranscript,
    sessions,
    activeEngine,
    detectedLanguage,
    error,
    analyserNode,
    language,
    setLanguage,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    clearTranscript,
    appendText,
  } = useSpeechRecognition()

  const { speak } = useTTS()
  const { addItem: addVaultItem } = useVault()
  const { addTodo } = useTodos()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [editableText, setEditableText] = useState(fullTranscript)

  useEffect(() => {
    setEditableText(fullTranscript)
  }, [fullTranscript])

  const handleSaveToVault = async (text: string) => {
    if (!text.trim()) return
    try {
      await addVaultItem({
        title: `Voice Studio Dictation — ${new Date().toLocaleDateString()}`,
        category: 'notes',
        content: text,
        secretContent: text,
        tags: ['voice', 'dictation', 'stt'],
      })
      setToastMessage('Saved note to Developer Vault! 🔒')
      setTimeout(() => setToastMessage(null), 3000)
    } catch {
      setToastMessage('Failed to save to vault.')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleSaveTask = async (text: string) => {
    if (!text.trim()) return
    try {
      await addTodo({
        title: text.length > 60 ? text.slice(0, 60) + '...' : text,
        description: text,
        priority: 'medium',
        tags: ['voice'],
      })
      setToastMessage('Added new task to Todo OS! ✅')
      setTimeout(() => setToastMessage(null), 3000)
    } catch {
      setToastMessage('Failed to create task.')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  if (isElectron) {
    return (
      <AppShell>
        <DesktopStudioDashboard />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageWrapper maxWidth="7xl">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 space-y-8 pb-16 pt-4">
          
          {/* Top Bar Switcher: Studio vs Overview */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Mwijay Voice Studio</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono border border-violet-500/30">
                    DEFAULT
                  </span>
                </h1>
                <p className="text-xs text-gray-400">
                  Swahili & English STT & TTS • Real-Time AI Workstation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mini Mode Toggle */}
              <button
                onClick={() => setIsMiniMode(!isMiniMode)}
                className={cn(
                  'px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2',
                  isMiniMode
                    ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                )}
                title="Toggle Mini Floating Mode"
              >
                {isMiniMode ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand View</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mini Floating Mode</span>
                  </>
                )}
              </button>

              {/* View Switcher: Studio / Overview */}
              <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10">
                <button
                  onClick={() => setActiveTab('studio')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                    activeTab === 'studio'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  🎙️ Voice Studio
                </button>
                <button
                  onClick={() => setActiveTab('landing')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                    activeTab === 'landing'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  ✨ Features & Story
                </button>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
              {toastMessage}
            </div>
          )}

          {/* ─── VOICE STUDIO DEFAULT EXPERIENCE ────────────────── */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              {isMiniMode ? (
                /* MINI LIQUID GLASS MODE */
                <MiniVoiceStudioWidget
                  isListening={isListening}
                  isPaused={isPaused}
                  isProcessing={isProcessing}
                  language={language}
                  onLanguageChange={setLanguage}
                  transcript={editableText}
                  interimTranscript={interimTranscript}
                  onTranscriptChange={setEditableText}
                  onStart={startListening}
                  onStop={stopListening}
                  onPause={pauseListening}
                  onResume={resumeListening}
                  onSaveToVault={handleSaveToVault}
                  onSaveTask={handleSaveTask}
                  onSpeak={speak}
                  onExpand={() => setIsMiniMode(false)}
                />
              ) : (
                /* FULL STUDIO VIEW */
                <div className="space-y-6 rounded-3xl bg-[#0f111d]/90 border border-white/10 p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
                  {/* Visualizer Canvas */}
                  <AudioVisualizer
                    analyserNode={analyserNode}
                    isActive={isListening}
                    isPaused={isPaused}
                  />

                  {/* Controls */}
                  <RecordingControls
                    isListening={isListening}
                    isPaused={isPaused}
                    isProcessing={isProcessing}
                    activeEngine={activeEngine}
                    language={language}
                    onLanguageChange={setLanguage}
                    onStart={startListening}
                    onStop={stopListening}
                    onPause={pauseListening}
                    onResume={resumeListening}
                  />

                  {/* Transcript Display & Editor */}
                  <TranscriptEditor
                    transcript={editableText || fullTranscript}
                    interimTranscript={interimTranscript}
                    detectedLanguage={detectedLanguage}
                    isListening={isListening}
                    onClear={clearTranscript}
                    onSaveToVault={handleSaveToVault}
                    onSaveTask={handleSaveTask}
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── LANDING OVERVIEW SECTIONS (When user wants to read more) ─── */}
          {(activeTab === 'landing' || isMiniMode) && (
            <div className="space-y-16 pt-6">
              <HeroSection />
              
              <div id="stats">
                <StatsBar />
              </div>

              <FeatureGrid />

              <VoiceDemo />

              <PersonalStory />

              <CTASection />
            </div>
          )}

        </div>
      </PageWrapper>
    </AppShell>
  )
}