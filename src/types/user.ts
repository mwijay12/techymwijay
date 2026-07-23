export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: string
  lastLoginAt: string
  preferences: UserPreferences
}

export interface UserPreferences {
  language: 'sw' | 'en' | 'sw-en'  // Swahili, English, or mixed
  currency: 'TZS' | 'USD' | 'KES'
  theme: 'dark' | 'light'
  ttsVoiceId?: string               // preferred ElevenLabs voice
  defaultAIModel?: string           // preferred model
}
