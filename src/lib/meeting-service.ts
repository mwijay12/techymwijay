/**
 * Meeting Service
 * Manages meeting session persistence in localStorage + Firestore.
 * Full transcript stored locally (too large for Firestore free tier).
 * Metadata synced to Firestore for cross-device history.
 */

import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

export type MeetingLanguage = 'sw' | 'en' | 'mixed'
export type SpeakerTag =
  | 'Lecturer'
  | 'Me'
  | 'Q&A'
  | 'Discussion'
  | 'Note'
  | 'Action Item'

export interface MeetingChunk {
  id: string
  text: string
  timestamp: number // seconds from session start
  language: MeetingLanguage
  engine: 'groq' | 'webspeech'
  speakerTag?: SpeakerTag
  isProcessing: boolean
}

export interface MeetingSession {
  id: string
  userId: string
  title: string
  context?: string
  chunks: MeetingChunk[]
  summary?: string
  duration: number // total seconds
  language: MeetingLanguage
  startedAt: string
  endedAt?: string
  savedToVault: boolean
  vaultItemId?: string
}

const getSessionsKey = (userId: string) => `mwijay_meetings_${userId}`
const getSessionKey = (userId: string, sessionId: string) =>
  `mwijay_meeting_${userId}_${sessionId}`

export function loadSessionsFromStorage(userId: string): MeetingSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getSessionsKey(userId))
    if (!raw) return []
    const ids: string[] = JSON.parse(raw)
    return ids
      .map(id => {
        const sessionRaw = localStorage.getItem(getSessionKey(userId, id))
        return sessionRaw ? (JSON.parse(sessionRaw) as MeetingSession) : null
      })
      .filter(Boolean) as MeetingSession[]
  } catch {
    return []
  }
}

export function saveSessionToStorage(
  userId: string,
  session: MeetingSession
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      getSessionKey(userId, session.id),
      JSON.stringify(session)
    )

    const raw = localStorage.getItem(getSessionsKey(userId))
    const ids: string[] = raw ? JSON.parse(raw) : []
    if (!ids.includes(session.id)) {
      const updated = [session.id, ...ids].slice(0, 10)
      localStorage.setItem(getSessionsKey(userId), JSON.stringify(updated))
    }
  } catch {
    console.warn('[Meeting] localStorage save failed')
  }
}

export function deleteSessionFromStorage(
  userId: string,
  sessionId: string
): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getSessionKey(userId, sessionId))
  const raw = localStorage.getItem(getSessionsKey(userId))
  if (raw) {
    const ids: string[] = JSON.parse(raw)
    localStorage.setItem(
      getSessionsKey(userId),
      JSON.stringify(ids.filter(id => id !== sessionId))
    )
  }
}

async function syncSessionMetaToFirestore(
  session: MeetingSession
): Promise<void> {
  if (!db) return
  try {
    await setDoc(
      doc(db, 'ai_meetings', session.userId, 'sessions', session.id),
      {
        id: session.id,
        title: session.title,
        context: session.context ?? null,
        summary: session.summary ?? null,
        duration: session.duration,
        language: session.language,
        chunkCount: session.chunks.length,
        savedToVault: session.savedToVault,
        vaultItemId: session.vaultItemId ?? null,
        startedAt: session.startedAt
          ? new Date(session.startedAt)
          : serverTimestamp(),
        endedAt: session.endedAt ? new Date(session.endedAt) : null,
        updatedAt: serverTimestamp(),
      }
    )
  } catch (err) {
    console.warn('[Meeting] Firestore sync failed:', err)
  }
}

export function createMeetingSession(
  userId: string,
  title: string,
  context?: string
): MeetingSession {
  const session: MeetingSession = {
    id: uuidv4(),
    userId,
    title: title.trim() || `Meeting — ${format(new Date(), 'd MMM yyyy, HH:mm')}`,
    context: context?.trim(),
    chunks: [],
    duration: 0,
    language: 'mixed',
    startedAt: new Date().toISOString(),
    savedToVault: false,
  }

  saveSessionToStorage(userId, session)
  return session
}

