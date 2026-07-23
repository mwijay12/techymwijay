/**
 * Firestore Sync Layer — Full conflict resolution
 * Strategy: Last-write-wins based on updatedAt timestamp.
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { enqueueSyncOperation } from './sync-queue'

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error'
  | 'pending'

export interface SyncState {
  status: SyncStatus
  lastSyncedAt: string | null
  pendingWrites: number
  errorMessage: string | null
  isOnline: boolean
}

export const DEFAULT_SYNC_STATE: SyncState = {
  status: 'idle',
  lastSyncedAt: null,
  pendingWrites: 0,
  errorMessage: null,
  isOnline: true,
}

const SYNC_STATE_KEY = 'mwijay_sync_state'

export function loadSyncState(): SyncState {
  if (typeof window === 'undefined') return DEFAULT_SYNC_STATE
  try {
    const raw = localStorage.getItem(SYNC_STATE_KEY)
    return raw ? { ...DEFAULT_SYNC_STATE, ...JSON.parse(raw) } : DEFAULT_SYNC_STATE
  } catch {
    return DEFAULT_SYNC_STATE
  }
}

export function saveSyncState(state: Partial<SyncState>): void {
  if (typeof window === 'undefined') return
  try {
    const current = loadSyncState()
    localStorage.setItem(
      SYNC_STATE_KEY,
      JSON.stringify({ ...current, ...state })
    )
  } catch {}
}

export function resolveConflict<T extends { updatedAt?: string }>(
  local: T,
  remote: T
): { winner: T; source: 'local' | 'remote' } {
  const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
  const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0

  if (localTime > remoteTime) {
    return { winner: local, source: 'local' }
  }
  return { winner: remote, source: 'remote' }
}

export async function pullFromFirestore<
  T extends { id: string; userId: string; updatedAt?: string }
>(
  collectionName: string,
  userId: string,
  localStorageKey: string,
  options: {
    orderByField?: string
    limitCount?: number
  } = {}
): Promise<T[]> {
  if (!db) {
    const localRaw = localStorage.getItem(localStorageKey)
    return localRaw ? JSON.parse(localRaw) : []
  }

  try {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      ...(options.orderByField
        ? [orderBy(options.orderByField, 'desc')]
        : []),
      ...(options.limitCount ? [limit(options.limitCount)] : [])
    )

    const snapshot = await getDocs(q)
    const remoteItems = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as T[]

    const localRaw = localStorage.getItem(localStorageKey)
    const localItems: T[] = localRaw ? JSON.parse(localRaw) : []

    const merged = mergeCollections(localItems, remoteItems)
    localStorage.setItem(localStorageKey, JSON.stringify(merged))

    return merged
  } catch (err) {
    console.warn(`[FirestoreSync] Pull failed for ${collectionName}:`, err)
    const localRaw = localStorage.getItem(localStorageKey)
    return localRaw ? JSON.parse(localRaw) : []
  }
}

function mergeCollections<
  T extends { id: string; updatedAt?: string }
>(local: T[], remote: T[]): T[] {
  const merged = new Map<string, T>()

  local.forEach((item) => merged.set(item.id, item))

  remote.forEach((remoteItem) => {
    const localItem = merged.get(remoteItem.id)

    if (!localItem) {
      merged.set(remoteItem.id, remoteItem)
    } else {
      const { winner } = resolveConflict(localItem, remoteItem)
      merged.set(remoteItem.id, winner)
    }
  })

  return Array.from(merged.values()).sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    return timeB - timeA
  })
}

export function pushToFirestore<T extends Record<string, unknown>>(
  collectionName: string,
  documentId: string,
  data: T,
  userId: string,
  operation: 'create' | 'update' | 'delete' = 'update'
): void {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    enqueueSyncOperation(
      collectionName as any,
      operation,
      documentId,
      data,
      userId
    )
    saveSyncState({
      status: 'pending',
      pendingWrites: (loadSyncState().pendingWrites || 0) + 1,
    })
    return
  }

  if (!db) return

  const docRef = doc(db, collectionName, documentId)

  if (operation === 'delete') {
    deleteDoc(docRef).catch((err) => {
      console.warn(`[FirestoreSync] Delete failed for ${documentId}:`, err)
      enqueueSyncOperation(
        collectionName as any,
        'delete',
        documentId,
        data,
        userId
      )
    })
  } else {
    setDoc(
      docRef,
      { ...data, syncedAt: serverTimestamp() },
      { merge: true }
    ).catch((err) => {
      console.warn(`[FirestoreSync] Write failed for ${documentId}:`, err)
      enqueueSyncOperation(
        collectionName as any,
        operation,
        documentId,
        data,
        userId
      )
    })
  }
}
