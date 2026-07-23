'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Sparkles, AlertCircle } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AudioVisualizer } from '@/components/stt/AudioVisualizer'
import { RecordingControls } from '@/components/stt/RecordingControls'
import { TranscriptEditor } from '@/components/stt/TranscriptEditor'
import { VoiceCommandFeedback } from '@/components/stt/VoiceCommandFeedback'
import { TranscriptHistory } from '@/components/stt/TranscriptHistory'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useVault } from '@/hooks/use-vault'
import { useTodos } from '@/hooks/use-todos'

export default function STTPage() {
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

  const { addItem: addVaultItem } = useVault()
  const { addTodo } = useTodos()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

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
            <div className="pb-6 border-b border-white/10">
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
              transcript={fullTranscript}
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
          </div>
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}