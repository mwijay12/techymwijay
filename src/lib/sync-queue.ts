/**
 * Offline Sync Queue
 * Queues Firestore writes when offline.
 * Replays them when connection is restored.
 */

import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type SyncOperation = 'create' | 'update' | 'delete'
export type SyncCollection =
  | 'vault_items'
  | 'spending_entries'
  | 'todo_items'
  | 'ai_memory'
  | 'ai_conversations'

export interface SyncQueueItem {
  id: string
  collection: SyncCollection
  operation: SyncOperation
  documentId: string
  data: Record<string, unknown>
  userId: string
  timestamp: string
  retryCount: number
  maxRetries: number
  error?: string
}

const QUEUE_KEY = 'mwijay_sync_queue'
const MAX_RETRIES = 3
const MAX_QUEUE_SIZE = 100

export function loadSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === 'undefined') return
  try {
    const trimmed = queue.slice(-MAX_QUEUE_SIZE)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed))
  } catch {
    console.warn('[SyncQueue] Failed to save — storage may be full')
  }
}

export function enqueueSyncOperation(
  collection: SyncCollection,
  operation: SyncOperation,
  documentId: string,
  data: Record<string, unknown>,
  userId: string
): void {
  const queue = loadSyncQueue()

  const filtered = queue.filter(
    item =>
      !(item.collection === collection && item.documentId === documentId)
  )

  const item: SyncQueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    collection,
    operation,
    documentId,
    data,
    userId,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    maxRetries: MAX_RETRIES,
  }

  saveSyncQueue([...filtered, item])
  console.log(`[SyncQueue] Enqueued ${operation} on ${collection}/${documentId}`)
}

export function getPendingCount(): number {
  return loadSyncQueue().length
}

export async function replayQueue(userId: string): Promise<{
  replayed: number
  failed: number
  remaining: number
}> {
  if (!navigator.onLine || !db) {
    return { replayed: 0, failed: 0, remaining: getPendingCount() }
  }

  const queue = loadSyncQueue()
  const userQueue = queue.filter(item => item.userId === userId)

  if (userQueue.length === 0) {
    return { replayed: 0, failed: 0, remaining: 0 }
  }

  console.log(`[SyncQueue] Replaying ${userQueue.length} queued operations...`)

  let replayed = 0
  let failed = 0
  const remainingItems: SyncQueueItem[] = []

  for (const item of userQueue) {
    try {
      await executeFirestoreOperation(item)
      replayed++
      console.log(`[SyncQueue] ✅ Replayed: ${item.operation} ${item.collection}/${item.documentId}`)
    } catch (err) {
      const updatedItem = {
        ...item,
        retryCount: item.retryCount + 1,
        error: err instanceof Error ? err.message : 'Unknown error',
      }

      if (updatedItem.retryCount < updatedItem.maxRetries) {
        remainingItems.push(updatedItem)
      } else {
        failed++
      }
    }
  }

  const otherUsersItems = queue.filter(item => item.userId !== userId)
  saveSyncQueue([...otherUsersItems, ...remainingItems])

  return {
    replayed,
    failed,
    remaining: remainingItems.length,
  }
}

async function executeFirestoreOperation(item: SyncQueueItem): Promise<void> {
  if (!db) return
  const docRef = doc(db, item.collection, item.documentId)

  switch (item.operation) {
    case 'create':
    case 'update':
      await setDoc(docRef, {
        ...item.data,
        syncedAt: serverTimestamp(),
      }, { merge: true })
      break

    case 'delete':
      await deleteDoc(docRef)
      break

    default:
      throw new Error(`Unknown operation: ${item.operation}`)
  }
}

export function clearUserQueue(userId: string): void {
  const queue = loadSyncQueue()
  const filtered = queue.filter(item => item.userId !== userId)
  saveSyncQueue(filtered)
}

export function isQueueWarning(): boolean {
  return getPendingCount() > 20
}
