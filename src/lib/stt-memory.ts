// Persistent memory for Speech-to-Text transcriptions
// Saves to localStorage with automatic backup

export interface MemoryEntry {
  id: string
  text: string
  translatedText?: string
  source: 'microphone' | 'file'
  fileName?: string
  duration?: number
  timestamp: number
  language: string
  tags?: string[]
  favorite?: boolean
}

const STORAGE_KEY = 'mwj-stt-memory'
const MAX_ENTRIES = 500

export function loadMemory(): MemoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function saveMemory(entries: MemoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch (e) {
    // If storage is full, remove oldest entries
    try {
      const trimmed = entries.slice(0, 100)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch {}
  }
}

export function addEntry(entry: Omit<MemoryEntry, 'id'>): MemoryEntry {
  const newEntry: MemoryEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
  }
  const memory = loadMemory()
  memory.unshift(newEntry)
  saveMemory(memory)
  return newEntry
}

export function deleteEntry(id: string): void {
  const memory = loadMemory()
  saveMemory(memory.filter(e => e.id !== id))
}

export function toggleFavorite(id: string): void {
  const memory = loadMemory()
  const entry = memory.find(e => e.id === id)
  if (entry) {
    entry.favorite = !entry.favorite
    saveMemory(memory)
  }
}

export function exportMemory(): string {
  const memory = loadMemory()
  return JSON.stringify(memory, null, 2)
}

export function exportAsText(): string {
  const memory = loadMemory()
  return memory.map(e => 
    `[${new Date(e.timestamp).toLocaleString()}] (${e.language})\n${e.text}${e.translatedText ? `\n→ ${e.translatedText}` : ''}\n`
  ).join('\n---\n\n')
}

export function clearMemory(): void {
  localStorage.removeItem(STORAGE_KEY)
}