/**
 * Firestore operations for meeting sessions.
 *
 * Collection path: users/{uid}/meetings/{sessionId}
 *
 * Supports:
 * - Save/update meetings
 * - Add transcript segments
 * - Real-time subscriptions
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  arrayUnion,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { MeetingSession, TranscriptSegment } from '@/lib/meeting-store'

function meetingsCollection(uid: string) {
  return collection(db!, 'users', uid, 'meetings')
}

export async function saveMeetingToFirestore(
  uid: string,
  session: MeetingSession
): Promise<void> {
  if (!db) return
  const ref = doc(meetingsCollection(uid), session.id)
  await setDoc(ref, {
    ...session,
    syncedAt: serverTimestamp(),
  })
}

export async function updateMeetingInFirestore(
  uid: string,
  sessionId: string,
  updates: Partial<MeetingSession>
): Promise<void> {
  if (!db) return
  const ref = doc(meetingsCollection(uid), sessionId)
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function addSegmentToFirestore(
  uid: string,
  sessionId: string,
  segment: TranscriptSegment
): Promise<void> {
  if (!db) return
  const ref = doc(meetingsCollection(uid), sessionId)
  await updateDoc(ref, {
    segments: arrayUnion(segment),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMeetingFromFirestore(
  uid: string,
  sessionId: string
): Promise<void> {
  if (!db) return
  await updateDoc(doc(meetingsCollection(uid), sessionId), {
    _deleted: true,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Real-time listener for meeting sessions.
 * Calls onUpdate whenever meetings change.
 * Returns unsubscribe function.
 */
export function subscribeToMeetings(
  uid: string,
  onUpdate: (sessions: MeetingSession[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) return () => {}

  const q = query(
    meetingsCollection(uid),
    orderBy('startedAt', 'desc'),
    limit(50)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions: MeetingSession[] = snapshot.docs
        .map((d) => ({ ...(d.data() as MeetingSession), id: d.id }))
        .filter((s) => !(s as any)._deleted)
      onUpdate(sessions)
    },
    (err) => {
      console.warn('[Firestore Meetings] Snapshot error:', err)
      onError?.(err)
    }
  )
}