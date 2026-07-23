'use client'

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { useAppSettings } from '@/hooks/use-app-settings'

export type TTSEngine = 'elevenlabs' | 'browser' | 'detecting'
export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface TTSVoice {
  id: string
  name: string
  engine: 'elevenlabs' | 'browser'
  gender?: 'male' | 'female'
  accent?: string
  previewText?: string
}

export interface TTSQuota {
  keyIndex: number
  charsUsed: number
  charsLimit: number
  resetDate: string
}

export const PUTER_DEFAULT_VOICE: TTSVoice = {
  id: 'puter-default',
  name: 'Puter.js / Free Web Engine (Default)',
  engine: 'browser',
  gender: 'female',
  accent: 'Swahili / English (Free & Unlimited)',
  previewText: 'Jambo! Mimi ni sauti ya bure ya Puter.js / Web Engine.',
}

export const ELEVENLABS_VOICES: TTSVoice[] = [
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    engine: 'elevenlabs',
    gender: 'female',
    accent: 'American',
    previewText: 'Habari! My name is Rachel.',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    engine: 'elevenlabs',
    gender: 'female',
    accent: 'American',
    previewText: 'Hello! I am Domi, nice to meet you.',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    engine: 'elevenlabs',
    gender: 'female',
    accent: 'American',
    previewText: 'Karibu! I am Bella.',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    engine: 'elevenlabs',
    gender: 'male',
    accent: 'American',
    previewText: 'Jambo! I am Antoni.',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    engine: 'elevenlabs',
    gender: 'male',
    accent: 'American',
    previewText: 'Sawa, my name is Josh.',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    engine: 'elevenlabs',
    gender: 'male',
    accent: 'American',
    previewText: 'Hello, I am Adam. Asante.',
  },
]

const getQuotaKey = (keyIndex: number) => `mwijay_tts_quota_${keyIndex}`

function getNextResetDate(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return next.toISOString()
}

function loadQuota(keyIndex: number): TTSQuota {
  if (typeof window === 'undefined') {
    return {
      keyIndex,
      charsUsed: 0,
      charsLimit: 10_000,
      resetDate: getNextResetDate(),
    }
  }
  try {
    const raw = localStorage.getItem(getQuotaKey(keyIndex))
    if (!raw) {
      return {
        keyIndex,
        charsUsed: 0,
        charsLimit: 10_000,
        resetDate: getNextResetDate(),
      }
    }
    const quota: TTSQuota = JSON.parse(raw)
    if (new Date(quota.resetDate) <= new Date()) {
      return {
        keyIndex,
        charsUsed: 0,
        charsLimit: 10_000,
        resetDate: getNextResetDate(),
      }
    }
    return quota
  } catch {
    return {
      keyIndex,
      charsUsed: 0,
      charsLimit: 10_000,
      resetDate: getNextResetDate(),
    }
  }
}

function saveQuota(quota: TTSQuota): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getQuotaKey(quota.keyIndex), JSON.stringify(quota))
  } catch {}
}

function trackCharsUsed(keyIndex: number, charsUsed: number): void {
  const quota = loadQuota(keyIndex)
  saveQuota({ ...quota, charsUsed: quota.charsUsed + charsUsed })
}

function chunkText(text: string, maxLength: number = 4800): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }

    const slice = remaining.slice(0, maxLength)
    const lastPeriod = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('\n')
    )

    if (lastPeriod > maxLength * 0.5) {
      chunks.push(remaining.slice(0, lastPeriod + 1).trim())
      remaining = remaining.slice(lastPeriod + 1).trim()
    } else {
      const lastSpace = slice.lastIndexOf(' ')
      const splitAt = lastSpace > maxLength * 0.5 ? lastSpace : maxLength
      chunks.push(remaining.slice(0, splitAt).trim())
      remaining = remaining.slice(splitAt).trim()
    }
  }

  return chunks.filter(c => c.length > 0)
}

interface UseTTSReturn {
  playbackState: PlaybackState
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  activeEngine: TTSEngine
  error: string | null
  currentChunk: number
  totalChunks: number
  progress: number

  selectedVoice: TTSVoice
  availableVoices: TTSVoice[]
  browserVoices: SpeechSynthesisVoice[]
  setVoice: (voice: TTSVoice) => void