export function addChunkToSession(
  userId: string,
  sessionId: string,
  chunk: MeetingChunk
): MeetingSession | null {
  const raw = localStorage.getItem(getSessionKey(userId, sessionId))
  if (!raw) return null

  const session: MeetingSession = JSON.parse(raw)
  session.chunks = [...session.chunks, chunk]

  saveSessionToStorage(userId, session)
  return session
}

export function updateChunkText(
  userId: string,
  sessionId: string,
  chunkId: string,
  text: string,
  engine: 'groq' | 'webspeech',
  language: MeetingLanguage
): void {
  const raw = localStorage.getItem(getSessionKey(userId, sessionId))
  if (!raw) return

  const session: MeetingSession = JSON.parse(raw)
  const chunkIdx = session.chunks.findIndex(c => c.id === chunkId)

  if (chunkIdx !== -1) {
    session.chunks[chunkIdx] = {
      ...session.chunks[chunkIdx],
      text,
      engine,
      language,
      isProcessing: false,
    }
    saveSessionToStorage(userId, session)
  }
}

export function endMeetingSession(
  userId: string,
  sessionId: string,
  duration: number,
  summary?: string
): MeetingSession | null {
  const raw = localStorage.getItem(getSessionKey(userId, sessionId))
  if (!raw) return null

  const session: MeetingSession = JSON.parse(raw)
  session.endedAt = new Date().toISOString()
  session.duration = duration
  session.summary = summary

  const swCount = session.chunks.filter(c => c.language === 'sw').length
  const enCount = session.chunks.filter(c => c.language === 'en').length
  const total = session.chunks.length

  if (total === 0) {
    session.language = 'mixed'
  } else if (swCount / total > 0.6) {
    session.language = 'sw'
  } else if (enCount / total > 0.6) {
    session.language = 'en'
  } else {
    session.language = 'mixed'
  }

  saveSessionToStorage(userId, session)
  syncSessionMetaToFirestore(session).catch(() => {})

  return session
}

export function markSessionSavedToVault(
  userId: string,
  sessionId: string,
  vaultItemId: string
): void {
  const raw = localStorage.getItem(getSessionKey(userId, sessionId))
  if (!raw) return

  const session: MeetingSession = JSON.parse(raw)
  session.savedToVault = true
  session.vaultItemId = vaultItemId
  saveSessionToStorage(userId, session)
  syncSessionMetaToFirestore(session).catch(() => {})
}

export function buildFullTranscript(session: MeetingSession): string {
  const header = [
    `MEETING TRANSCRIPT`,
    `Title: ${session.title}`,
    session.context ? `Context: ${session.context}` : null,
    `Date: ${format(new Date(session.startedAt), 'EEEE, d MMMM yyyy')}`,
    `Duration: ${formatDuration(session.duration)}`,
    `Language: ${
      session.language === 'mixed'
        ? 'Swahili-English'
        : session.language === 'sw'
        ? 'Swahili'
        : 'English'
    }`,
    `─────────────────────────────────────────`,
    '',
  ]
    .filter(Boolean)
    .join('\n')

  const body = session.chunks
    .filter(c => c.text.trim())
    .map(chunk => {
      const time = formatDuration(chunk.timestamp)
      const tag = chunk.speakerTag ? `[${chunk.speakerTag}] ` : ''
      return `[${time}] ${tag}${chunk.text}`
    })
    .join('\n\n')

  const summaryStr = session.summary
    ? `\n\n─────────────────────────────────────────\nAI SUMMARY\n─────────────────────────────────────────\n${session.summary}`
    : ''

  return `${header}${body}${summaryStr}`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function exportMeetingAsText(session: MeetingSession): void {
  const text = buildFullTranscript(session)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeTitle = session.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  a.download = `mwijay-meeting-${safeTitle}-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
