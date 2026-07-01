import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

/**
 * Health check endpoint.
 * Returns runtime diagnostics for monitoring and debugging.
 *
 * GET /api/health
 */
export async function GET() {
  const pkg = require('../../../../package.json')

  const health = {
    status: 'ok',
    app: {
      name: pkg.name || 'Mwijay AI Voice Studio',
      version: pkg.version || '1.0.0',
      description: pkg.description || '',
    },
    runtime: {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    },
    firebase: {
      configured: env.firebase.isConfigured,
      projectId: env.firebase.projectId || null,
    },
    electron: {
      expected: true,
      note: 'Electron support is configured in package.json',
    },
    ai: {
      defaultProvider: env.ai.defaultProvider,
      defaultModel: env.ai.defaultModel,
      usePuter: env.ai.usePuter,
    },
  }

  return NextResponse.json(health, { status: 200 })
}