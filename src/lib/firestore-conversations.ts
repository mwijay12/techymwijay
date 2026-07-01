/**
 * Firestore operations for AI sidebar conversations.
 *
 * Collection path: users/{uid}/conversations/{conversationId}
 *
 * Supports:
 * - Save conversations
 * - Add individual messages to existing conversations
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
import type { Conversation, SidebarMessage } from '@/lib/conversation-store'

function conversationsCollection(uid: string) {
  return collection(db!, 'users', uid, 'conversations')
}

export async function saveConversationToFirestore(
  uid: string,
  conversation: Conversation
): Promise<void> {
  if (!db) return
  const ref = doc(conversationsCollection(uid), conversation.id)
  await setDoc(ref, {
    ...conversation,
    syncedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function addMessageToFirestore(
  uid: string,
  conversationId: string,
  message: SidebarMessage
): Promise<void> {
  if (!db) return
  const ref = doc(conversationsCollection(uid), conversationId)
  await updateDoc(ref, {
    messages: arrayUnion(message),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteConversationFromFirestore(
  uid: string,
  conversationId: string
): Promise<void> {
  if (!db) return
  await updateDoc(doc(conversationsCollection(uid), conversationId), {
    _deleted: true,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Real-time listener for AI conversations.
 * Calls onUpdate whenever conversation list changes.
 * Returns unsubscribe function.
 */
export function subscribeToConversations(
  uid: string,
  onUpdate: (conversations: Conversation[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) return () => {}

  const q = query(
    conversationsCollection(uid),
    orderBy('updatedAt', 'desc'),
    limit(20)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const conversations: Conversation[] = snapshot.docs
        .map((d) => ({ ...(d.data() as Conversation), id: d.id }))
        .filter((c) => !(c as any)._deleted)
      onUpdate(conversations)
    },
    (err) => {
      console.warn('[Firestore Conversations] Snapshot error:', err)
      onError?.(err)
    }
  )
}