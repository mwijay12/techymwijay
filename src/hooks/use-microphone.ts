'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type MicrophoneState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'error'

export interface AudioChunk {
  blob: Blob
  timestamp: number
  durationMs: number
}

interface UseMicrophoneReturn {
  state: MicrophoneState
  isRecording: boolean
  isPaused: boolean
  isProcessing: boolean
  error: string | null
  audioChunks: AudioChunk[]
  analyserNode: AnalyserNode | null

  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  pauseRecording: () => void
  resumeRecording: () => void
  clearRecording: () => void
  requestPermission: () => Promise<boolean>
}

export function useMicrophone(): UseMicrophoneReturn {
  const [state, setState] = useState<MicrophoneState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([])
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingStartRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close()
      audioContextRef.current = null
    }
    setAnalyserNode(null)
  }

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      })
      stream.getTracks().forEach(t => t.stop())
      setState('idle')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied'
      setError(
        message.includes('Permission denied') || message.includes('NotAllowedError')
          ? 'Microphone permission denied. Please allow access in your browser settings.'
          : `Microphone error: ${message}`
      )
      setState('error')
      return false
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setState('requesting')
    chunksRef.current = []
    setAudioChunks([])

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      })

      streamRef.current = stream

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      setAnalyserNode(analyser)

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      )
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.start(3000)
      recordingStartRef.current = Date.now()
      setState('recording')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording'
      setError(
        message.includes('Permission') || message.includes('NotAllowed')
          ? 'Ruhusa ya microphone ilikataliwa. Tafadhali ruhusu access.'
          : `Recording error: ${message}`
      )
      setState('error')
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      setState('idle')
      return null
    }

    setState('processing')

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const durationMs = Date.now() - recordingStartRef.current
        const mimeType = recorder.mimeType || 'audio/webm'
        const fullBlob = new Blob(chunksRef.current, { type: mimeType })

        const chunk: AudioChunk = {
          blob: fullBlob,
          timestamp: recordingStartRef.current,
          durationMs,
        }

        setAudioChunks(prev => [chunk, ...prev])
        stopStream()
        setState('idle')
        resolve(fullBlob)
      }

      recorder.stop()
    })
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setState('paused')
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setState('recording')
    }
  }, [])

  const clearRecording = useCallback(() => {
    chunksRef.current = []
    setAudioChunks([])
    setState('idle')
    setError(null)
  }, [])

  return {
    state,
    isRecording: state === 'recording',
    isPaused: state === 'paused',
    isProcessing: state === 'processing',
    error,
    audioChunks,
    analyserNode,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    requestPermission,
  }
}
