'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseShortcutsOptions {
  enabled?: boolean
  onShowHelp?: () => void
}

export function useShortcuts({
  enabled = true,
  onShowHelp,
}: UseShortcutsOptions = {}) {
  const router = useRouter()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      const target = e.target as HTMLElement
      const isInInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      if (e.key === '?' && shift && !ctrl) {
        e.preventDefault()
        onShowHelp?.()
        return
      }

      if (isInInput) return

      if (ctrl && !shift) {
        const routeMap: Record<string, string> = {
          '1': '/',
          '2': '/ai-stt',
          '3': '/ai-tts',
          '4': '/blog',
          '5': '/spending',
          '6': '/todos',
          '7': '/meeting',
          '8': '/memory',
          ',': '/settings',
        }

        if (routeMap[e.key]) {
          e.preventDefault()
          router.push(routeMap[e.key])
          return
        }
      }

      if (e.key === 'Escape') {
        ;(document.activeElement as HTMLElement)?.blur?.()
        return
      }

      if (e.key === '/' && !ctrl) {
        const searchInput = document.querySelector<HTMLInputElement>(
          '[placeholder*="Search"]'
        )
        if (searchInput) {
          e.preventDefault()
          searchInput.focus()
        }
      }
    },
    [enabled, onShowHelp, router]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
