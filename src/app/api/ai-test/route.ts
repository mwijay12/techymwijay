/**
 * AI Test API Route (Development Only)
 *
 * Allows testing the AI engine rotation from the browser or curl.
 * Protected — only available in development mode.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { prompt = 'Say hello in one sentence.', provider } = body

    // Dynamic import to avoid SSR issues with client adapters
    const { aiPrompt } = await import('@/lib/ai-engine')

    const result = await aiPrompt(prompt, undefined, {
      forceProvider: provider,
      maxTokens: 100,
    })

    return NextResponse.json({
      success: true,
      provider: result.provider,
      model: result.model,
      text: result.text,
      latencyMs: result.latencyMs,
      attemptedProviders: result.attemptedProviders,
      fallbackUsed: result.fallbackUsed,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}