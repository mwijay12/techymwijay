'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/signin',
}: ProtectedRouteProps) {
  const { user, loading, signInAsGuest } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Safety timer to prevent being stuck on "Checking authentication..."
    const timer = setTimeout(() => {
      if (!user) {
        signInAsGuest()
      }
    }, 1000)

    if (!loading && !user) {
      router.push(redirectTo)
    }

    return () => clearTimeout(timer)
  }, [user, loading, router, redirectTo, signInAsGuest])

  if (loading && !user) {
    return fallback ?? <LoadingSkeleton message="Checking authentication..." />
  }

  return <>{children}</>
}
