/**
 * Meeting Store — save/load meeting sessions to localStorage.
 *
 * Handles session creation, segment tracking, finalization,
 * AI summary storage, and export.
 */

import { getItem, setItem } from '@/lib/browser-storage'

const STORAGE_KEY = 'mwj-meeting-sessions'
const MAX_SESSIONS = 50

export type TranscriptSegment = {
  id: string
  text: string
  translatedText?: string
  language: string
  timestamp: number
  durationMs?: number
  isFinal: boolean
  speakerLabel?: string
}

export type MeetingSession = {
  id: string
  title: string
  startedAt: number
  endedAt?: number
  durationMs?: number
  segments: TranscriptSegment[]
  fullTranscript: string
  summary?: string
  keyTopics?: string[]
  actionItems?: string[]
  language: string
  translationEnabled: boolean
  wordCount: number
}

function generateId(): string {
  return `meeting_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function generateSegmentId(): string {
  return `seg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function loadMeetingSessions(): MeetingSession[] {
  try {
    const raw = getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistSessions(sessions: MeetingSession[]): void {
  const trimmed = sessions
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, MAX_SESSIONS)
  setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

export function createMeetingSession(
  language: string,
  translationEnabled: boolean,
  title?: string
): MeetingSession {
  const session: MeetingSession = {
    id: generateId(),
    title:
      title ??
      `Meeting — ${new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    startedAt: Date.now(),
    segments: [],
    fullTranscript: '',
    language,
    translationEnabled,
    wordCount: 0,
  }

  const all = loadMeetingSessions()
  all.unshift(session)
  persistSessions(all)
  return session
}

export function addSegmentToSession(
  sessionId: string,
  text: string,
  language: string,
  translatedText?: string
): TranscriptSegment {
  const all = loadMeetingSessions()
  const session = all.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session not found')

  const segment: TranscriptSegment = {
    id: generateSegmentId(),
    text,
    translatedText,
    language,
    timestamp: Date.now(),
    isFinal: true,
  }

  session.segments.push(segment)
  session.fullTranscript = session.segments.map((s) => s.text).join(' ')
  session.wordCount = session.fullTranscript.split(/\s+/).filter(Boolean).length

  persistSessions(all)
  return segment
}

export function finalizeMeetingSession(
  sessionId: string,
  summary?: string,
  keyTopics?: string[],
  actionItems?: string[]
): MeetingSession {
  const all = loadMeetingSessions()
  const session = all.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session not found')

  session.endedAt = Date.now()
  session.durationMs = session.endedAt - session.startedAt
  if (summary) session.summary = summary
  if (keyTopics) session.keyTopics = keyTopics
  if (actionItems) session.actionItems = actionItems

  persistSessions(all)
  return session
}

export function exportMeetingTranscript(session: MeetingSession): void {
  const lines: string[] = [
    `MEETING TRANSCRIPT`,
    `==================`,
    `Title: ${session.title}`,
    `Date: ${new Date(session.startedAt).toLocaleString()}`,
    `Duration: ${
      session.durationMs
        ? Math.round(session.durationMs / 60000) + ' minutes'
        : 'N/A'
    }`,
    `Language: ${session.language}`,
    `Word Count: ${session.wordCount}`,
    ``,
    `TRANSCRIPT`,
    `----------`,
    ...session.segments.map((seg) => {
      const time = new Date(seg.timestamp).toLocaleTimeString()
      const translation = seg.translatedText
        ? `\n  [${seg.translatedText}]`
        : ''
      return `[${time}] ${seg.text}${translation}`
    }),
  ]

  if (session.summary) {
    lines.push('', 'SUMMARY', '-------', session.summary)
  }

  if (session.keyTopics?.length) {
    lines.push(
      '',
      'KEY TOPICS',
      '----------',
      ...session.keyTopics.map((t) => `• ${t}`)
    )
  }

  if (session.actionItems?.length) {
    lines.push(
      '',
      'ACTION ITEMS',
      '------------',
      ...session.actionItems.map((a) => `• ${a}`)
    )
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${session.title.replace(/[^a-z0-9]/gi, '_')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}