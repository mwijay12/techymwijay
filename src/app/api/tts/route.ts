import { NextRequest, NextResponse } from 'next/server'
import { SERVER_ENV } from '@/lib/env'
import {
  initPoolState,
  getNextAvailableIndex,
  recordSuccess,
  recordFailure,
} from '@/lib/key-rotation'

declare global {
  // eslint-disable-next-line no-var
  var elevenLabsPoolState: ReturnType<typeof initPoolState> | undefined
}

function getElevenLabsPool(keyCount: number) {
  if (!globalThis.elevenLabsPoolState) {
    globalThis.elevenLabsPoolState = initPoolState('elevenlabs', keyCount)
  }
  return globalThis.elevenLabsPoolState
}

const VALID_VOICE_IDS = new Set([
  '21m00Tcm4TlvDq8ikWAM', // Rachel
  'AZnzlk1XvdvUeBnXmlld', // Domi
  'EXAVITQu4vr4xnSDxMaL', // Bella
  'ErXwobaYiN019PkySvjV', // Antoni
  'MF3mGyEYCl7XYWbV9V6O', // Elli
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'VR6AewLTigWG4xSOukaG', // Arnold
  'pNInz6obpgDQGcFmaJgB', // Adam
  'yoZ06aMxZJJ28mfd3POQ', // Sam
])

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
const MAX_TEXT_LENGTH = 5000
const ELEVENLABS_MODEL = 'eleven_multilingual_v2'

const ttsRequests = new Map<string, { count: number; resetAt: number }>()
const TTS_RATE_LIMIT = 10

function isTTSRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ttsRequests.get(ip)
  if (!entry || now > entry.resetAt) {
    ttsRequests.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= TTS_RATE_LIMIT) return true
  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'

    if (isTTSRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before generating speech.' },
        { status: 429 }
      )
    }

    if (SERVER_ENV.elevenLabsKeys.length === 0) {
      return NextResponse.json(
        {
          error: 'USE_BROWSER_TTS_FALLBACK',
          message: 'No ElevenLabs keys configured — use browser speech synthesis',
        },
        { status: 503 }
      )
    }

    const body = await request.json() as {
      text?: string
      voiceId?: string
      speed?: number
      stability?: number
      similarityBoost?: number
    }

    if (!body.text?.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const text = body.text.trim().slice(0, MAX_TEXT_LENGTH)
    const voiceId = VALID_VOICE_IDS.has(body.voiceId ?? '')
      ? body.voiceId!
      : DEFAULT_VOICE_ID
    const speed = Math.max(0.25, Math.min(4.0, body.speed ?? 1.0))
    const stability = Math.max(0, Math.min(1, body.stability ?? 0.5))
    const similarityBoost = Math.max(0, Math.min(1, body.similarityBoost ?? 0.75))

    const pool = getElevenLabsPool(SERVER_ENV.elevenLabsKeys.length)
    let lastError: Error | null = null

    for (
      let attempt = 0;
      attempt < Math.min(3, SERVER_ENV.elevenLabsKeys.length);
      attempt++
    ) {
      const keyIndex = getNextAvailableIndex(pool)
      if (keyIndex === -1) break

      const apiKey = SERVER_ENV.elevenLabsKeys[keyIndex]

      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
            },
            body: JSON.stringify({
              text,
              model_id: ELEVENLABS_MODEL,
              voice_settings: {
                stability,
                similarity_boost: similarityBoost,
                speed,
              },
            }),
          }
        )

        if (!response.ok) {
          const errBody = await response.text()
          if (response.status === 401 || response.status === 429) {
            const failState = recordFailure(pool, keyIndex)
            Object.assign(pool, failState)
            lastError = new Error(`ElevenLabs key[${keyIndex}] quota exceeded`)
            continue
          }

          throw new Error(`ElevenLabs API error ${response.status}: ${errBody}`)
        }

        const audioBuffer = await response.arrayBuffer()
        const successState = recordSuccess(pool, keyIndex)
        Object.assign(pool, successState)

        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': String(audioBuffer.byteLength),
            'X-Voice-Id': voiceId,
            'X-Key-Index': String(keyIndex),
            'X-Chars-Used': String(text.length),
            'X-Model': ELEVENLABS_MODEL,
          },
        })
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        const failState = recordFailure(pool, keyIndex)
        Object.assign(pool, failState)
      }
    }

    return NextResponse.json(
      {
        error: 'USE_BROWSER_TTS_FALLBACK',
        message: 'ElevenLabs unavailable — using browser speech synthesis',
        elevenLabsError: lastError?.message,
      },
      { status: 503 }
    )
  } catch (err) {
    return NextResponse.json(
      {
        error: 'USE_BROWSER_TTS_FALLBACK',
        message: 'TTS service error — using browser fallback',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/tts',
    engine: 'elevenlabs-multilingual-v2',
    keysAvailable: SERVER_ENV.elevenLabsKeys.length,
    totalCharQuota: SERVER_ENV.elevenLabsKeys.length * 10_000,
    maxTextLength: MAX_TEXT_LENGTH,
    defaultVoice: 'Rachel',
    model: ELEVENLABS_MODEL,
    timestamp: new Date().toISOString(),
  })
}
