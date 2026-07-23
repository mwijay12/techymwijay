import { NextResponse } from 'next/server'
import { getKeyPoolSummary } from '@/lib/env'

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  const summary = getKeyPoolSummary()

  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    providers: isDev
      ? summary
      : {
          total: summary.total,
          configured: Object.values(summary).filter(v => v > 0).length,
        },
    timestamp: new Date().toISOString(),
  })
}
