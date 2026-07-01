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
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  linkWithPopup,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'

export type AuthUser = {
  uid: string
  isAnonymous: boolean
  displayName: string | null
  email: string | null
  photoURL: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  isAnonymous: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  upgradeAnonymousToGoogle: () => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        // No user — sign in anonymously automatically
        // This gives every user a stable UID with zero friction
        try {
          await signInAnonymously(auth!)
        } catch (err) {
          console.warn('[Auth] Anonymous sign-in failed:', err)
          setLoading(false)
        }
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(message)
    }
  }, [])

  // Upgrade anonymous account to Google without losing data
  // The UID stays the same — all Firestore data is preserved
  const upgradeAnonymousToGoogle = useCallback(async () => {
    if (!auth?.currentUser) return
    try {
      setError(null)
      await linkWithPopup(auth.currentUser, googleProvider)
    } catch (err: unknown) {
      // If account already exists, fall back to regular sign-in
      if ((err as { code?: string })?.code === 'auth/credential-already-in-use') {
        await signInWithPopup(auth, googleProvider)
      } else {
        const message = err instanceof Error ? err.message : 'Account upgrade failed'
        setError(message)
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
    // Re-trigger anonymous sign-in via onAuthStateChanged
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAnonymous: user?.isAnonymous ?? true,
        signInWithGoogle,
        signOut,
        upgradeAnonymousToGoogle,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}