  speed: number
  setSpeed: (speed: number) => void
  pitch: number
  setPitch: (pitch: number) => void

  totalCharsAvailable: number
  totalCharsUsed: number

  speak: (text: string) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  previewVoice: (voice: TTSVoice) => void
  downloadAudio: (text: string) => Promise<void>
}

export function useTTS(): UseTTSReturn {
  const { settings, updateSettings } = useAppSettings()

  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [activeEngine, setActiveEngine] = useState<TTSEngine>('detecting')
  const [error, setError] = useState<string | null>(null)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [totalChunks, setTotalChunks] = useState(1)
  const [progress, setProgress] = useState(0)
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])

  const [speed, setSpeedState] = useState(settings.voice.ttsSpeed || 1.0)
  const [pitch, setPitchState] = useState(settings.voice.ttsPitch || 1.0)
  const [selectedVoice, setSelectedVoiceState] = useState<TTSVoice>(
    PUTER_DEFAULT_VOICE
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const chunksRef = useRef<string[]>([])
  const isStoppedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() ?? []
      const filtered = voices.filter(v =>
        v.lang.startsWith('sw') ||
        v.lang.startsWith('en') ||
        v.lang.startsWith('en-')
      )
      setBrowserVoices(filtered)
    }

    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s)
    updateSettings({ voice: { ...settings.voice, ttsSpeed: s } })
  }, [settings.voice, updateSettings])

  const setPitch = useCallback((p: number) => {
    setPitchState(p)
    updateSettings({ voice: { ...settings.voice, ttsPitch: p } })
  }, [settings.voice, updateSettings])

  const setVoice = useCallback((voice: TTSVoice) => {
    setSelectedVoiceState(voice)
    if (voice.engine === 'elevenlabs') {
      updateSettings({
        voice: { ...settings.voice, ttsVoiceId: voice.id },
      })
    }
  }, [settings.voice, updateSettings])

  const getAvailableVoices = useCallback((): TTSVoice[] => {
    const elVoices = ELEVENLABS_VOICES
    const bVoices: TTSVoice[] = browserVoices.map(v => ({
      id: v.name,
      name: v.name,
      engine: 'browser' as const,
      accent: v.lang,
    }))
    return [PUTER_DEFAULT_VOICE, ...bVoices, ...elVoices]
  }, [browserVoices])

  const speakWithElevenLabs = useCallback(
    async (text: string, voiceId: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceId,
            speed,
            stability: 0.5,
            similarityBoost: 0.75,
          }),
        })

        const contentType = response.headers.get('Content-Type') ?? ''

        if (!response.ok || contentType.includes('application/json')) {
          const data = await response.json()
          if (data.error === 'USE_BROWSER_TTS_FALLBACK') {
            return false
          }
          throw new Error(data.error ?? 'TTS request failed')
        }

        const keyIndex = parseInt(response.headers.get('X-Key-Index') ?? '0')
        const charsUsed = parseInt(response.headers.get('X-Chars-Used') ?? '0')

        if (charsUsed > 0) {
          trackCharsUsed(keyIndex, charsUsed)
        }

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        return new Promise((resolve, reject) => {
          const audio = new Audio(audioUrl)
          audioRef.current = audio

          audio.playbackRate = speed
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve(true)
          }
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl)
            reject(new Error('Audio playback error'))
          }
          audio.play().catch(reject)
          setActiveEngine('elevenlabs')
          setPlaybackState('playing')
        })
      } catch (err) {
        return false
      }
    },
    [speed]
  )

  const speakWithBrowser = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          reject(new Error('SpeechSynthesis not supported'))
          return
        }

        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utteranceRef.current = utterance

        if (selectedVoice.engine === 'browser' && browserVoices.length > 0) {
          const found = browserVoices.find(v => v.name === selectedVoice.id)
          if (found) utterance.voice = found
        } else {
          const swVoice = browserVoices.find(v => v.lang.startsWith('sw'))
          const enVoice = browserVoices.find(v => v.lang.startsWith('en'))
          utterance.voice = swVoice ?? enVoice ?? null
        }

        utterance.rate = speed
        utterance.pitch = pitch
        utterance.volume = 1.0
        utterance.lang = 'sw-KE'

        utterance.onstart = () => {
          setActiveEngine('browser')
          setPlaybackState('playing')
        }

        utterance.onend = () => resolve()
        utterance.onerror = (e) => {
          if (e.error === 'interrupted') {
            resolve()
          } else {
            reject(new Error(`Speech synthesis error: ${e.error}`))
          }
        }

        window.speechSynthesis.speak(utterance)
      })
    },
    [selectedVoice, browserVoices, speed, pitch]
  )

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      setError(null)
      isStoppedRef.current = false
      setPlaybackState('loading')

      const chunks = chunkText(text)
      chunksRef.current = chunks
      setTotalChunks(chunks.length)
      setCurrentChunk(0)

      try {
        for (let i = 0; i < chunks.length; i++) {
          if (isStoppedRef.current) break

          setCurrentChunk(i + 1)
          setProgress(Math.round(((i) / chunks.length) * 100))

          const chunk = chunks[i]

          if (selectedVoice.engine === 'elevenlabs') {
            const success = await speakWithElevenLabs(chunk, selectedVoice.id)
            if (!success) {
              await speakWithBrowser(chunk)
            }
          } else {
            await speakWithBrowser(chunk)
          }
        }

        setProgress(100)
        setPlaybackState('idle')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'TTS failed'
        setError(msg)
        setPlaybackState('error')
      }
    },
    [selectedVoice, speakWithElevenLabs, speakWithBrowser]
  )

  const pause = useCallback(() => {
    if (activeEngine === 'elevenlabs') {
      audioRef.current?.pause()
    } else if (typeof window !== 'undefined') {
      window.speechSynthesis?.pause()
    }
    setPlaybackState('paused')
  }, [activeEngine])

  const resume = useCallback(() => {
    if (activeEngine === 'elevenlabs') {
      audioRef.current?.play()
    } else if (typeof window !== 'undefined') {
      window.speechSynthesis?.resume()
    }
    setPlaybackState('playing')
  }, [activeEngine])

  const stop = useCallback(() => {
    isStoppedRef.current = true

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    if (utteranceRef.current && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel()
      utteranceRef.current = null
    }

    setPlaybackState('idle')
    setProgress(0)
    setCurrentChunk(0)
  }, [])

  const previewVoice = useCallback(
    async (voice: TTSVoice) => {
      const previewText = voice.previewText ?? 'Habari! This is a voice preview. Asante.'
      stop()

      const prevVoice = selectedVoice
      setSelectedVoiceState(voice)

      if (voice.engine === 'elevenlabs') {
        const success = await speakWithElevenLabs(previewText, voice.id)
        if (!success) {
          await speakWithBrowser(previewText)
        }
      } else {
        await speakWithBrowser(previewText)
      }

      setSelectedVoiceState(prevVoice)
    },
    [selectedVoice, stop, speakWithElevenLabs, speakWithBrowser]
  )

  const downloadAudio = useCallback(
    async (text: string) => {
      if (!text.trim()) return
      setPlaybackState('loading')

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.slice(0, 5000),
            voiceId: selectedVoice.engine === 'elevenlabs' ? selectedVoice.id : ELEVENLABS_VOICES[0].id,
            speed,
          }),
        })

        if (!response.ok) {
          throw new Error('Download failed — no ElevenLabs access')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mwijay-speech-${Date.now()}.mp3`
        a.click()
        URL.revokeObjectURL(url)
        setPlaybackState('idle')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Download failed')
        setPlaybackState('error')
      }
    },
    [selectedVoice, speed]
  )

  let totalCharsUsed = 0
  for (let i = 0; i < 17; i++) {
    totalCharsUsed += loadQuota(i).charsUsed
  }

  return {
    playbackState,
    isPlaying: playbackState === 'playing',
    isPaused: playbackState === 'paused',
    isLoading: playbackState === 'loading',
    activeEngine,
    error,
    currentChunk,
    totalChunks,
    progress,
    selectedVoice,
    availableVoices: getAvailableVoices(),
    browserVoices,
    setVoice,
    speed,
    setSpeed,
    pitch,
    setPitch,
    totalCharsAvailable: 17 * 10_000,
    totalCharsUsed,
    speak,
    pause,
    resume,
    stop,
    previewVoice,
    downloadAudio,
  }
}
