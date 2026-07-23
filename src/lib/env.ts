/**
 * Typed environment variable helper.
 * Server-side variables are NEVER exposed to the client.
 * This file is safe to import in API routes and server components only.
 */

function parseKeyPool(envValue: string | undefined, name: string): string[] {
  if (!envValue || envValue.trim() === '') {
    return []
  }
  return envValue
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
}

// ─── Server-Side Key Pools (API routes only) ──────────────
export const SERVER_ENV = {
  openrouterKeys: parseKeyPool(
    process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY,
    'OPENROUTER_API_KEYS'
  ),
  groqKeys: parseKeyPool(
    process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY,
    'GROQ_API_KEYS'
  ),
  elevenLabsKeys: parseKeyPool(
    process.env.ELEVENLABS_API_KEYS || process.env.ELEVENLABS_API_KEY,
    'ELEVENLABS_API_KEYS'
  ),
  huggingFaceKeys: parseKeyPool(
    process.env.HUGGINGFACE_API_KEYS || process.env.HUGGINGFACE_API_KEY,
    'HUGGINGFACE_API_KEYS'
  ),
  cerebrasKeys: parseKeyPool(
    process.env.CEREBRAS_API_KEYS || process.env.CEREBRAS_API_KEY,
    'CEREBRAS_API_KEYS'
  ),
} as const

// ─── Client-Safe Public Config ────────────────────────────
export const CLIENT_ENV = {
  puterEnabled: process.env.NEXT_PUBLIC_PUTER_ENABLED !== 'false',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Mwijay Tech',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
  isElectron: process.env.NEXT_PUBLIC_IS_ELECTRON === 'true',
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'kgwfenp9',
  cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'mwijay_preset',
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'mwijaytech-b9c98',
} as const

// ─── Backward-compatible env object ────────────────────────
export const env = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    isConfigured: true,
  },
  ai: {
    usePuter: CLIENT_ENV.puterEnabled,
    defaultProvider: process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER || 'openrouter',
    defaultModel: process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL || 'google/gemini-flash-1.5',
  },
  cloudinary: {
    cloudName: CLIENT_ENV.cloudinaryCloudName,
    uploadPreset: CLIENT_ENV.cloudinaryUploadPreset,
  },
} as const

export const isFirebaseConfigured = true
export const usePuter = CLIENT_ENV.puterEnabled

// ─── Pool Summary (for health checks) ─────────────────────
export function getKeyPoolSummary() {
  return {
    openrouter: SERVER_ENV.openrouterKeys.length,
    groq: SERVER_ENV.groqKeys.length,
    elevenlabs: SERVER_ENV.elevenLabsKeys.length,
    huggingface: SERVER_ENV.huggingFaceKeys.length,
    cerebras: SERVER_ENV.cerebrasKeys.length,
    puter: CLIENT_ENV.puterEnabled ? 1 : 0,
    total:
      SERVER_ENV.openrouterKeys.length +
      SERVER_ENV.groqKeys.length +
      SERVER_ENV.elevenLabsKeys.length +
      SERVER_ENV.huggingFaceKeys.length +
      SERVER_ENV.cerebrasKeys.length +
      (CLIENT_ENV.puterEnabled ? 1 : 0),
  }
}