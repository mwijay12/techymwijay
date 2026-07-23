'use client'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import {
  seedDefaultMemories,
  loadMemoriesFromStorage,
  loadMemoriesFromFirestore,
  createMemory,
  updateMemory,
  deleteMemory,
  buildMemoryContext,
  exportMemoriesAsJSON,
  getMemoryStats,
  type MemoryType,
} from '@/lib/memory-service'
import { useAuth } from '@/components/auth/AuthProvider'
import type { AIMemoryEntry } from '@/types/ai'

export interface UseMemoryReturn {
  memories: AIMemoryEntry[]
  filteredMemories: AIMemoryEntry[]
  stats: ReturnType<typeof getMemoryStats>
  memoryContext: string
  isLoading: boolean
  error: string | null

  filterType: MemoryType | 'all'
  searchQuery: string
  setFilterType: (type: MemoryType | 'all') => void
  setSearchQuery: (q: string) => void

  addMemory: (data: {
    type: MemoryType
    content: string
    tags?: string[]
    source?: 'manual' | 'ai_extracted' | 'default'
    confidence?: number
  }) => Promise<AIMemoryEntry>
  editMemory: (
    id: string,
    updates: { content?: string; type?: MemoryType; tags?: string[] }
  ) => Promise<void>
  removeMemory: (id: string) => Promise<void>
  exportMemories: () => void
  refreshFromFirestore: () => Promise<void>
}

export function useMemory(): UseMemoryReturn {
  const { user } = useAuth()
  const [memories, setMemories] = useState<AIMemoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<MemoryType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user?.uid) {
      setMemories([])
      setIsLoading(false)
      return
    }

    const init = async () => {
      setIsLoading(true)
      try {
        const seeded = await seedDefaultMemories(user.uid)
        const local = loadMemoriesFromStorage(user.uid)
        setMemories(local.length > 0 ? local : seeded)

        if (navigator.onLine) {
          loadMemoriesFromFirestore(user.uid)
            .then(firestoreMemories => {
              if (firestoreMemories.length > 0) {
                setMemories(firestoreMemories)
              }
            })
            .catch(() => {})
        }
      } catch (err) {
        setError('Failed to load memories')
        console.warn('[Memory] Init error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [user?.uid])

  const filteredMemories = useMemo(() => {
    let result = [...memories]

    if (filterType !== 'all') {
      result = result.filter(m => m.type === filterType)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(m =>
        m.content.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0))

    return result
  }, [memories, filterType, searchQuery])

  const memoryContext = useMemo(
    () => buildMemoryContext(memories),
    [memories]
  )

  const stats = useMemo(() => getMemoryStats(memories), [memories])

  const addMemory = useCallback(
    async (data: Parameters<typeof createMemory>[1]) => {
      if (!user?.uid) throw new Error('Not authenticated')
      const entry = await createMemory(user.uid, data)
      setMemories(prev => [entry as unknown as AIMemoryEntry, ...prev])
      return entry as unknown as AIMemoryEntry
    },
    [user?.uid]
  )

  const editMemory = useCallback(
    async (
      id: string,
      updates: Parameters<typeof updateMemory>[2]
    ) => {
      if (!user?.uid) throw new Error('Not authenticated')
      await updateMemory(user.uid, id, updates)
      setMemories(prev =>
        prev.map(m =>
          m.id === id
            ? { ...m, ...updates, updatedAt: new Date().toISOString() }
            : m
        )
      )
    },
    [user?.uid]
  )

  const removeMemory = useCallback(
    async (id: string) => {
      if (!user?.uid) throw new Error('Not authenticated')
      await deleteMemory(user.uid, id)
      setMemories(prev => prev.filter(m => m.id !== id))
    },
    [user?.uid]
  )

  const exportMemories = useCallback(() => {
    exportMemoriesAsJSON(memories)
  }, [memories])

  const refreshFromFirestore = useCallback(async () => {
    if (!user?.uid) return
    setIsLoading(true)
    try {
      const fresh = await loadMemoriesFromFirestore(user.uid)
      setMemories(fresh)
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid])

  return {
    memories,
    filteredMemories,
    stats,
    memoryContext,
    isLoading,
    error,
    filterType,
    searchQuery,
    setFilterType,
    setSearchQuery,
    addMemory,
    editMemory,
    removeMemory,
    exportMemories,
    refreshFromFirestore,
  }
}
