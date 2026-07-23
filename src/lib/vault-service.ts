/**
 * Vault Service
 * Handles all CRUD operations for vault items.
 * Primary storage: localStorage (instant, offline-capable)
 * Secondary storage: Firestore (sync when online)
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'
import { encryptSecret } from '@/lib/encryption'
import { broadcastVaultUpdate, broadcastItemDeleted } from '@/lib/multi-tab'
import type { VaultItem, VaultCategory } from '@/types/vault'

function getStorageKey(userId: string): string {
  return `mwijay_vault_${userId}`
}

export function loadVaultFromStorage(userId: string): VaultItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as VaultItem[]
    return parsed.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    })
  } catch {
    console.warn('[Vault] Failed to load from localStorage')
    return []
  }
}

export function saveVaultToStorage(userId: string, items: VaultItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(items))
  } catch {
    console.warn('[Vault] Failed to save to localStorage')
  }
}

function firestoreToVaultItem(
  docData: Record<string, unknown>,
  id: string
): VaultItem {
  const toISOString = (val: unknown): string => {
    if (val instanceof Timestamp) return val.toDate().toISOString()
    if (typeof val === 'string') return val
    return new Date().toISOString()
  }

  return {
    id,
    userId: String(docData.userId ?? ''),
    title: String(docData.title ?? ''),
    category: (docData.category as VaultCategory) ?? 'notes',
    content: String(docData.content ?? ''),
    secretContent: docData.secretContent
      ? String(docData.secretContent)
      : undefined,
    secretContentEncrypted: Boolean(docData.secretContentEncrypted ?? false),
    tags: Array.isArray(docData.tags)
      ? (docData.tags as string[])
      : [],
    imageUrl: docData.imageUrl ? String(docData.imageUrl) : undefined,
    isPinned: Boolean(docData.isPinned ?? false),
    expiresAt: docData.expiresAt
      ? String(docData.expiresAt)
      : undefined,
    createdAt: toISOString(docData.createdAt),
    updatedAt: toISOString(docData.updatedAt),
    syncedAt: new Date().toISOString(),
  }
}

export async function syncFromFirestore(userId: string): Promise<VaultItem[]> {
  if (!db) return loadVaultFromStorage(userId)
  try {
    const q = query(
      collection(db, 'vault_items'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d =>
      firestoreToVaultItem(d.data() as Record<string, unknown>, d.id)
    )
    if (items.length > 0) {
      saveVaultToStorage(userId, items)
    }
    return items
  } catch (err) {
    console.warn('[Vault] Firestore sync failed — using localStorage:', err)
    return loadVaultFromStorage(userId)
  }
}

async function syncItemToFirestore(item: VaultItem): Promise<void> {
  if (!db) return
  try {
    const docRef = doc(db, 'vault_items', item.id)
    await setDoc(docRef, {
      ...item,
      updatedAt: serverTimestamp(),
      syncedAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[Vault] Failed to sync item to Firestore:', err)
  }
}

async function deleteItemFromFirestore(itemId: string): Promise<void> {
  if (!db) return
  try {
    await deleteDoc(doc(db, 'vault_items', itemId))
  } catch (err) {
    console.warn('[Vault] Failed to delete item from Firestore:', err)
  }
}

export async function createVaultItem(
  userId: string,
  data: {
    title: string
    category: VaultCategory
    content: string
    secretContent?: string
    tags?: string[]
    imageUrl?: string
    isPinned?: boolean
    expiresAt?: string
  },
  masterPassword?: string | null
): Promise<VaultItem> {
  const now = new Date().toISOString()
  let secret = data.secretContent?.trim() || undefined
  let isEncrypted = false

  if (secret && masterPassword) {
    secret = await encryptSecret(secret, masterPassword, userId)
    isEncrypted = true
  }

  const newItem: VaultItem = {
    id: uuidv4(),
    userId,
    title: data.title.trim(),
    category: data.category,
    content: data.content.trim(),
    secretContent: secret,
    secretContentEncrypted: isEncrypted,
    tags: data.tags?.map(t => t.trim().toLowerCase()).filter(Boolean) ?? [],
    imageUrl: data.imageUrl || undefined,
    isPinned: data.isPinned ?? false,
    expiresAt: data.expiresAt || undefined,
    createdAt: now,
    updatedAt: now,
  }

  const existing = loadVaultFromStorage(userId)
  saveVaultToStorage(userId, [newItem, ...existing])
  broadcastVaultUpdate(newItem.id)
  syncItemToFirestore(newItem).catch(() => {})

  return newItem
}

export async function getVaultItems(userId: string): Promise<VaultItem[]> {
  const local = loadVaultFromStorage(userId)
  if (typeof window !== 'undefined' && navigator.onLine) {
    syncFromFirestore(userId).catch(() => {})
  }
  return local
}

export async function updateVaultItem(
  userId: string,
  itemId: string,
  updates: Partial<Omit<VaultItem, 'id' | 'userId' | 'createdAt'>>,
  masterPassword?: string | null
): Promise<VaultItem> {
  const existing = loadVaultFromStorage(userId)
  const index = existing.findIndex(i => i.id === itemId)

  if (index === -1) {
    throw new Error(`Vault item ${itemId} not found`)
  }

  const currentItem = existing[index]
  let secret = updates.secretContent !== undefined ? updates.secretContent : currentItem.secretContent
  let isEncrypted = currentItem.secretContentEncrypted

  if (updates.secretContent !== undefined && updates.secretContent.trim()) {
    if (masterPassword) {
      secret = await encryptSecret(updates.secretContent.trim(), masterPassword, userId)
      isEncrypted = true
    } else {
      secret = updates.secretContent.trim()
      isEncrypted = false
    }
  }

  const updated: VaultItem = {
    ...currentItem,
    ...updates,
    secretContent: secret,
    secretContentEncrypted: isEncrypted,
    id: itemId,
    userId,
    updatedAt: new Date().toISOString(),
  }

  if (updates.tags) {
    updated.tags = updates.tags
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
  }

  existing[index] = updated
  saveVaultToStorage(userId, existing)
  broadcastVaultUpdate(updated.id)
  syncItemToFirestore(updated).catch(() => {})

  return updated
}

export async function deleteVaultItem(
  userId: string,
  itemId: string
): Promise<void> {
  const existing = loadVaultFromStorage(userId)
  const filtered = existing.filter(i => i.id !== itemId)
  saveVaultToStorage(userId, filtered)
  broadcastItemDeleted('vault', itemId)
  deleteItemFromFirestore(itemId).catch(() => {})
}

export async function togglePinVaultItem(
  userId: string,
  itemId: string
): Promise<VaultItem> {
  const existing = loadVaultFromStorage(userId)
  const item = existing.find(i => i.id === itemId)
  if (!item) throw new Error(`Item ${itemId} not found`)

  return updateVaultItem(userId, itemId, { isPinned: !item.isPinned })
}

export function getAllTags(items: VaultItem[]): string[] {
  const tagSet = new Set<string>()
  items.forEach(item => (item.tags || []).forEach(tag => tagSet.add(tag)))
  return Array.from(tagSet).sort()
}

export function isItemExpired(item: VaultItem): boolean {
  if (!item.expiresAt) return false
  return new Date(item.expiresAt) < new Date()
}

export function getDaysUntilExpiry(item: VaultItem): number | null {
  if (!item.expiresAt) return null
  const diff = new Date(item.expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
