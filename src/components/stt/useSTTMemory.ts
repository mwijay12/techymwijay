'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  loadMemory,
  addEntry,
  deleteEntry,
  toggleFavorite,
  exportAsText,
  clearMemory,
  type MemoryEntry,
} from '@/lib/stt-memory'
import { useAuth } from '@/contexts/AuthContext'
import { syncMemory } from '@/lib/sync-engine'
import { useFirestoreSync } from '@/hooks/use-firestore-sync'

type UseSTTMemoryReturn = {
  entries: MemoryEntry[]
  loading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  filteredEntries: MemoryEntry[]
  save: (text: string, language: string, source: 'microphone' | 'file', translatedText?: string, duration?: number, fileName?: string) => void
  remove: (id: string) => void
  favorite: (id: string) => void
  exportAll: () => void
  clearAll: () => void
  refresh: () => void
  currentEntryId: string | null
  setCurrentEntryId: (id: string | null) => void
}

export function useSTTMemory(): UseSTTMemoryReturn {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null)
  const { user } = useAuth()

  // Real-time sync from Firestore — when online, this merges cloud data
  useFirestoreSync({
    onMemoryUpdate: (firestoreEntries) => {
      // Merge: Firestore is source of truth when online
      setEntries(firestoreEntries)
    },
  })

  const refresh = useCallback(() => {
    const local = loadMemory()
    setEntries(local)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(
    (text: string, language: string, source: 'microphone' | 'file', translatedText?: string, duration?: number, fileName?: string) => {
      const entry = addEntry({
        text,
        translatedText,
        source,
        fileName,
        duration,
        timestamp: Date.now(),
        language,
      })
      // Sync to Firestore — fire-and-forget
      syncMemory.save(user?.uid ?? null, entry)
      setCurrentEntryId(entry.id)
      refresh()
    },
    [refresh, user?.uid]
  )

  const remove = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id)
      deleteEntry(id)
      // Sync deletion to Firestore
      if (entry) syncMemory.delete(user?.uid ?? null, id)
      refresh()
    },
    [refresh, user?.uid, entries]
  )

  const favorite = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id)
      const newFav = !entry?.favorite
      toggleFavorite(id)
      // Sync favorite toggle to Firestore
      syncMemory.toggleFavorite(user?.uid ?? null, id, newFav)
      refresh()
    },
    [refresh, user?.uid, entries]
  )

  const exportAll = useCallback(() => {
    const text = exportAsText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mwj-memory-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const clearAll = useCallback(() => {
    if (confirm('Una uhakika unataka kufuta kumbukumbu zote?')) {
      clearMemory()
      setEntries([])
    }
  }, [])

  const filteredEntries = entries.filter(
    (e) =>
      !searchQuery ||
      e.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.translatedText?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    entries,
    loading,
    searchQuery,
    setSearchQuery,
    filteredEntries,
    save,
    remove,
    favorite,
    exportAll,
    clearAll,
    refresh,
    currentEntryId,
    setCurrentEntryId,
  }
}