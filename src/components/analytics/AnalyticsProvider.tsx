'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initAnalytics, trackPageView, identifyUser, track, ANALYTICS_EVENTS } from '@/lib/analytics'
import { initErrorTracking } from '@/lib/error-tracking'
import { useAuth } from '@/components/auth/AuthProvider'

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    initAnalytics()
    initErrorTracking()

    if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
      track(ANALYTICS_EVENTS.ELECTRON_OPENED, {
        platform: (window as any).electronAPI.platform ?? 'unknown',
      })
    }
  }, [])

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  useEffect(() => {
    if (user?.uid) {
      identifyUser(user.uid)
    }
  }, [user?.uid])

  return <>{children}</>
}
