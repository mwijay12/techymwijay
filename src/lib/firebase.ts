// Firebase configuration for Mwijay Tech
// 🔥 Active Firebase project: mwijaytech-b9c98
//
// Singleton-safe initialization with:
// - Offline persistence
// - SSR safety
// - Emulator support for development

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  type Auth,
  connectAuthEmulator,
} from 'firebase/auth'
import {
  getFirestore,
  type Firestore,
  enableMultiTabIndexedDbPersistence,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import { env } from '@/lib/env'
import { isBrowser } from '@/lib/runtime'

const firebaseConfig = {
  apiKey: env.firebase.apiKey || "AIzaSyCMJDUMO1-LJWkNCLJF6i8Di9rG4aZJwFU",
  authDomain: env.firebase.authDomain || "mwijaytech-b9c98.firebaseapp.com",
  projectId: env.firebase.projectId || "mwijaytech-b9c98",
  storageBucket: env.firebase.storageBucket || "mwijaytech-b9c98.firebasestorage.app",
  messagingSenderId: env.firebase.messagingSenderId || "563469161055",
  appId: env.firebase.appId || "1:563469161055:web:f660f63ee9f867440041ea",
  measurementId: "G-R9KF52TXDN",
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

/** True when env vars are present and this is a browser */
export const isFirebaseConfigured =
  env.firebase.isConfigured || typeof window !== 'undefined'

// Only initialize in browser (not SSR)
if (isBrowser) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    // Enable offline persistence with multi-tab support
    const { claimPrimaryTab } = require('./multi-tab')
    enableMultiTabIndexedDbPersistence(db)
      .then(() => {
        claimPrimaryTab()
      })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('[Firebase] Multi-tab: using shared persistence lock')
        } else if (err.code === 'unimplemented') {
          console.warn('[Firebase] Browser does not support persistence')
        }
      })

    // Connect to emulators in development when flag is set
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
    ) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Firebase] Initialization failed:', err)
    }
  }
}

export { app, auth, db }