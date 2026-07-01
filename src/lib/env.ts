/**
 * Typed environment variable helper for Mwijay AI Voice Studio.
 *
 * Centralizes all process.env reads to avoid scattered checks.
 * Gracefully handles missing optional vars — never crashes on import.
 */

// ─── Firebase Public Vars ──────────────────────────────────
const requiredFirebaseVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const

function hasAllFirebaseVars(): boolean {
  return requiredFirebaseVars.every((key) => {
    const val = process.env[key]
    return typeof val === 'string' && val.length > 0
  })
}

// ─── App Config ────────────────────────────────────────────
export const env = {
  // Firebase
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    /** True only if ALL required Firebase env vars are present and non-empty */
    isConfigured: hasAllFirebaseVars(),
  },

  // AI Provider defaults
  ai: {
    /** Whether to use Puter.js as the primary AI provider */
    usePuter: process.env.NEXT_PUBLIC_USE_PUTER !== 'false',
    /** Default AI provider identifier */
    defaultProvider: process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER || 'puter',
    /** Default AI model name */
    defaultModel: process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL || 'gpt-4o-mini',
  },

  // Cloudinary (optional)
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  },

  // Analytics (optional — for future use)
  posthog: {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },

  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
} as const

/** Shorthand for checking if Firebase is usable */
export const isFirebaseConfigured = env.firebase.isConfigured
/** Shorthand for checking if Puter.js should be used */
export const usePuter = env.ai.usePuter