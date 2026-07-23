import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import {
  initPoolState,
  getNextAvailableIndex,
  recordSuccess,
  recordFailure,
} from '@/lib/key-rotation'
import { SERVER_ENV } from '@/lib/env'

const SUPPORTED_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
]

const VALID_LANGUAGES = ['sw', 'en', 'auto', 'sw-en']

const sttRequests = new Map<string, { count: number; resetAt: number }>()
const STT_RATE_LIMIT = 20

function isSTTRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = sttRequests.get(ip)
  if (!entry || now > entry.resetAt) {
    sttRequests.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= STT_RATE_LIMIT) return true
  entry.count++
  return false
}

declare global {
  // eslint-disable-next-line no-var
  var groqSTTPoolState: ReturnType<typeof initPoolState> | undefined
}

function getSTTPoolState(keyCount: number) {
  if (!globalThis.groqSTTPoolState) {
    globalThis.groqSTTPoolState = initPoolState('groq_stt', keyCount)
  }
  return globalThis.groqSTTPoolState
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/flac': 'flac',
  }
  const base = mimeType.split(';')[0]
  return map[base] ?? 'webm'
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'

    if (isSTTRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before transcribing again.' },
        { status: 429 }
      )
    }

    if (SERVER_ENV.groqKeys.length === 0) {
      return NextResponse.json(
        {
          error: 'USE_WEB_SPEECH_FALLBACK',
          message: 'No Groq keys configured — use Web Speech API',
        },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const language = (formData.get('language') as string) || 'auto'
    const prompt = (formData.get('prompt') as string) || ''

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    const mimeType = audioFile.type || 'audio/webm'
    const whisperLanguage = VALID_LANGUAGES.includes(language)
      ? language === 'auto' || language === 'sw-en'
        ? undefined
        : language
      : undefined

    const poolState = getSTTPoolState(SERVER_ENV.groqKeys.length)
    let lastError: Error | null = null

    for (let attempt = 0; attempt < Math.min(3, SERVER_ENV.groqKeys.length); attempt++) {
      const keyIndex = getNextAvailableIndex(poolState)
      if (keyIndex === -1) break

      const apiKey = SERVER_ENV.groqKeys[keyIndex]

      try {
        const client = new Groq({ apiKey })

        const audioBuffer = await audioFile.arrayBuffer()
        const audioBlob = new Blob([audioBuffer], { type: mimeType })
        const audioFileForAPI = new File(
          [audioBlob],
          `audio.${getExtension(mimeType)}`,
          { type: mimeType }
        )

        const transcription = await client.audio.transcriptions.create({
          file: audioFileForAPI,
          model: 'whisper-large-v3',
          language: whisperLanguage,
          response_format: 'json',
          prompt: prompt ||
            'This is a Swahili-English mixed speech recording from Tanzania. ' +
            'The speaker may switch between Swahili and English naturally. ' +
            'Common words: sawa, asante, habari, ndiyo, hapana, karibu, ' +
            'poa, fiti, maisha, kazi, shule, chuo, pesa.',
        })

        const successState = recordSuccess(poolState, keyIndex)
        Object.assign(poolState, successState)

        const text = transcription.text?.trim() ?? ''

        return NextResponse.json({
          text,
          language: whisperLanguage ?? 'auto',
          model: 'whisper-large-v3',
          provider: 'groq',
          keyIndex,
        })
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        const failState = recordFailure(poolState, keyIndex)
        Object.assign(poolState, failState)
      }
    }

    return NextResponse.json(
      {
        error: 'USE_WEB_SPEECH_FALLBACK',
        message: 'Groq unavailable — using browser speech recognition',
        groqError: lastError?.message,
      },
      { status: 503 }
    )
  } catch (err) {
    return NextResponse.json(
      {
        error: 'USE_WEB_SPEECH_FALLBACK',
        message: 'STT service error — using browser fallback',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/stt',
    engine: 'groq-whisper-large-v3',
    keysAvailable: SERVER_ENV.groqKeys.length,
    supportedLanguages: ['sw', 'en', 'auto'],
    maxFileSizeMB: 25,
    timestamp: new Date().toISOString(),
  })
}
