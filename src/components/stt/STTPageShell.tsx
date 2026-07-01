'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mic, Headphones, FileText } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import ChatComponent from '@/components/layout/ChatComponent'
import { useSTTRecorder } from './useSTTRecorder'
import { useSTTMemory } from './useSTTMemory'
import { RecordingControls } from './RecordingControls'
import { LanguageSelector, languageNames, languageMap } from './LanguageSelector'
import { TranscriptionPanel } from './TranscriptionPanel'
import { TranslationBox } from './TranslationBox'
import { MemoryPanel } from './MemoryPanel'
import { AISidebar } from '@/components/ai-sidebar'
import { CaptionOverlay } from './CaptionOverlay'
import type { MemoryEntry } from '@/lib/stt-memory'

const SectionWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.section 
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.section>
)

export function STTPageShell() {
  const [chatOpen, setChatOpen] = useState(false)
  const [language, setLanguage] = useState('sw')
  const [targetLang, setTargetLang] = useState('en')
  const [activeTab, setActiveTab] = useState<'microphone' | 'file'>('microphone')
  const [isFileTranscribing, setIsFileTranscribing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [showCaptionView, setShowCaptionView] = useState(false)
  const [showAISidebar, setShowAISidebar] = useState(false)
  const [showMemory, setShowMemory] = useState(false)
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const memory = useSTTMemory()

  const handleFinalResult = useCallback(async (text: string) => {
    if (autoTranslate && language !== targetLang) {
      setIsTranslating(true)
      try {
        const sourceLangName = languageNames[language] || language
        const targetLangName = languageNames[targetLang] || targetLang
        const response = await (window as any).puter.ai.chat(
          `Translate this text from ${sourceLangName} to ${targetLangName}. Return ONLY the translation, nothing else:\n\n${text}`,
          { model: 'gpt-4o-mini', system: 'You are a translator. Return only the translated text.', stream: false }
        )
        const t = typeof response === 'string' ? response : response?.message?.content || response?.text || ''
        setTranslatedText(t.replace(/^["']|["']$/g, '').trim())
      } catch {}
      setIsTranslating(false)
    }
    memory.save(text, language, 'microphone')
  }, [autoTranslate, language, targetLang, memory])

  const handleStopWithSave = useCallback(() => {
    // If there's text from the recorder, save it
    // This is handled by the recorder's stop + onFinalResult
  }, [])

  const recorder = useSTTRecorder({
    language,
    languageMap,
    continuous: true,
    interimResults: true,
    onFinalResult: handleFinalResult,
  })

  // File transcription
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    recorder.setErrorMsg('')
    recorder.setTranscribedText('')
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
    setAudioPreviewUrl(URL.createObjectURL(file))
  }

  const transcribeFile = async () => {
    if (!selectedFile) {
      recorder.setErrorMsg('Chagua faili la sauti kwanza.')
      return
    }
    setIsFileTranscribing(true)
    recorder.setErrorMsg('')
    try {
      const reader = new FileReader()
      const b64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1] || reader.result as string)
        reader.onerror = reject
      })
      reader.readAsDataURL(selectedFile)
      const response = await (window as any).puter.ai.chat(
        `Transcribe this audio to text. Return ONLY the transcribed text.`,
        { model: 'gpt-4o', system: 'You transcribe audio accurately.', stream: false }
      )
      let text = (typeof response === 'string' ? response : response?.message?.content || response?.text || '').replace(/```/g, '').trim()
      if (text) {
        recorder.setTranscribedText(text)
        // Save to memory
        let translated: string | undefined = undefined
        if (autoTranslate && language !== targetLang) {
          const sourceLangName = languageNames[language] || language
          const targetLangName = languageNames[targetLang] || targetLang
          const resp = await (window as any).puter.ai.chat(
            `Translate this text from ${sourceLangName} to ${targetLangName}. Return ONLY the translation:\n\n${text}`,
            { model: 'gpt-4o-mini', system: 'Translator', stream: false }
          )
          translated = (typeof resp === 'string' ? resp : resp?.message?.content || resp?.text || '').replace(/^["']|["']$/g, '').trim()
          if (translated) setTranslatedText(translated)
        }
        memory.save(text, language, 'file', translated, undefined, selectedFile.name)
      } else throw new Error('Hakuna matokeo')
    } catch (err: any) {
      recorder.setErrorMsg(err.message || 'Transcription imeshindwa.')
    }
    setIsFileTranscribing(false)
  }

  const handleReplayEntry = (entry: MemoryEntry) => {
    recorder.setTranscribedText(entry.text)
    setTranslatedText(entry.translatedText || '')
    setLanguage(entry.language)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (audioPreviewUrl) { URL.revokeObjectURL(audioPreviewUrl); setAudioPreviewUrl(null) }
  }

  const togglePlayPreview = () => {
    if (!audioPreviewUrl) return
    if (isPlaying) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
      setIsPlaying(false)
    } else {
      if (audioRef.current) audioRef.current.pause()
      audioRef.current = new Audio(audioPreviewUrl)
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    recorder.reset()
    setTranslatedText('')
    setSelectedFile(null)
    if (audioPreviewUrl) { URL.revokeObjectURL(audioPreviewUrl); setAudioPreviewUrl(null) }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
    }
  }, [audioPreviewUrl])

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <Navigation onOpenChat={() => setChatOpen(true)} />

      {/* Hero */}
      <section className="pt-24 pb-6 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm text-emerald-400 mb-3">
              <Mic className="w-4 h-4" />
              <span>Sauti kwa Maandishi • Speech-to-Text</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-gray-300 bg-clip-text text-transparent">
                Mwijay AI Voice Studio
              </span>
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Ongea kwa Kiswahili au lugha yoyote — tafsiri kwa Kiingereza, hifadhi kumbukumbu, na tumia AI kukusaidia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Interface */}
      <SectionWrapper className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-1 gap-4">
            {/* Main Column — sidebar is now a fixed overlay */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/5 text-emerald-400">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Transcription</p>
                      <p className="text-gray-400 text-[10px]">Ongea • Speak • Habla</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <LanguageSelector
                      language={language}
                      targetLang={targetLang}
                      onLanguageChange={setLanguage}
                      onTargetLangChange={setTargetLang}
                      autoTranslate={autoTranslate}
                      onAutoTranslateChange={setAutoTranslate}
                    />
                  </div>

                  <RecordingControls
                    state={recorder.state}
                    isSupported={recorder.isSupported}
                    isClient={recorder.isClient}
                    errorMsg={recorder.errorMsg}
                    recordingDuration={recorder.recordingDuration}
                    onStart={recorder.start}
                    onStop={recorder.stop}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedFile={selectedFile}
                    isFileTranscribing={isFileTranscribing}
                    audioPreviewUrl={audioPreviewUrl}
                    isPlaying={isPlaying}
                    onFileSelect={handleFileSelect}
                    onTranscribeFile={transcribeFile}
                    onTogglePlay={togglePlayPreview}
                    onClearFile={handleClearFile}
                    fileInputRef={fileInputRef}
                    onReset={handleReset}
                    showCaptionView={showCaptionView}
                    onToggleCaptionView={() => setShowCaptionView(!showCaptionView)}
                    showAISidebar={showAISidebar}
                    onToggleAISidebar={() => setShowAISidebar(!showAISidebar)}
                    showMemory={showMemory}
                    onToggleMemory={() => setShowMemory(!showMemory)}
                  />

                  <TranscriptionPanel
                    transcribedText={recorder.transcribedText}
                    isFileTranscribing={isFileTranscribing}
                    language={language}
                    onCopy={handleCopy}
                    copied={copied}
                    languageNames={languageNames}
                  />

                  <TranslationBox
                    sourceText={recorder.transcribedText}
                    sourceLanguage={language}
                    targetLang={targetLang}
                    autoTranslate={autoTranslate}
                    onAutoTranslateChange={setAutoTranslate}
                    translatedText={translatedText}
                    setTranslatedText={setTranslatedText}
                    isTranslating={isTranslating}
                    setIsTranslating={setIsTranslating}
                    onCopy={handleCopy}
                    copied={copied}
                  />
                </div>
              </div>

              <MemoryPanel
                showMemory={showMemory}
                memory={memory.entries}
                filteredEntries={memory.filteredEntries}
                searchQuery={memory.searchQuery}
                onSearchChange={memory.setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onReplay={handleReplayEntry}
                onFavorite={memory.favorite}
                onDelete={memory.remove}
                onExport={memory.exportAll}
                onClearAll={memory.clearAll}
              />
            </div>

          </div>
        </div>
      </SectionWrapper>

      {/* Caption Overlay */}
      <CaptionOverlay
        show={showCaptionView && recorder.state === 'recording'}
        interimText={recorder.interimText}
        transcribedText={recorder.transcribedText}
        translatedText={translatedText}
      />

      <Footer />
      <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
    </main>
  )
}