'use client'

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { useMicrophone } from './use-microphone'
import {
  formatTranscript,
  detectLanguageMix,
  cleanForStorage,
} from '@/lib/swahili-processor'
import {
  parseVoiceCommand,
  type ParsedVoiceCommand,
} from '@/lib/voice-commands'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export type STTEngine = 'groq' | 'webspeech' | 'detecting'
export type STTLanguage = 'sw' | 'en' | 'auto'

export interface STTSession {
  id: string
  transcript: string
  language: string
  engine: STTEngine
  durationMs: number
  createdAt: string
  wordCount: number
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  isPaused: boolean
  isProcessing: boolean
  interimTranscript: string
  finalTranscript: string
  fullTranscript: string
  sessions: STTSession[]
  activeEngine: STTEngine
  detectedLanguage: 'swahili' | 'english' | 'mixed'
  error: string | null
  analyserNode: AnalyserNode | null

  language: STTLanguage
  setLanguage: (lang: STTLanguage) => void

  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  pauseListening: () => void
  resumeListening: () => void
  clearTranscript: () => void
  appendText: (text: string) => void

  lastCommand: ParsedVoiceCommand | null
  clearCommand: () => void

  voiceAddTranscript: string | null
  clearVoiceAdd: () => void
}

const SESSIONS_STORAGE_KEY = 'mwijay_stt_sessions'
const MAX_SESSIONS = 10

