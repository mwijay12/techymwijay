'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

/**
 * useRequireAuth — redirects to /signin if user is not authenticated.
 * Use this in protected pages.
 */
export function useRequireAuth(redirectTo: string = '/signin') {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAuthenticated)) {
      router.push(redirectTo)
    }
  }, [user, isAuthenticated, loading, router, redirectTo])

  return { user, loading, isAuthenticated }
}

/**
 * useOptionalAuth — returns user without redirecting.
 * Use this in pages that work both logged in and logged out.
 */
export function useOptionalAuth() {
  const { user, isAuthenticated, isAnonymous, loading, signInWithGoogle, signOut } = useAuth()
  return { user, isAuthenticated, isAnonymous, loading, signInWithGoogle, signOut }
}

// Re-export useAuth for convenience
export { useAuth } from '@/components/auth/AuthProvider'
