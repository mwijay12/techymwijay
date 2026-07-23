/**
 * Error Tracking — Sentry Wrapper
 * Captures unhandled errors and performance issues.
 * Safe client-side wrapper.
 */

import type React from 'react'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? ''

let isInitialized = false

export async function initErrorTracking(): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !SENTRY_DSN ||
    isInitialized
  ) return

  if (process.env.NODE_ENV === 'development') {
    return
  }

  try {
    if ((window as any).Sentry) {
      (window as any).Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV,
      })
      isInitialized = true
    }
  } catch (err) {
    // Sentry is optional — silent fallback
  }
}

export function captureError(
  error: Error,
  context?: Record<string, string | number>
): void {
  if (!isInitialized) {
    console.error('[Error]', error.message, context)
    return
  }

  try {
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context })
    }
  } catch {}
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!isInitialized) return

  try {
    if ((window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, level)
    }
  } catch {}
}
