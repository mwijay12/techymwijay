export type VaultCategory = 'passwords' | 'code' | 'keys' | 'notes'

export interface VaultItem {
  id: string
  userId: string
  title: string
  category: VaultCategory
  content: string
  secretContent?: string          // AES-256 encrypted
  secretContentEncrypted: boolean // true if encrypted
  tags: string[]
  imageUrl?: string
  isPinned: boolean
  expiresAt?: string              // ISO date string for TTL
  createdAt: string               // ISO date string
  updatedAt: string               // ISO date string
  syncedAt?: string               // Last Firestore sync
}

export interface VaultSearchResult {
  item: VaultItem
  score: number
}
