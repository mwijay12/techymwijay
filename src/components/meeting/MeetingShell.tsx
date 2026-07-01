'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useMeetingSession } from '@/hooks/use-meeting-session'
import { MeetingCaptionDisplay } from './MeetingCaptionDisplay'
import { MeetingControls } from './MeetingControls'
import { MeetingTranscriptLog } from './MeetingTranscriptLog'
import { MeetingSessionSummary } from './MeetingSessionSummary'
import { MeetingLanguagePicker } from './MeetingLanguagePicker'
import { AISidebar } from '@/components/ai-sidebar'

export function MeetingShell() {
  const meeting = useMeetingSession()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLog, setShowLog] = useState(true)
  const [lastFinalText, setLastFinalText] = useState('')
  const [lastTranslation, setLastTranslation] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)

  // Track latest segment for caption display
  useEffect(() => {
    const latest = meeting.segments[meeting.segments.length - 1]
    if (latest) {
      setLastFinalText(latest.text)
      setLastTranslation(latest.translatedText ?? '')
    }
  }, [meeting.segments.length])

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen()
      } catch (err) {
        // CSS fallback if native fullscreen fails
        setIsFullscreen(true)
      }
    } else {
      try {
        await document.exitFullscreen()
      } catch {
        setIsFullscreen(false)
      }
    }
  }, [])

  // If meeting ended, show summary
  if (meeting.status === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <MeetingSessionSummary
          session={meeting.session!}
          isGeneratingSummary={meeting.isGeneratingSummary}
          onExport={meeting.exportTranscript}
          onNewMeeting={meeting.resetMeeting}
        />
      </div>
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`
          relative flex flex-col h-full transition-all duration-300
          ${isFullscreen && !document.fullscreenElement
            ? 'fixed inset-0 z-[9999] bg-zinc-950'
            : meeting.status === 'idle'
              ? 'min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950'
              : 'min-h-screen bg-zinc-950'
          }
        `}
      >
        {/* Thin header when idle */}
        {meeting.status === 'idle' && (
          <div className="flex items-center justify-center px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-lg">🎙️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Meeting Mode</h1>
                <p className="text-xs text-white/40">Live transcription & translation</p>
              </div>
            </div>
          </div>
        )}

        {/* Active header with language picker */}
        {meeting.status !== 'idle' && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-sm">🎙️</span>
              </div>
              <span className="text-sm font-semibold text-white/80">Meeting Mode</span>
            </div>
            <div className="flex items-center gap-3">
              <MeetingLanguagePicker
                language={meeting.language}
                onLanguageChange={meeting.setLanguage}
                disabled={meeting.status === 'active'}
              />
              <button
                onClick={() => setShowLog(!showLog)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  showLog
                    ? 'bg-white/10 text-white/70'
                    : 'bg-white/5 text-white/40 hover:text-white/70'
                }`}
              >
                {showLog ? 'Hide Log' : 'Show Log'}
              </button>
            </div>
          </div>
        )}

        {/* Main caption area — hero UI */}
        {meeting.status !== 'idle' && (
          <MeetingCaptionDisplay
            finalText={lastFinalText}
            interimText={meeting.interimText}
            translatedText={lastTranslation}
            showTranslation={meeting.translationEnabled}
            isFullscreen={isFullscreen}
          />
        )}

        {/* Idle state hero */}
        {meeting.status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
              <span className="text-4xl">🎙️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Live Meeting Transcription</h2>
            <p className="text-sm text-white/40 mb-8 text-center max-w-md">
              Select your language and click Start. Captions appear live, translations in real-time.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <MeetingLanguagePicker
                language={meeting.language}
                onLanguageChange={meeting.setLanguage}
                disabled={false}
              />
            </div>
            <button
              onClick={meeting.startMeeting}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-semibold text-lg transition-colors shadow-lg shadow-red-500/25"
            >
              <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
              Start Meeting
            </button>
          </div>
        )}

        {/* Transcript log */}
        {meeting.status !== 'idle' && (
          <MeetingTranscriptLog
            segments={meeting.segments}
            showTranslation={meeting.translationEnabled}
            isOpen={showLog}
          />
        )}

        {/* Controls bar */}
        {meeting.status !== 'idle' && (
          <MeetingControls
            status={meeting.status}
            elapsedSeconds={meeting.elapsedSeconds}
            translationEnabled={meeting.translationEnabled}
            isFullscreen={isFullscreen}
            showSidebar={showSidebar}
            wordCount={meeting.wordCount}
            onStart={meeting.startMeeting}
            onPause={meeting.pauseMeeting}
            onResume={meeting.resumeMeeting}
            onEnd={meeting.endMeeting}
            onToggleTranslation={() => meeting.setTranslationEnabled(!meeting.translationEnabled)}
            onToggleFullscreen={toggleFullscreen}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            onExport={meeting.exportTranscript}
          />
        )}
      </div>

      {/* AI Sidebar — reuse from Prompt 4 */}
      <AISidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        context={meeting.session?.fullTranscript}
        contextLanguage={meeting.language}
      />
    </>
  )
}