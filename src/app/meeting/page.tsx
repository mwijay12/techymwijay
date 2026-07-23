'use client'

import { useState } from 'react'
import { Radio, Sparkles, RefreshCw } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useMeeting } from '@/hooks/use-meeting'
import { MeetingControls } from '@/components/meeting/MeetingControls'
import { MeetingTimeline } from '@/components/meeting/MeetingTimeline'
import { MeetingSummary } from '@/components/meeting/MeetingSummary'
import { MeetingExport } from '@/components/meeting/MeetingExport'
import { MeetingHistory } from '@/components/meeting/MeetingHistory'
import { AudioVisualizer } from '@/components/stt/AudioVisualizer'

export default function MeetingPage() {
  const {
    meetingState,
    currentSession,
    sessionDuration,
    pastSessions,
    chunks,
    interimText,
    analyserNode,
    activeEngine,
    summary,
    isSummarizing,
    startMeeting,
    pauseMeeting,
    resumeMeeting,
    stopMeeting,
    generateSummary,
    saveToVault,
    deleteSession,
    loadSession,
    updateChunkTag,
    error,
    clearError,
  } = useMeeting()

  const isRecording = meetingState === 'recording'

  return (
    <ProtectedRoute>
      <AppShell>
        <PageWrapper maxWidth="7xl">
          <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Meeting & Lecture Transcription
                  </h1>
                </div>
                <p className="text-xs text-gray-400">
                  Urekodi wa Mkutano — Live Swahili-English capture, 30s Groq Whisper chunks, and AI meeting summaries
                </p>
              </div>

              {currentSession && (
                <MeetingExport
                  session={currentSession}
                  onSaveToVault={saveToVault}
                />
              )}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 cols): Controls + Visualizer + Timeline + Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Controls */}
                <MeetingControls
                  meetingState={meetingState}
                  sessionDuration={sessionDuration}
                  activeEngine={activeEngine}
                  error={error}
                  onStart={startMeeting}
                  onPause={pauseMeeting}
                  onResume={resumeMeeting}
                  onStop={stopMeeting}
                  onClearError={clearError}
                />

                {/* Audio visualizer during recording */}
                {isRecording && analyserNode && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                        Live Audio Spectrum
                      </span>
                      <span className="text-[10px] text-purple-400 font-mono animate-pulse">
                        ● Recording...
                      </span>
                    </div>
                    <AudioVisualizer
                      analyserNode={analyserNode}
                      isActive={isRecording}
                      isPaused={false}
                      height={60}
                      barColor="#a855f7"
                    />
                  </div>
                )}

                {/* AI Summary card (if session complete or has summary) */}
                {(meetingState === 'complete' || summary) && (
                  <MeetingSummary
                    summary={summary}
                    isSummarizing={isSummarizing}
                    onGenerate={generateSummary}
                  />
                )}

                {/* Timeline */}
                {meetingState !== 'idle' && meetingState !== 'setup' && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Live Meeting Timeline
                        </h3>
                        <p className="text-[10px] text-gray-400">
                          {currentSession?.title}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {chunks.length} {chunks.length === 1 ? 'chunk' : 'chunks'}
                      </span>
                    </div>

                    <MeetingTimeline
                      chunks={chunks}
                      interimText={interimText}
                      isRecording={isRecording}
                      onTagChange={updateChunkTag}
                    />
                  </div>
                )}
              </div>

              {/* Right Column (1 col): Meeting History & Session Info */}
              <div className="space-y-6">
                {currentSession && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-5 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Current Session Info
                    </h3>
                    <div className="space-y-1.5 text-xs text-gray-300 font-sans">
                      <p><span className="text-gray-500">Title:</span> {currentSession.title}</p>
                      {currentSession.context && (
                        <p><span className="text-gray-500">Context:</span> {currentSession.context}</p>
                      )}
                      <p><span className="text-gray-500">Started:</span> {new Date(currentSession.startedAt).toLocaleTimeString()}</p>
                      <p><span className="text-gray-500">Language:</span> {currentSession.language === 'mixed' ? 'Swahili-English 🇹🇿🇺🇸' : currentSession.language}</p>
                    </div>
                  </div>
                )}

                <MeetingHistory
                  sessions={pastSessions}
                  activeSessionId={currentSession?.id}
                  onSelect={loadSession}
                  onDelete={deleteSession}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-5"
                />
              </div>
            </div>
          </div>
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}