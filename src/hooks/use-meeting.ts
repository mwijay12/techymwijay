'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMicrophone } from './use-microphone'
import { formatTranscript, detectLanguageMix } from '@/lib/swahili-processor'
import {
  createMeetingSession,
  addChunkToSession,
  updateChunkText,
  endMeetingSession,
  markSessionSavedToVault,
  loadSessionsFromStorage,
  deleteSessionFromStorage,
  type MeetingSession,
  type MeetingChunk,
  type SpeakerTag,
  type MeetingLanguage,
} from '@/lib/meeting-service'
import { useAuth } from '@/components/auth/AuthProvider'

const CHUNK_INTERVAL_MS = 30_000

export type MeetingState =
  | 'idle'
  | 'setup'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'complete'

export interface UseMeetingReturn {
  meetingState: MeetingState
  currentSession: MeetingSession | null
  sessionDuration: number
  pastSessions: MeetingSession[]

  chunks: MeetingChunk[]
  interimText: string

  analyserNode: AnalyserNode | null
  activeEngine: 'groq' | 'webspeech'

  summary: string | null
  isSummarizing: boolean

  startMeeting: (title: string, context?: string) => Promise<void>
  pauseMeeting: () => void
  resumeMeeting: () => Promise<void>
  stopMeeting: () => Promise<void>
  generateSummary: () => Promise<void>
  saveToVault: () => Promise<string | null>
  deleteSession: (sessionId: string) => void
  loadSession: (session: MeetingSession) => void

  updateChunkTag: (chunkId: string, tag: SpeakerTag | undefined) => void

  error: string | null
  clearError: () => void
}

