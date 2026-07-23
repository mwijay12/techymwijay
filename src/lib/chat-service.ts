/**
 * Chat Service
 * Manages AI conversation persistence in Firestore + localStorage backup.
 * Conversations are per-user and capped at 20 messages.
 */

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AIMessage } from '@/types/ai'

const MAX_MESSAGES = 20
const getStorageKey = (userId: string) => `mwijay_chat_${userId}`

export function loadChatFromStorage(userId: string): AIMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveChatToStorage(
  userId: string,
  messages: AIMessage[]
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(messages.slice(-MAX_MESSAGES))
    )
  } catch {}
}

export function clearChatStorage(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getStorageKey(userId))
}

function getMessagesRef(userId: string) {
  if (!db) return null
  return collection(db, 'ai_conversations', userId, 'messages')
}

export async function loadChatFromFirestore(
  userId: string
): Promise<AIMessage[]> {
  try {
    const ref = getMessagesRef(userId)
    if (!ref) return []

    const q = query(
      ref,
      orderBy('timestamp', 'asc'),
      limit(MAX_MESSAGES)
    )
    const snap = await getDocs(q)

    return snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        role: data.role as AIMessage['role'],
        content: String(data.content ?? ''),
        timestamp: data.timestamp instanceof Timestamp
          ? data.timestamp.toDate().toISOString()
          : String(data.timestamp ?? new Date().toISOString()),
        provider: data.provider,
        model: data.model,
      }
    })
  } catch {
    return []
  }
}

export async function saveMessageToFirestore(
  userId: string,
  message: AIMessage
): Promise<void> {
  try {
    const ref = getMessagesRef(userId)
    if (!ref) return

    await addDoc(ref, {
      role: message.role,
      content: message.content,
      provider: message.provider ?? null,
      model: message.model ?? null,
      timestamp: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[Chat] Firestore save failed:', err)
  }
}

export async function clearChatFromFirestore(
  userId: string
): Promise<void> {
  try {
    const ref = getMessagesRef(userId)
    if (!ref) return

    const q = query(ref)
    const snap = await getDocs(q)
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  } catch (err) {
    console.warn('[Chat] Firestore clear failed:', err)
  }
}
