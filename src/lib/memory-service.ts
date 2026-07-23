/**
 * AI Memory Service
 * Manages personal AI memory entries for Davie.
 * Stores facts, preferences, context, corrections, and skills.
 * These are injected into every AI prompt for personalized responses.
 */

import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'
import type { AIMemoryEntry } from '@/types/ai'

export type MemoryType =
  | 'preference'
  | 'fact'
  | 'context'
  | 'correction'
  | 'skill'

export const MEMORY_TYPE_CONFIG: Record<
  MemoryType,
  {
    emoji: string
    label: string
    labelSw: string
    color: string
    bgClass: string
    textClass: string
    description: string
  }
> = {
  preference: {
    emoji: '💡',
    label: 'Preference',
    labelSw: 'Mapendekezo',
    color: '#8b5cf6',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    description: 'How you like things done',
  },
  fact: {
    emoji: '📌',
    label: 'Fact',
    labelSw: 'Ukweli',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    description: 'Facts about you and your life',
  },
  context: {
    emoji: '🌍',
    label: 'Context',
    labelSw: 'Mazingira',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-400',
    description: 'Your environment and situation',
  },
  correction: {
    emoji: '✏️',
    label: 'Correction',
    labelSw: 'Marekebisho',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    description: 'Things the AI got wrong before',
  },
  skill: {
    emoji: '🛠️',
    label: 'Skill',
    labelSw: 'Ujuzi',
    color: '#ec4899',
    bgClass: 'bg-pink-500/10',
    textClass: 'text-pink-400',
    description: 'Your technical skills and tools',
  },
}

export const ALL_MEMORY_TYPES: MemoryType[] = [
  'fact',
  'preference',
  'context',
  'skill',
  'correction',
]

const MAX_MEMORIES = 50
const STORAGE_KEY = (userId: string) => `mwijay_memory_${userId}`
const SEEDED_KEY = (userId: string) => `mwijay_memory_seeded_${userId}`

const DEFAULT_MEMORIES: Array<{
  type: MemoryType
  content: string
  tags: string[]
}> = [
  {
    type: 'fact',
    content:
      'My name is Davie Mwijay. I am a developer and BIT student in Dar es Salaam, Tanzania.',
    tags: ['identity', 'tanzania', 'education'],
  },
  {
    type: 'context',
    content:
      'I primarily use Tanzanian Shillings (TZS) for all financial calculations and expense tracking.',
    tags: ['currency', 'finance', 'tanzania'],
  },
  {
    type: 'preference',
    content:
      'I prefer concise, direct answers without unnecessary filler text or excessive caveats.',
    tags: ['communication', 'style'],
  },
  {
    type: 'preference',
    content:
      'I speak Swahili and English and naturally mix them (code-switching). Understand both equally.',
    tags: ['language', 'swahili', 'english'],
  },
  {
    type: 'context',
    content:
      'My timezone is Africa/Dar_es_Salaam (EAT, UTC+3). Use this for any time-related responses.',
    tags: ['timezone', 'tanzania', 'time'],
  },
  {
    type: 'skill',
    content:
      'I actively work with: Next.js 16, TypeScript, React 18, Firebase, Tailwind CSS, Electron, Framer Motion.',
    tags: ['nextjs', 'typescript', 'react', 'firebase', 'frontend'],
  },
  {
    type: 'preference',
    content:
      'When helping with code, show the complete solution with full file context, not just code snippets.',
    tags: ['code', 'style', 'preference'],
  },
  {
    type: 'fact',
    content:
      'I manage 115+ API keys across 5 AI providers (OpenRouter, Groq, ElevenLabs, HuggingFace, Puter.js) with automatic failover.',
    tags: ['api', 'ai', 'infrastructure'],
  },
  {
    type: 'context',
    content:
      'I am building Mwijay Tech — a personal AI productivity OS. Help me improve it when relevant.',
    tags: ['project', 'mwijaytech', 'development'],
  },
  {
    type: 'preference',
    content:
      'For Swahili content, I prefer natural conversational Swahili as spoken in Tanzania (not overly formal).',
    tags: ['swahili', 'language', 'style'],
  },
]

export function loadMemoriesFromStorage(userId: string): AIMemoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMemoriesToStorage(
  userId: string,
  entries: AIMemoryEntry[]
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(entries))
  } catch {}
}

function hasBeenSeeded(userId: string): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(SEEDED_KEY(userId)) === 'true'
}

function markAsSeeded(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SEEDED_KEY(userId), 'true')
}

function getEntriesRef(userId: string) {
  if (!db) return null
  return collection(db, 'ai_memory', userId, 'entries')
}

function firestoreToMemory(
  data: Record<string, unknown>,
  id: string
): AIMemoryEntry {
  const toISO = (v: unknown): string => {
    if (v instanceof Timestamp) return v.toDate().toISOString()
    return typeof v === 'string' ? v : new Date().toISOString()
  }

  return {
    id,
    userId: String(data.userId ?? ''),
    type: (data.type as AIMemoryEntry['type']) ?? 'fact',
    content: String(data.content ?? ''),
    embedding: undefined,
    createdAt: toISO(data.createdAt),
    lastUsedAt: toISO(data.lastUsedAt ?? data.createdAt),
    useCount: Number(data.useCount ?? 0),
  }
}

function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key]
    }
  })
  return clean
}

