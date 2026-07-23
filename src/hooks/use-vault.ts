'use client'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import Fuse from 'fuse.js'
import {
  createVaultItem,
  updateVaultItem,
  deleteVaultItem,
  togglePinVaultItem,
  getVaultItems,
  getAllTags,
} from '@/lib/vault-service'
import { useAuth } from '@/components/auth/AuthProvider'
import type { VaultItem, VaultCategory } from '@/types/vault'

export type VaultSortOption =
  | 'newest'
  | 'oldest'
  | 'alphabetical'
  | 'pinned'

export interface VaultFilter {
  category: VaultCategory | 'all'
  tag: string | null
  search: string
  sort: VaultSortOption
  showExpired: boolean
}

export interface UseVaultReturn {
  items: VaultItem[]
  filteredItems: VaultItem[]
  allTags: string[]
  isLoading: boolean
  error: string | null

  filter: VaultFilter
  setFilter: (updates: Partial<VaultFilter>) => void
  resetFilter: () => void

  addItem: (
    data: Parameters<typeof createVaultItem>[1],
    masterPassword?: string | null
  ) => Promise<VaultItem>
  editItem: (
    id: string,
    updates: Parameters<typeof updateVaultItem>[2],
    masterPassword?: string | null
  ) => Promise<VaultItem>
  removeItem: (id: string) => Promise<void>
  pinItem: (id: string) => Promise<void>

  countByCategory: Record<string, number>
  totalItems: number
}

const DEFAULT_FILTER: VaultFilter = {
  category: 'all',
  tag: null,
  search: '',
  sort: 'newest',
  showExpired: false,
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',   weight: 0.5 },
    { name: 'content', weight: 0.3 },
    { name: 'tags',    weight: 0.2 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
}

export function useVault(): UseVaultReturn {
  const { user } = useAuth()
  const [items, setItems] = useState<VaultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilterState] = useState<VaultFilter>(DEFAULT_FILTER)

  useEffect(() => {
    const targetUid = user?.uid || 'guest-user'

    setIsLoading(true)
    getVaultItems(targetUid)
      .then(setItems)
      .catch(err => {
        setError('Failed to load vault items')
        console.warn('[useVault] Load error:', err)
      })
      .finally(() => setIsLoading(false))
  }, [user?.uid])

  const setFilter = useCallback((updates: Partial<VaultFilter>) => {
    setFilterState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER)
  }, [])

  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items])

  const filteredItems = useMemo(() => {
    let result = [...items]

    if (filter.search.trim().length >= 2) {
      const searchResults = fuse.search(filter.search)
      result = searchResults.map(r => r.item)
    }

    if (filter.category !== 'all') {
      result = result.filter(i => i.category === filter.category)
    }

    if (filter.tag) {
      result = result.filter(i => (i.tags || []).includes(filter.tag!))
    }

    if (!filter.showExpired) {
      result = result.filter(i => {
        if (!i.expiresAt) return true
        return new Date(i.expiresAt) > new Date()
      })
    }

    result.sort((a, b) => {
      if (filter.sort === 'pinned') {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
      }

      switch (filter.sort) {
        case 'newest':
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          )
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        case 'pinned':
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          )
        default:
          return 0
      }
    })

    return result
  }, [items, filter, fuse])

  const addItem = useCallback(
    async (
      data: Parameters<typeof createVaultItem>[1],
      masterPassword?: string | null
    ) => {
      const targetUid = user?.uid || 'guest-user'
      const newItem = await createVaultItem(targetUid, data, masterPassword)
      setItems(prev => [newItem, ...prev])
      return newItem
    },
    [user?.uid]
  )

  const editItem = useCallback(
    async (
      id: string,
      updates: Parameters<typeof updateVaultItem>[2],
      masterPassword?: string | null
    ) => {
      const targetUid = user?.uid || 'guest-user'
      const updated = await updateVaultItem(targetUid, id, updates, masterPassword)
      setItems(prev => prev.map(i => (i.id === id ? updated : i)))
      return updated
    },
    [user?.uid]
  )

  const removeItem = useCallback(
    async (id: string) => {
      const targetUid = user?.uid || 'guest-user'
      await deleteVaultItem(targetUid, id)
      setItems(prev => prev.filter(i => i.id !== id))
    },
    [user?.uid]
  )

  const pinItem = useCallback(
    async (id: string) => {
      const targetUid = user?.uid || 'guest-user'
      const updated = await togglePinVaultItem(targetUid, id)
      setItems(prev => prev.map(i => (i.id === id ? updated : i)))
    },
    [user?.uid]
  )

  const allTags = useMemo(() => getAllTags(items), [items])

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: items.length,
      passwords: 0,
      code: 0,
      keys: 0,
      notes: 0,
    }
    items.forEach(item => {
      counts[item.category] = (counts[item.category] ?? 0) + 1
    })
    return counts
  }, [items])

  return {
    items,
    filteredItems,
    allTags,
    isLoading,
    error,
    filter,
    setFilter,
    resetFilter,
    addItem,
    editItem,
    removeItem,
    pinItem,
    countByCategory,
    totalItems: items.length,
  }
}
