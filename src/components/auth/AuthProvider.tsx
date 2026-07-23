'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  linkWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'
import { upsertUserProfile } from '@/lib/user-service'
import type { UserProfile } from '@/types/user'

const isElectron = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    (window.navigator.userAgent.includes('Electron') ||
      process.env.NEXT_PUBLIC_IS_ELECTRON === 'true')
  )
}

export interface AuthContextType {
  user: UserProfile | null
  firebaseUser: User | null
  loading: boolean
  isAuthenticated: boolean
  isAnonymous: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => void
  upgradeAnonymousToGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAuthenticated: false,
  isAnonymous: true,
  error: null,
  signInWithGoogle: async () => {},
  signInAsGuest: () => {},
  upgradeAnonymousToGoogle: async () => {},
  signOut: async () => {},
  clearError: () => {},
})

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

const DEFAULT_GUEST_USER: UserProfile = {
  uid: 'guest-davie-mwijay',
  email: 'davie@mwijaytech.app',
  displayName: 'Davie Mwijay (Guest)',
  photoURL: '',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  preferences: {
    language: 'sw-en',
    currency: 'TZS',
    theme: 'dark',
    ttsVoiceId: '',
    defaultAIModel: 'gpt-4o-mini',
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const profile = await upsertUserProfile(result.user)
          setUser(profile)
        }
      })
      .catch((err) => {
        console.warn('Redirect result error:', err.message)
      })
  }, [])

  useEffect(() => {
    // Safety timeout: never stay in loading state for more than 1.5s
    const safetyTimer = setTimeout(() => {
      setUser(prev => prev ?? DEFAULT_GUEST_USER)
      setLoading(false)
    }, 1500)

    if (!isFirebaseConfigured || !auth) {
      setUser(DEFAULT_GUEST_USER)
      setLoading(false)
      clearTimeout(safetyTimer)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        try {
          const profile = await upsertUserProfile(fbUser)
          setUser(profile)
        } catch (err) {
          console.warn('Failed to load user profile:', err)
          setUser({
            uid: fbUser.uid,
            email: fbUser.email ?? 'davie@mwijaytech.app',
            displayName: fbUser.displayName ?? 'Davie Mwijay',
            photoURL: fbUser.photoURL ?? '',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            preferences: {
              language: 'sw-en',
              currency: 'TZS',
              theme: 'dark',
              ttsVoiceId: '',
              defaultAIModel: 'gpt-4o-mini',
            },
          })
        }
      } else {
        if (auth) {
          try {
            await signInAnonymously(auth)
          } catch (err) {
            console.warn('[Auth] Anonymous sign-in failed:', err)
            setUser(DEFAULT_GUEST_USER)
          }
        } else {
          setUser(DEFAULT_GUEST_USER)
        }
      }

      setLoading(false)
    })

    return () => {
      clearTimeout(safetyTimer)
      unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return
    setError(null)

    try {
      if (isElectron()) {
        await signInWithRedirect(auth, googleProvider)
      } else {
        const result = await signInWithPopup(auth, googleProvider)
        const profile = await upsertUserProfile(result.user)
        setUser(profile)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed'
      if (!message.includes('popup-closed-by-user')) {
        setError('Sign-in failed. Please try again.')
        console.warn('Google sign-in error:', message)
      }
    }
  }, [])

  const upgradeAnonymousToGoogle = useCallback(async () => {
    if (!auth?.currentUser) return
    try {
      setError(null)
      const result = await linkWithPopup(auth.currentUser, googleProvider)
      const profile = await upsertUserProfile(result.user)
      setUser(profile)
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === 'auth/credential-already-in-use') {
        const result = await signInWithPopup(auth, googleProvider)
        const profile = await upsertUserProfile(result.user)
        setUser(profile)
      } else {
        const message = err instanceof Error ? err.message : 'Account upgrade failed'
        setError(message)
      }
    }
  }, [])

  const signInAsGuest = useCallback(() => {
    setUser(DEFAULT_GUEST_USER)
    setError(null)
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) {
      setUser(null)
      return
    }
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setFirebaseUser(null)
    } catch (err) {
      console.warn('Sign-out error:', err)
      setUser(null)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAuthenticated: !!user && !firebaseUser?.isAnonymous,
        isAnonymous: firebaseUser?.isAnonymous ?? true,
        error,
        signInWithGoogle,
        signInAsGuest,
        upgradeAnonymousToGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
