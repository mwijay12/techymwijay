'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global error page (Next.js App Router).
 * Shown when a route segment fails to render.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 mb-6">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          An unexpected error occurred. This might be a temporary issue —
          try reloading the page.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-xl border border-white/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back home
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 font-mono">
              Error details
            </summary>
            <pre className="mt-2 p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-red-300 overflow-auto max-h-48 leading-relaxed">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}