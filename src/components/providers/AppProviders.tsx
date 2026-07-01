'use client'

import { ReactNode } from 'react'
import AppErrorBoundary from './AppErrorBoundary'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * Global application providers wrapper.
 *
 * Place all global context providers here as the app grows:
 * - Error boundary (active)
 * - Auth context (future)
 * - Theme provider (future)
 * - Analytics provider (future)
 */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppErrorBoundary>
      {children}
    </AppErrorBoundary>
  )
}