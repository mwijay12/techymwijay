'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error'

type UseSTTRecorderOptions = {
  language: string
  languageMap: Record<string, string>
  continuous?: boolean
  interimResults?: boolean
  onInterimResult?: (text: string) => void
  onFinalResult?: (text: string) => Promise<void>
  onStatusChange?: (status: RecordingState) => void
  onError?: (error: string) => void
}

type UseSTTRecorderReturn = {
  state: RecordingState
  isSupported: boolean
  isClient: boolean
  start: () => void
  stop: () => void
  interimText: string
  transcribedText: string
  setTranscribedText: (text: string) => void
  recordingDuration: number
  errorMsg: string
  setErrorMsg: (msg: string) => void
  reset: () => void
}

const languageNames: Record<string, string> = {
  'sw': 'Kiswahili', 'en': 'English', 'es': 'Español', 'fr': 'Français',
  'de': 'Deutsch', 'it': 'Italiano', 'pt': 'Português', 'ja': '日本語',
  'zh': '中文', 'ar': 'العربية',
}

export function useSTTRecorder(options: UseSTTRecorderOptions): UseSTTRecorderReturn {
  const {
    language,
    languageMap,
    continuous = true,
    interimResults = true,
    onInterimResult,
    onFinalResult,
    onStatusChange,
    onError,
  } = options

  const [state, setState] = useState<RecordingState>('idle')
  const [interimText, setInterimText] = useState('')
  const [transcribedText, setTranscribedText] = useState('')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [isClient, setIsClient] = useState(false)

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const finalTranscriptRef = useRef('')
  const stateRef = useRef<RecordingState>('idle')

  // Sync state ref
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
    }
  }, [])

  const updateStatus = useCallback((newStatus: RecordingState) => {
    setState(newStatus)
    onStatusChange?.(newStatus)
  }, [onStatusChange])

  const isSpeechSupported = typeof window !== 'undefined' && 
    (typeof (window as any).SpeechRecognition !== 'undefined' || 
     typeof (window as any).webkitSpeechRecognition !== 'undefined')

  const start = useCallback(() => {
    if (!isSpeechSupported) {
      updateStatus('error')
      const msg = 'Speech recognition requires Chrome or Edge browser'
      setErrorMsg(msg)
      onError?.(msg)
      return
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = languageMap[language] || 'sw-TZ'
      recognition.maxAlternatives = 1

      recognitionRef.current = recognition
      finalTranscriptRef.current = ''
      setTranscribedText('')
      setInterimText('')
      setErrorMsg('')

      recognition.onresult = async (event: any) => {
        let interim = ''
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript
          else interim += event.results[i][0].transcript
        }
        if (final) {
          finalTranscriptRef.current += ' ' + final
          const cleanText = finalTranscriptRef.current.trim()
          setTranscribedText(cleanText)
          await onFinalResult?.(cleanText)
        }
        setInterimText(interim)
        onInterimResult?.(interim)
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return
        updateStatus('error')
        const msg = `Hitilafu: ${event.error}. Jaribu tena.`
        setErrorMsg(msg)
        onError?.(msg)
        stop()
      }

      recognition.onend = () => {
        if (finalTranscriptRef.current.trim()) {
          updateStatus('done')
        } else if (stateRef.current === 'recording') {
          updateStatus('idle')
        }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        setRecordingDuration(0)
      }

      recognition.start()
      updateStatus('recording')
      let secs = 0
      timerRef.current = setInterval(() => { secs++; setRecordingDuration(secs) }, 1000)
    } catch {
      updateStatus('error')
      const msg = 'Imeshindwa kuanza. Angalia microphone permissions.'
      setErrorMsg(msg)
      onError?.(msg)
    }
  }, [language, languageMap, continuous, interimResults, isSpeechSupported, onFinalResult, onInterimResult, onError, updateStatus])

  const stop = useCallback(() => {
    if (recognitionRef.current) { try { recognitionRef.current.stop() } catch {} }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setRecordingDuration(0)
    setInterimText('')
    if (finalTranscriptRef.current.trim()) {
      updateStatus('done')
    }
  }, [updateStatus])

  const reset = useCallback(() => {
    setState('idle')
    setTranscribedText('')
    setInterimText('')
    setErrorMsg('')
    finalTranscriptRef.current = ''
    if (recognitionRef.current) { try { recognitionRef.current.abort() } catch {} }
  }, [])

  return {
    state,
    isSupported: isSpeechSupported,
    isClient,
    start,
    stop,
    interimText,
    transcribedText,
    setTranscribedText,
    recordingDuration,
    errorMsg,
    setErrorMsg,
    reset,
  }
}