import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile, UserPreferences } from '@/types/user'

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'sw-en',
  currency: 'TZS',
  theme: 'dark',
  ttsVoiceId: '',
  defaultAIModel: 'gpt-4o-mini',
}

/**
 * Creates a new user document or updates lastLoginAt on existing users.
 * Called every time a user signs in.
 */
export async function upsertUserProfile(firebaseUser: {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isAnonymous?: boolean
}): Promise<UserProfile> {
  if (!db) {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'Guest User' : 'Mwijay User'),
      photoURL: firebaseUser.photoURL ?? '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: DEFAULT_PREFERENCES,
    }
  }

  const userRef = doc(db, 'users', firebaseUser.uid)
  let snapshot
  try {
    snapshot = await getDoc(userRef)
  } catch (err) {
    console.warn('[user-service] Failed to fetch user doc:', err)
  }
  
  const now = new Date().toISOString()

  if (!snapshot || !snapshot.exists()) {
    // First time sign-in — create full profile
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'Guest User' : 'Mwijay User'),
      photoURL: firebaseUser.photoURL ?? '',
      createdAt: now,
      lastLoginAt: now,
      preferences: DEFAULT_PREFERENCES,
    }

    try {
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      })
    } catch (err) {
      console.warn('[user-service] Failed to create user profile in Firestore:', err)
    }

    return newProfile
  } else {
    // Returning user — update last login
    try {
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        displayName: firebaseUser.displayName ?? snapshot.data().displayName,
        photoURL: firebaseUser.photoURL ?? snapshot.data().photoURL,
      })
    } catch (err) {
      console.warn('[user-service] Failed to update last login:', err)
    }

    const data = snapshot.data()
    return {
      uid: data.uid ?? firebaseUser.uid,
      email: data.email ?? firebaseUser.email ?? '',
      displayName: data.displayName ?? firebaseUser.displayName ?? 'Mwijay User',
      photoURL: data.photoURL ?? firebaseUser.photoURL ?? '',
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? now,
      lastLoginAt: now,
      preferences: data.preferences ?? DEFAULT_PREFERENCES,
    }
  }
}

/**
 * Fetch user profile from Firestore by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null
  try {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) return null

    const data = snapshot.data()
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? '',
      lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() ?? '',
      preferences: data.preferences ?? DEFAULT_PREFERENCES,
    }
  } catch (err) {
    console.warn('[user-service] getUserProfile error:', err)
    return null
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  uid: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  if (!db) return
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      preferences: preferences,
    })
  } catch (err) {
    console.warn('[user-service] updateUserPreferences error:', err)
  }
}
