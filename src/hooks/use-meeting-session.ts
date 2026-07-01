'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSTTRecorder } from '@/components/stt/useSTTRecorder'
import { aiTranslate, aiPrompt } from '@/lib/ai-engine'
import {
  createMeetingSession,
  addSegmentToSession,
  finalizeMeetingSession,
  exportMeetingTranscript,
  type MeetingSession,
  type TranscriptSegment,
} from '@/lib/meeting-store'
import { useAppSettings } from '@/hooks/use-app-settings'
import { useAuth } from '@/contexts/AuthContext'
import { syncMeetings } from '@/lib/sync-engine'

// Language map matching what useSTTRecorder expects
const LANGUAGE_MAP: Record<string, string> = {
  'sw': 'sw-TZ',
  'sw-TZ': 'sw-TZ',
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pt': 'pt-PT',
  'ja': 'ja-JP',
  'zh': 'zh-CN',
  'ar': 'ar-SA',
}

export type MeetingStatus = 'idle' | 'active' | 'paused' | 'ending' | 'ended'

export function useMeetingSession() {
  const [status, setStatus] = useState<MeetingStatus>('idle')
  const [session, setSession] = useState<MeetingSession | null>(null)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [interimText, setInterimText] = useState('')
  const [language, setLanguage] = useState('sw-TZ')
  const [translationEnabled, setTranslationEnabled] = useState(true)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [wordCount, setWordCount] = useState(0)

  const sessionIdRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPausedRef = useRef(false)

  const { settings } = useAppSettings()
  const { user } = useAuth()

  // Timer
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  // Handle finalized speech segments with translation
  const handleFinalResult = useCallback(
    async (text: string) => {
      if (!sessionIdRef.current || !text.trim() || isPausedRef.current) return

      let translatedText: string | undefined

      if (translationEnabled) {
        try {
          const isSwahili =
            language.startsWith('sw') || language.startsWith('sw-TZ')
          translatedText = await aiTranslate(
            text,
            isSwahili ? 'Kiswahili' : 'English',
            isSwahili ? 'English' : 'Kiswahili',
            { model: 'gpt-4o-mini', maxTokens: 256 }
          )
        } catch {
          translatedText = undefined
        }
      }

      const segment = addSegmentToSession(
        sessionIdRef.current,
        text,
        language,
        translatedText
      )

      // Sync segment to Firestore
      syncMeetings.addSegment(user?.uid ?? null, sessionIdRef.current!, segment)

      setSegments((prev) => [...prev, segment])
      setInterimText('')
      setWordCount((prev) => prev + text.split(/\s+/).filter(Boolean).length)
    },
    [language, translationEnabled, user?.uid]
  )

  const recorder = useSTTRecorder({
    language,
    languageMap: LANGUAGE_MAP,
    continuous: true,
    interimResults: true,
    onInterimResult: (text) => {
      if (!isPausedRef.current) setInterimText(text)
    },
    onFinalResult: handleFinalResult,
  })

  const startMeeting = useCallback(() => {
    const normalizedLang = language.startsWith('sw') ? 'sw-TZ' : language
    const newSession = createMeetingSession(
      normalizedLang,
      translationEnabled
    )
    sessionIdRef.current = newSession.id
    setSession(newSession)
    setSegments([])
    setInterimText('')
    setElapsedSeconds(0)
    setWordCount(0)
    setStatus('active')
    isPausedRef.current = false
    // Sync new session to Firestore
    syncMeetings.save(user?.uid ?? null, newSession)
    recorder.start()
  }, [language, translationEnabled, recorder, user?.uid])

  const pauseMeeting = useCallback(() => {
    isPausedRef.current = true
    recorder.stop()
    setStatus('paused')
  }, [recorder])

  const resumeMeeting = useCallback(() => {
    isPausedRef.current = false
    setStatus('active')
    recorder.start()
  }, [recorder])

  const endMeeting = useCallback(async () => {
    recorder.stop()
    setStatus('ending')
    setIsGeneratingSummary(true)

    if (!sessionIdRef.current) {
      setStatus('ended')
      setIsGeneratingSummary(false)
      return
    }

    const fullText = segments.map((s) => s.text).join(' ')

    if (fullText.trim()) {
      try {
        const [summaryResult, topicsResult, actionsResult] =
          await Promise.allSettled([
            aiPrompt(
              `Write a concise meeting summary (3-5 sentences):\n\n${fullText}`,
              'You are a meeting assistant. Be concise and professional.',
              { model: 'gpt-4o-mini', maxTokens: 512 }
            ),
            aiPrompt(
              `Extract 5-8 key topics discussed. Return as a JSON array of strings only: ["topic1", "topic2", ...]\n\n${fullText}`,
              'Return only a valid JSON array of strings.',
              { model: 'gpt-4o-mini', maxTokens: 256 }
            ),
            aiPrompt(
              `Extract any action items, tasks, or decisions. Return as a JSON array of strings only: ["action1", "action2", ...]\n\nIf none found, return: []\n\n${fullText}`,
              'Return only a valid JSON array of strings.',
              { model: 'gpt-4o-mini', maxTokens: 256 }
            ),
          ])

        const summary =
          summaryResult.status === 'fulfilled'
            ? summaryResult.value.text
            : undefined

        let keyTopics: string[] | undefined
        if (topicsResult.status === 'fulfilled') {
          try {
            // Use [\s\S] instead of /s flag for ES5 compatibility
            const raw = topicsResult.value.text.match(/\[[\s\S]*\]/)?.[0] ?? '[]'
            keyTopics = JSON.parse(raw)
          } catch {
            keyTopics = undefined
          }
        }

        let actionItems: string[] | undefined
        if (actionsResult.status === 'fulfilled') {
          try {
            const raw = actionsResult.value.text.match(/\[[\s\S]*\]/)?.[0] ?? '[]'
            actionItems = JSON.parse(raw)
          } catch {
            actionItems = undefined
          }
        }

        const finalSession = finalizeMeetingSession(
          sessionIdRef.current,
          summary,
          keyTopics,
          actionItems
        )

        setSession(finalSession)
        // Sync finalized session to Firestore
        syncMeetings.update(user?.uid ?? null, finalSession.id, {
          summary,
          keyTopics,
          actionItems,
          endedAt: finalSession.endedAt,
          durationMs: finalSession.durationMs,
        })
      } catch (err) {
        console.error('[Meeting] Summary generation failed:', err)
        const fs = finalizeMeetingSession(sessionIdRef.current!)
        syncMeetings.update(user?.uid ?? null, fs.id, {
          endedAt: fs.endedAt,
          durationMs: fs.durationMs,
        })
      }
    } else {
      const fs = finalizeMeetingSession(sessionIdRef.current!)
      syncMeetings.update(user?.uid ?? null, fs.id, {
        endedAt: fs.endedAt,
        durationMs: fs.durationMs,
      })
    }

    setIsGeneratingSummary(false)
    setStatus('ended')
  }, [recorder, segments])

  const exportTranscript = useCallback(() => {
    if (!session) return
    exportMeetingTranscript(session)
  }, [session])

  const resetMeeting = useCallback(() => {
    recorder.reset()
    setStatus('idle')
    setSession(null)
    setSegments([])
    setInterimText('')
    setElapsedSeconds(0)
    setWordCount(0)
    sessionIdRef.current = null
    isPausedRef.current = false
  }, [recorder])

  return {
    status,
    session,
    segments,
    interimText,
    language,
    setLanguage,
    translationEnabled,
    setTranslationEnabled,
    elapsedSeconds,
    wordCount,
    isGeneratingSummary,
    recorderState: recorder.state,
    isRecording: recorder.state === 'recording',
    startMeeting,
    pauseMeeting,
    resumeMeeting,
    endMeeting,
    exportTranscript,
    resetMeeting,
  }
}