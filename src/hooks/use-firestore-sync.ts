'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToMemory } from '@/lib/firestore-memory'
import { subscribeToMeetings } from '@/lib/firestore-meetings'
import { subscribeToConversations } from '@/lib/firestore-conversations'
import { isFirebaseConfigured } from '@/lib/firebase'
import type { MemoryEntry } from '@/lib/stt-memory'
import type { MeetingSession } from '@/lib/meeting-store'
import type { Conversation } from '@/lib/conversation-store'

type SyncCallbacks = {
  onMemoryUpdate?: (entries: MemoryEntry[]) => void
  onMeetingsUpdate?: (sessions: MeetingSession[]) => void
  onConversationsUpdate?: (conversations: Conversation[]) => void
}

/**
 * Hook that manages Firestore real-time subscriptions.
 * Automatically subscribes/unsubscribes when user changes.
 * Cleans up on unmount.
 */
export function useFirestoreSync(callbacks: SyncCallbacks) {
  const { user } = useAuth()
  const unsubscribeRefs = useRef<(() => void)[]>([])

  useEffect(() => {
    // Clean up existing subscriptions
    unsubscribeRefs.current.forEach((unsub) => unsub())
    unsubscribeRefs.current = []

    if (!user?.uid || !isFirebaseConfigured) return

    const uid = user.uid

    // Subscribe to memory
    if (callbacks.onMemoryUpdate) {
      const unsub = subscribeToMemory(uid, callbacks.onMemoryUpdate)
      unsubscribeRefs.current.push(unsub)
    }

    // Subscribe to meetings
    if (callbacks.onMeetingsUpdate) {
      const unsub = subscribeToMeetings(uid, callbacks.onMeetingsUpdate)
      unsubscribeRefs.current.push(unsub)
    }

    // Subscribe to conversations
    if (callbacks.onConversationsUpdate) {
      const unsub = subscribeToConversations(uid, callbacks.onConversationsUpdate)
      unsubscribeRefs.current.push(unsub)
    }

    return () => {
      unsubscribeRefs.current.forEach((unsub) => unsub())
    }
  }, [user?.uid])
}