function loadSessions(): STTSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: STTSession[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      SESSIONS_STORAGE_KEY,
      JSON.stringify(sessions.slice(0, MAX_SESSIONS))
    )
  } catch {}
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const mic = useMicrophone()

  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [sessions, setSessions] = useState<STTSession[]>(loadSessions)
  const [activeEngine, setActiveEngine] = useState<STTEngine>('detecting')
  const [detectedLanguage, setDetectedLanguage] = useState<'swahili' | 'english' | 'mixed'>('english')
  const [language, setLanguage] = useState<STTLanguage>('auto')
  const [error, setError] = useState<string | null>(null)
  const [lastCommand, setLastCommand] = useState<ParsedVoiceCommand | null>(null)
  const [voiceAddTranscript, setVoiceAddTranscript] = useState<string | null>(null)

  const webSpeechRef = useRef<any>(null)
  const sessionStartRef = useRef<number>(0)

  const hasWebSpeech =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const fullTranscript = [finalTranscript, interimTranscript]
    .filter(Boolean)
    .join(' ')
    .trim()

  const processFinalText = useCallback((raw: string) => {
    if (!raw.trim()) return

    const processed = formatTranscript(raw)
    const langMix = detectLanguageMix(raw)
    setDetectedLanguage(langMix)

    const command = parseVoiceCommand(processed)
    if (command.type !== 'none') {
      setLastCommand(command)
    }

    setFinalTranscript(prev =>
      prev ? `${prev} ${processed}` : processed
    )
    setInterimTranscript('')
  }, [])

  const transcribeWithGroq = useCallback(
    async (audioBlob: Blob): Promise<boolean> => {
      try {
        const formData = new FormData()
        formData.append(
          'audio',
          audioBlob,
          `recording.${audioBlob.type.includes('webm') ? 'webm' : 'mp4'}`
        )
        formData.append('language', language)
        formData.append(
          'prompt',
          'Tanzania, Swahili, English, code-switching, developer, student'
        )

        const res = await fetch('/api/stt', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (data.error === 'USE_WEB_SPEECH_FALLBACK') {
          return false
        }

        if (res.ok && data.text) {
          processFinalText(data.text)
          setActiveEngine('groq')
          return true
        }

        return false
      } catch {
        return false
      }
    },
    [language, processFinalText]
  )

  const setupWebSpeech = useCallback(() => {
    if (!hasWebSpeech) return null

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognitionAPI()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    if (language === 'sw') {
      recognition.lang = 'sw-KE'
    } else if (language === 'en') {
      recognition.lang = 'en-US'
    } else {
      recognition.lang = 'sw-KE'
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (interim) setInterimTranscript(interim)
      if (final) processFinalText(final)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return
      if (event.error === 'aborted') return
      setError(`Speech recognition error: ${event.error}`)
    }

    return recognition
  }, [language, hasWebSpeech, processFinalText])

  const startListening = useCallback(async () => {
    setError(null)
    setIsListening(true)
    sessionStartRef.current = Date.now()
    setActiveEngine('detecting')

    const groqHealthRes = await fetch('/api/stt')
      .then(r => r.json())
      .catch(() => ({ keysAvailable: 0 }))

    const groqAvailable = (groqHealthRes.keysAvailable ?? 0) > 0

    if (groqAvailable) {
      setActiveEngine('groq')
      await mic.startRecording()
    } else if (hasWebSpeech) {
      setActiveEngine('webspeech')
      const recognition = setupWebSpeech()
      if (recognition) {
        webSpeechRef.current = recognition
        try {
          recognition.start()
        } catch (err) {
          setError('Could not start speech recognition. Please try again.')
          setIsListening(false)
        }
      }
    } else {
      setError(
        'Speech recognition not available. Please use Chrome or Edge, or add Groq API keys.'
      )
      setIsListening(false)
    }
  }, [mic, hasWebSpeech, setupWebSpeech])

  const stopListening = useCallback(async () => {
    setIsListening(false)

    if (activeEngine === 'groq') {
      const audioBlob = await mic.stopRecording()

      if (audioBlob && audioBlob.size > 1000) {
        const success = await transcribeWithGroq(audioBlob)

        if (!success && hasWebSpeech) {
          setError('Groq transcription unavailable. Switch to Web Speech mode for real-time transcription.')
        }
      }
    } else if (activeEngine === 'webspeech') {
      webSpeechRef.current?.stop()
      webSpeechRef.current = null
      setInterimTranscript('')
    }

    const durationMs = Date.now() - sessionStartRef.current
    if (finalTranscript.trim()) {
      const session: STTSession = {
        id: crypto.randomUUID(),
        transcript: cleanForStorage(finalTranscript),
        language: language,
        engine: activeEngine,
        durationMs,
        createdAt: new Date().toISOString(),
        wordCount: finalTranscript.split(/\s+/).filter(Boolean).length,
      }

      const updated = [session, ...sessions].slice(0, MAX_SESSIONS)
      setSessions(updated)
      saveSessions(updated)
    }
  }, [activeEngine, mic, transcribeWithGroq, hasWebSpeech, finalTranscript, language, sessions])

  const pauseListening = useCallback(() => {
    if (activeEngine === 'groq') {
      mic.pauseRecording()
    } else {
      webSpeechRef.current?.stop()
    }
  }, [activeEngine, mic])

  const resumeListening = useCallback(() => {
    if (activeEngine === 'groq') {
      mic.resumeRecording()
    } else {
      const recognition = setupWebSpeech()
      if (recognition) {
        webSpeechRef.current = recognition
        recognition.start()
      }
    }
  }, [activeEngine, mic, setupWebSpeech])

  const clearTranscript = useCallback(() => {
    setFinalTranscript('')
    setInterimTranscript('')
    setLastCommand(null)
    setError(null)
  }, [])

  const appendText = useCallback((text: string) => {
    setFinalTranscript(prev => prev ? `${prev} ${text}` : text)
    setVoiceAddTranscript(text)
  }, [])

  const clearCommand = useCallback(() => setLastCommand(null), [])
  const clearVoiceAdd = useCallback(() => setVoiceAddTranscript(null), [])

  return {
    isListening,
    isPaused: mic.isPaused,
    isProcessing: mic.isProcessing,
    interimTranscript,
    finalTranscript,
    fullTranscript,
    sessions,
    activeEngine,
    detectedLanguage,
    error,
    analyserNode: mic.analyserNode,
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
    voiceAddTranscript,
    clearVoiceAdd,
  }
}
