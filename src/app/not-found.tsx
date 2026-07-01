'use client'

import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

/**
 * Custom 404 page that matches the app's branding.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-500/10 mb-6">
          <FileQuestion className="w-10 h-10 text-purple-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Page not found
        </h1>

        <p className="text-gray-400 mb-2">
          This page doesn't exist or has been moved.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          If you typed the URL, check the spelling. If you followed a link,
          it might be outdated.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/25"
        >
          <Home className="w-4 h-4" />
          Back home
        </Link>
      </div>
    </div>
  )
}