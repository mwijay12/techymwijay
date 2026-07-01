/**
 * Firestore operations for STT memory entries.
 *
 * Collection path: users/{uid}/stt-memory/{entryId}
 *
 * Supports:
 * - Save/delete/toggle favorite
 * - Real-time subscription with onSnapshot
 * - serverTimestamp on sync
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { MemoryEntry } from '@/lib/stt-memory'

function memoryCollection(uid: string) {
  return collection(db!, 'users', uid, 'stt-memory')
}

export async function saveMemoryToFirestore(
  uid: string,
  entry: MemoryEntry
): Promise<void> {
  if (!db) return
  const ref = doc(memoryCollection(uid), entry.id)
  await setDoc(ref, {
    ...entry,
    syncedAt: serverTimestamp(),
  })
}

export async function deleteMemoryFromFirestore(
  uid: string,
  entryId: string
): Promise<void> {
  if (!db) return
  await deleteDoc(doc(memoryCollection(uid), entryId))
}

export async function toggleFavoriteInFirestore(
  uid: string,
  entryId: string,
  favorite: boolean
): Promise<void> {
  if (!db) return
  await updateDoc(doc(memoryCollection(uid), entryId), { favorite })
}

/**
 * Real-time listener for STT memory.
 * Calls onUpdate with the full entry list whenever data changes.
 * Returns an unsubscribe function.
 */
export function subscribeToMemory(
  uid: string,
  onUpdate: (entries: MemoryEntry[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) return () => {}

  const q = query(
    memoryCollection(uid),
    orderBy('timestamp', 'desc'),
    limit(500)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: MemoryEntry[] = snapshot.docs.map((d) => ({
        ...(d.data() as MemoryEntry),
        id: d.id,
      }))
      onUpdate(entries)
    },
    (err) => {
      console.warn('[Firestore Memory] Snapshot error:', err)
      onError?.(err)
    }
  )
}