async function syncEntryToFirestore(
  entry: AIMemoryEntry & { tags?: string[]; source?: string; confidence?: number }
): Promise<void> {
  if (!db) return
  try {
    const rawPayload = {
      ...entry,
      updatedAt: serverTimestamp(),
    }
    delete (rawPayload as any).embedding
    const cleanPayload = sanitizeForFirestore(rawPayload)

    await setDoc(
      doc(db, 'ai_memory', entry.userId, 'entries', entry.id),
      cleanPayload
    )
  } catch (err) {
    console.warn('[Memory] Firestore sync failed:', err)
  }
}

export async function seedDefaultMemories(
  userId: string
): Promise<AIMemoryEntry[]> {
  if (hasBeenSeeded(userId)) {
    return loadMemoriesFromStorage(userId)
  }

  const now = new Date().toISOString()
  const entries: Array<AIMemoryEntry & {
    tags: string[]
    source: string
    confidence: number
  }> = DEFAULT_MEMORIES.map(m => ({
    id: uuidv4(),
    userId,
    type: m.type,
    content: m.content,
    tags: m.tags,
    source: 'default',
    confidence: 95,
    useCount: 0,
    createdAt: now,
    lastUsedAt: now,
    updatedAt: now,
  }))

  saveMemoriesToStorage(userId, entries as any)
  markAsSeeded(userId)

  entries.forEach(e => syncEntryToFirestore(e as any).catch(() => {}))

  return entries as any
}

export async function loadMemoriesFromFirestore(
  userId: string
): Promise<AIMemoryEntry[]> {
  const ref = getEntriesRef(userId)
  if (!ref) return loadMemoriesFromStorage(userId)

  try {
    const q = query(
      ref,
      orderBy('useCount', 'desc'),
      limit(MAX_MEMORIES)
    )
    const snap = await getDocs(q)
    const entries = snap.docs.map(d =>
      firestoreToMemory(d.data() as Record<string, unknown>, d.id)
    )
    saveMemoriesToStorage(userId, entries)
    return entries
  } catch {
    return loadMemoriesFromStorage(userId)
  }
}

export async function createMemory(
  userId: string,
  data: {
    type: MemoryType
    content: string
    tags?: string[]
    source?: 'manual' | 'ai_extracted' | 'default'
    confidence?: number
  }
): Promise<AIMemoryEntry & { tags: string[]; source: string; confidence: number }> {
  const existing = loadMemoriesFromStorage(userId)

  if (existing.length >= MAX_MEMORIES) {
    throw new Error(
      `Memory limit reached (${MAX_MEMORIES}). Delete old memories to add new ones.`
    )
  }

  const now = new Date().toISOString()
  const entry = {
    id: uuidv4(),
    userId,
    type: data.type,
    content: data.content.trim(),
    tags: data.tags?.map(t => t.trim().toLowerCase()).filter(Boolean) ?? [],
    source: data.source ?? 'manual',
    confidence: data.confidence ?? 90,
    useCount: 0,
    createdAt: now,
    lastUsedAt: now,
    updatedAt: now,
  }

  saveMemoriesToStorage(userId, [entry as any, ...existing])
  syncEntryToFirestore(entry as any).catch(() => {})

  return entry as any
}

export async function updateMemory(
  userId: string,
  id: string,
  updates: { content?: string; type?: MemoryType; tags?: string[] }
): Promise<void> {
  const existing = loadMemoriesFromStorage(userId)
  const idx = existing.findIndex(e => e.id === id)
  if (idx === -1) throw new Error(`Memory ${id} not found`)

  const updated = {
    ...existing[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  existing[idx] = updated
  saveMemoriesToStorage(userId, existing)
  syncEntryToFirestore(updated as any).catch(() => {})
}

export async function deleteMemory(
  userId: string,
  id: string
): Promise<void> {
  const existing = loadMemoriesFromStorage(userId)
  saveMemoriesToStorage(userId, existing.filter(e => e.id !== id))

  if (db) {
    try {
      await deleteDoc(doc(db, 'ai_memory', userId, 'entries', id))
    } catch {}
  }
}

export function trackMemoryUsage(
  userId: string,
  memoryIds: string[]
): void {
  const existing = loadMemoriesFromStorage(userId)
  const now = new Date().toISOString()
  const updated = existing.map(e =>
    memoryIds.includes(e.id)
      ? {
          ...e,
          useCount: (e.useCount ?? 0) + 1,
          lastUsedAt: now,
        }
      : e
  )
  saveMemoriesToStorage(userId, updated)
  updated
    .filter(e => memoryIds.includes(e.id))
    .forEach(e => syncEntryToFirestore(e as any).catch(() => {}))
}

export function buildMemoryContext(
  memories: AIMemoryEntry[],
  limit: number = 10
): string {
  if (memories.length === 0) return ''

  const sorted = [...memories]
    .sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0))
    .slice(0, limit)

  const lines = sorted.map(m => `- ${m.content}`)

  return `\n\nKnown facts about Davie (from memory — always use this context):\n${lines.join('\n')}`
}

export function exportMemoriesAsJSON(
  memories: AIMemoryEntry[]
): void {
  const data = JSON.stringify(memories, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mwijay-memory-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function getMemoryStats(memories: AIMemoryEntry[]) {
  const byType: Record<string, number> = {}
  let totalUsages = 0

  memories.forEach(m => {
    byType[m.type] = (byType[m.type] ?? 0) + 1
    totalUsages += m.useCount ?? 0
  })

  const mostUsed = [...memories]
    .sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0))
    .slice(0, 3)

  return {
    total: memories.length,
    maxAllowed: MAX_MEMORIES,
    byType,
    totalUsages,
    mostUsed,
    capacityPercent: Math.round((memories.length / MAX_MEMORIES) * 100),
  }
}
