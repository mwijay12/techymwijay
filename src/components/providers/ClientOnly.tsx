'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  /** Optional fallback to show while mounting */
  fallback?: ReactNode
}

/**
 * Wraps content that should only render on the client.
 * Prevents hydration mismatches by deferring rendering to the mount phase.
 *
 * @example
 * ```tsx
 * <ClientOnly fallback={<div className="h-96" />}>
 *   <SplineScene />
 * </ClientOnly>
 * ```
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{fallback}</>
  return <>{children}</>
}