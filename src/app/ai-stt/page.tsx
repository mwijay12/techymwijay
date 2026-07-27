'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Sparkles, AlertCircle, Minimize2, Maximize2 } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AudioVisualizer } from '@/components/stt/AudioVisualizer'
import { RecordingControls } from '@/components/stt/RecordingControls'
import { TranscriptEditor } from '@/components/stt/TranscriptEditor'
import { VoiceCommandFeedback } from '@/components/stt/VoiceCommandFeedback'
import { TranscriptHistory } from '@/components/stt/TranscriptHistory'
import { MiniVoiceStudioWidget } from '@/components/stt/MiniVoiceStudioWidget'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useTTS } from '@/hooks/use-tts'
import { useVault } from '@/hooks/use-vault'
import { useTodos } from '@/hooks/use-todos'
import { cn } from '@/lib/utils'

export default function STTPage() {
  const [isMiniMode, setIsMiniMode] = useState(false)
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
    lastCommand,
    clearCommand,
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
        title: `Voice Dictation — ${new Date().toLocaleDateString()}`,
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

  return (
    <ProtectedRoute>
      <AppShell>
        <PageWrapper maxWidth="7xl">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent" />
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6 py-4">
            {/* Header */}
            <div className="pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1 text-xs text-indigo-300 mb-3">
                  <Mic className="w-3.5 h-3.5" />
                  <span>AI Voice Studio — Speech to Text</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Swahili-English STT Studio 🇹🇿
                </h1>
                <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                  Real-time voice dictation with Groq Whisper-large-v3, code-switching support, voice commands & vault sync.
                </p>
              </div>

              {/* Mini Mode Toggle Button */}
              <button
                onClick={() => setIsMiniMode(!isMiniMode)}
                className={cn(
                  'px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0',
                  isMiniMode
                    ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                )}
              >
                {isMiniMode ? (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand Studio</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-4 h-4 text-cyan-400" />
                    <span>Mini Floating Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Toast notification */}
            {toastMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold text-center">
                {toastMessage}
              </div>
            )}

            {isMiniMode ? (
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
              <>
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

                {/* History list */}
                <TranscriptHistory
                  sessions={sessions}
                  onSelect={appendText}
                />

                {/* Voice Command Feedback overlay */}
                <VoiceCommandFeedback
                  command={lastCommand}
                  onDismiss={clearCommand}
                />
              </>
            )}
          </div>
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}