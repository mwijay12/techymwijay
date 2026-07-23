import { NextRequest, NextResponse } from 'next/server'
import { callAI, buildMwijaySystemPrompt } from '@/lib/ai-client'
import type { AIMessage, AIProvider } from '@/types/ai'

const requestCounts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = requestCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT) return true

  entry.count++
  return false
}

interface ChatRequest {
  messages: AIMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  preferredProvider?: AIProvider
  userContext?: {
    name?: string
    language?: string
    timezone?: string
    memoryContext?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      )
    }

    const body: ChatRequest = await request.json()

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      )
    }

    if (body.messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array cannot be empty' },
        { status: 400 }
      )
    }

    const sanitizedMessages: AIMessage[] = body.messages
      .slice(-20)
      .filter(m => m.content && m.content.trim().length > 0)
      .map(m => ({
        id: m.id ?? crypto.randomUUID(),
        role: (['user', 'assistant', 'system'].includes(m.role)
          ? m.role
          : 'user') as AIMessage['role'],
        content: m.content.trim().slice(0, 4000),
        timestamp: m.timestamp ?? new Date().toISOString(),
      }))

    const systemPrompt =
      body.systemPrompt ?? buildMwijaySystemPrompt(body.userContext)

    const response = await callAI({
      messages: sanitizedMessages,
      model: body.model,
      maxTokens: Math.min(body.maxTokens ?? 2048, 4096),
      temperature: Math.max(0, Math.min(body.temperature ?? 0.7, 2)),
      systemPrompt,
      preferredProvider: body.preferredProvider,
    })

    return NextResponse.json({
      content: response.content,
      provider: response.provider,
      model: response.model,
      latencyMs: response.latencyMs,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (message.startsWith('USE_PUTER_FALLBACK:')) {
      return NextResponse.json(
        { error: message, usePuterFallback: true },
        { status: 503 }
      )
    }

    console.error('[API/ai/chat] Error:', message)
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/ai/chat',
    timestamp: new Date().toISOString(),
  })
}