export function useMeeting(): UseMeetingReturn {
  const { user } = useAuth()
  const mic = useMicrophone()

  const [meetingState, setMeetingState] = useState<MeetingState>('idle')
  const [currentSession, setCurrentSession] =
    useState<MeetingSession | null>(null)
  const [chunks, setChunks] = useState<MeetingChunk[]>([])
  const [interimText, setInterimText] = useState('')
  const [sessionDuration, setSessionDuration] = useState(0)
  const [pastSessions, setPastSessions] = useState<MeetingSession[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [activeEngine, setActiveEngine] = useState<'groq' | 'webspeech'>('groq')
  const [error, setError] = useState<string | null>(null)

  const sessionRef = useRef<MeetingSession | null>(null)
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartRef = useRef<number>(0)
  const currentChunkIdRef = useRef<string>('')
  const webSpeechRef = useRef<any>(null)

  useEffect(() => {
    if (!user?.uid) return
    const sessions = loadSessionsFromStorage(user.uid)
    setPastSessions(
      sessions.sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )
    )
  }, [user?.uid])

  const startWebSpeech = useCallback(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'sw-KE'

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          interim += event.results[i][0].transcript
        }
      }
      if (interim) setInterimText(interim)
    }

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setActiveEngine('groq')
      }
    }

    recognition.onend = () => {
      if (meetingState === 'recording') {
        try {
          recognition.start()
        } catch {}
      }
    }

    try {
      recognition.start()
      webSpeechRef.current = recognition
      setActiveEngine('webspeech')
    } catch {
      setActiveEngine('groq')
    }
  }, [meetingState])

  const processChunkWithGroq = useCallback(
    async (
      audioBlob: Blob,
      chunkId: string,
      timestamp: number
    ): Promise<void> => {
      if (!user?.uid || !sessionRef.current) return

      try {
        const formData = new FormData()
        formData.append('audio', audioBlob, `chunk-${chunkId}.webm`)
        formData.append('language', 'auto')
        formData.append(
          'prompt',
          'Tanzania, Swahili, English, lecture, meeting, code-switching'
        )

        const res = await fetch('/api/stt', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (data.error === 'USE_WEB_SPEECH_FALLBACK') {
          setActiveEngine('webspeech')
          return
        }

        if (res.ok && data.text?.trim()) {
          const processed = formatTranscript(data.text)
          const lang = detectLanguageMix(data.text) as MeetingLanguage

          updateChunkText(
            user.uid,
            sessionRef.current.id,
            chunkId,
            processed,
            'groq',
            lang
          )

          setChunks(prev =>
            prev.map(c =>
              c.id === chunkId
                ? {
                    ...c,
                    text: processed,
                    engine: 'groq',
                    language: lang,
                    isProcessing: false,
                  }
                : c
            )
          )

          setActiveEngine('groq')
        }
      } catch (err) {
        console.warn('[Meeting] Groq chunk processing failed:', err)
      }
    },
    [user?.uid]
  )

  const processCurrentChunk = useCallback(async () => {
    if (!user?.uid || !sessionRef.current) return
    if (mic.state !== 'recording') return

    const audioBlob = await mic.stopRecording()

    if (audioBlob && audioBlob.size > 1000) {
      const chunkId = currentChunkIdRef.current
      const timestamp = Math.floor(
        (Date.now() - sessionStartRef.current) / 1000
      )

      processChunkWithGroq(audioBlob, chunkId, timestamp).catch(() => {})

      const nextChunkId = uuidv4()
      currentChunkIdRef.current = nextChunkId

      const nextChunk: MeetingChunk = {
        id: nextChunkId,
        text: '',
        timestamp,
        language: 'mixed',
        engine: 'groq',
        isProcessing: false,
      }

      if (sessionRef.current) {
        addChunkToSession(user.uid, sessionRef.current.id, nextChunk)
      }

      setChunks(prev => [...prev, nextChunk])
      await mic.startRecording()
    }
  }, [user?.uid, mic, processChunkWithGroq])

  const startMeeting = useCallback(
    async (title: string, context?: string) => {
      if (!user?.uid) return

      setError(null)
      setSummary(null)
      setChunks([])
      setInterimText('')
      setSessionDuration(0)

      try {
        await mic.startRecording()

        const session = createMeetingSession(user.uid, title, context)
        sessionRef.current = session
        sessionStartRef.current = Date.now()

        const firstChunkId = uuidv4()
        currentChunkIdRef.current = firstChunkId

        const firstChunk: MeetingChunk = {
          id: firstChunkId,
          text: '',
          timestamp: 0,
          language: 'mixed',
          engine: 'groq',
          isProcessing: true,
        }

        addChunkToSession(user.uid, session.id, firstChunk)
        setChunks([firstChunk])
        setCurrentSession(session)
        setMeetingState('recording')

        startWebSpeech()

        durationIntervalRef.current = setInterval(() => {
          setSessionDuration(
            Math.floor((Date.now() - sessionStartRef.current) / 1000)
          )
        }, 1000)

        chunkIntervalRef.current = setInterval(() => {
          processCurrentChunk()
        }, CHUNK_INTERVAL_MS)
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to start recording'
        setError(
          msg.includes('Permission')
            ? 'Microphone permission denied. Please allow access.'
            : msg
        )
        setMeetingState('idle')
      }
    },
    [user?.uid, mic, startWebSpeech, processCurrentChunk]
  )

  const pauseMeeting = useCallback(() => {
    mic.pauseRecording()
    webSpeechRef.current?.stop()

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current)
    }

    setMeetingState('paused')
    setInterimText('')
  }, [mic])

  const resumeMeeting = useCallback(async () => {
    mic.resumeRecording()
    startWebSpeech()

    sessionStartRef.current = Date.now() - sessionDuration * 1000

    durationIntervalRef.current = setInterval(() => {
      setSessionDuration(
        Math.floor((Date.now() - sessionStartRef.current) / 1000)
      )
    }, 1000)

    chunkIntervalRef.current = setInterval(() => {
      processCurrentChunk()
    }, CHUNK_INTERVAL_MS)

    setMeetingState('recording')
  }, [mic, startWebSpeech, processCurrentChunk, sessionDuration])

  const stopMeeting = useCallback(async () => {
    if (!user?.uid || !sessionRef.current) return

    setMeetingState('processing')

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current)
      chunkIntervalRef.current = null
    }

    webSpeechRef.current?.stop()
    webSpeechRef.current = null
    setInterimText('')

    const finalBlob = await mic.stopRecording()

    if (finalBlob && finalBlob.size > 1000) {
      const chunkId = currentChunkIdRef.current
      const timestamp = Math.floor(
        (Date.now() - sessionStartRef.current) / 1000
      )
      await processChunkWithGroq(finalBlob, chunkId, timestamp)
    }

    const duration = Math.floor(
      (Date.now() - sessionStartRef.current) / 1000
    )
    const ended = endMeetingSession(user.uid, sessionRef.current.id, duration)

    if (ended) {
      setCurrentSession(ended)
      sessionRef.current = ended
      setPastSessions(prev => [ended, ...prev].slice(0, 10))
    }

    setMeetingState('complete')
  }, [user?.uid, mic, processChunkWithGroq])

  const generateSummary = useCallback(async () => {
    if (!currentSession || chunks.length === 0) return

    setIsSummarizing(true)

    try {
      const transcript = chunks
        .filter(c => c.text.trim())
        .map(c => `[${c.timestamp}s] ${c.text}`)
        .join('\n\n')

      if (!transcript.trim()) {
        setSummary('No transcript content to summarize.')
        return
      }

      const promptText = `Summarize this meeting/lecture transcript. The speaker is a BIT student in Tanzania. The transcript may be in Swahili, English, or both mixed naturally.

Provide:
1. **Meeting Overview** (2-3 sentences)
2. **Key Points** (bullet list, max 5)  
3. **Action Items** (things that need to be done — if any)
4. **Important Terms/Concepts** (if it's a lecture)

Keep it concise and practical.

TRANSCRIPT:
${transcript.slice(0, 8000)}`

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              id: uuidv4(),
              role: 'user',
              content: promptText,
              timestamp: new Date().toISOString(),
            },
          ],
          maxTokens: 1024,
          temperature: 0.3,
        }),
      })

      const data = await res.json()

      if (res.ok && data.content) {
        const summaryText = data.content as string
        setSummary(summaryText)

        if (user?.uid && currentSession) {
          endMeetingSession(
            user.uid,
            currentSession.id,
            currentSession.duration,
            summaryText
          )
        }
      } else {
        setSummary(
          'Summary generation failed. Copy the transcript to summarize manually.'
        )
      }
    } catch {
      setSummary('Could not generate summary. Check your internet connection.')
    } finally {
      setIsSummarizing(false)
    }
  }, [currentSession, chunks, user?.uid])

  const saveToVault = useCallback(async (): Promise<string | null> => {
    if (!currentSession || !user?.uid) return null

    try {
      const { createVaultItem } = await import('@/lib/vault-service')

      const transcript = chunks
        .filter(c => c.text.trim())
        .map(
          c =>
            `[${c.timestamp}s]${c.speakerTag ? ` [${c.speakerTag}]` : ''} ${c.text}`
        )
        .join('\n\n')

      const content = [
        summary ? `AI SUMMARY:\n${summary}\n\n` : '',
        'TRANSCRIPT:\n',
        transcript || '(No transcript captured)',
      ].join('')

      const vaultItem = await createVaultItem(user.uid, {
        title: `Meeting: ${currentSession.title}`,
        category: 'notes',
        content: content.slice(0, 2000),
        tags: [
          'meeting',
          'transcript',
          currentSession.language === 'mixed'
            ? 'swahili-english'
            : currentSession.language,
        ],
      })

      markSessionSavedToVault(user.uid, currentSession.id, vaultItem.id)

      setCurrentSession(prev =>
        prev
          ? {
              ...prev,
              savedToVault: true,
              vaultItemId: vaultItem.id,
            }
          : null
      )

      return vaultItem.id
    } catch (err) {
      setError('Failed to save to vault')
      return null
    }
  }, [currentSession, chunks, summary, user?.uid])

  const updateChunkTag = useCallback(
    (chunkId: string, tag: SpeakerTag | undefined) => {
      setChunks(prev =>
        prev.map(c => (c.id === chunkId ? { ...c, speakerTag: tag } : c))
      )
    },
    []
  )

  const deleteSession = useCallback(
    (sessionId: string) => {
      if (!user?.uid) return
      deleteSessionFromStorage(user.uid, sessionId)
      setPastSessions(prev => prev.filter(s => s.id !== sessionId))
    },
    [user?.uid]
  )

  const loadSession = useCallback((session: MeetingSession) => {
    setCurrentSession(session)
    setChunks(session.chunks)
    setSummary(session.summary ?? null)
    setSessionDuration(session.duration)
    setMeetingState('complete')
  }, [])

  const clearError = useCallback(() => setError(null), [])

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current)
      }
      webSpeechRef.current?.stop()
    }
  }, [])

  return {
    meetingState,
    currentSession,
    sessionDuration,
    pastSessions,
    chunks,
    interimText,
    analyserNode: mic.analyserNode,
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
  }
}
