/**
 * Sync Engine — orchestrates local + cloud data sync.
 *
 * Strategy:
 * - localStorage is the primary fast layer (always written first)
 * - Firestore is the cloud backup (fire-and-forget, silent failure)
 * - Settings are NEVER synced (they contain API keys)
 * - Writes are fire-and-forget — never block UI on cloud operations
 */

import type { MemoryEntry } from '@/lib/stt-memory'
import type { MeetingSession, TranscriptSegment } from '@/lib/meeting-store'
import type { Conversation, SidebarMessage } from '@/lib/conversation-store'
import {
  saveMemoryToFirestore,
  deleteMemoryFromFirestore,
  toggleFavoriteInFirestore,
} from '@/lib/firestore-memory'
import {
  saveMeetingToFirestore,
  addSegmentToFirestore,
  updateMeetingInFirestore,
} from '@/lib/firestore-meetings'
import {
  saveConversationToFirestore,
  addMessageToFirestore,
} from '@/lib/firestore-conversations'

/** Fire-and-forget helper — never blocks UI, silently fails */
function fireAndForget(promise: Promise<unknown>): void {
  promise.catch((err) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sync] Firestore write failed (offline?):', err)
    }
  })
}

/** STT Memory sync operations */
export const syncMemory = {
  save: (uid: string | null, entry: MemoryEntry) => {
    if (!uid) return
    fireAndForget(saveMemoryToFirestore(uid, entry))
  },
  delete: (uid: string | null, entryId: string) => {
    if (!uid) return
    fireAndForget(deleteMemoryFromFirestore(uid, entryId))
  },
  toggleFavorite: (uid: string | null, entryId: string, favorite: boolean) => {
    if (!uid) return
    fireAndForget(toggleFavoriteInFirestore(uid, entryId, favorite))
  },
}

/** Meeting session sync operations */
export const syncMeetings = {
  save: (uid: string | null, session: MeetingSession) => {
    if (!uid) return
    fireAndForget(saveMeetingToFirestore(uid, session))
  },
  addSegment: (uid: string | null, sessionId: string, segment: TranscriptSegment) => {
    if (!uid) return
    fireAndForget(addSegmentToFirestore(uid, sessionId, segment))
  },
  update: (uid: string | null, sessionId: string, updates: Partial<MeetingSession>) => {
    if (!uid) return
    fireAndForget(updateMeetingInFirestore(uid, sessionId, updates))
  },
}

/** AI Conversation sync operations */
export const syncConversations = {
  save: (uid: string | null, conversation: Conversation) => {
    if (!uid) return
    fireAndForget(saveConversationToFirestore(uid, conversation))
  },
  addMessage: (uid: string | null, conversationId: string, message: SidebarMessage) => {
    if (!uid) return
    fireAndForget(addMessageToFirestore(uid, conversationId, message))
  },
}