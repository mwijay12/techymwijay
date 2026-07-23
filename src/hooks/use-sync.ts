'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadSyncState,
  saveSyncState,
  DEFAULT_SYNC_STATE,
  type SyncState,
} from '@/lib/firestore-sync'
import {
  replayQueue,
  getPendingCount,
} from '@/lib/sync-queue'
import { useAuth } from '@/components/auth/AuthProvider'

export interface UseSyncReturn {
  syncState: SyncState
  isSyncing: boolean
  isOnline: boolean
  pendingCount: number

  triggerSync: () => Promise<void>
  markSyncing: () => void
  markSynced: () => void
  markError: (error: string) => void
  markOffline: () => void
}

export function useSync(): UseSyncReturn {
  const { user } = useAuth()
  const [syncState, setSyncState] = useState<SyncState>(DEFAULT_SYNC_STATE)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const syncInProgress = useRef(false)

  useEffect(() => {
    const state = loadSyncState()
    setSyncState(state)
    setIsOnline(navigator.onLine)
    setPendingCount(getPendingCount())
  }, [])

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      saveSyncState({ isOnline: true })

      if (user?.uid && !syncInProgress.current) {
        await triggerSync()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncState(prev => ({ ...prev, status: 'offline', isOnline: false }))
      saveSyncState({ status: 'offline', isOnline: false })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const handleSWSync = async () => {
      if (user?.uid) await triggerSync()
    }
    window.addEventListener('mwijay-replay-sync', handleSWSync)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('mwijay-replay-sync', handleSWSync)
    }
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return

    const interval = setInterval(async () => {
      const currentCount = getPendingCount()
      setPendingCount(currentCount)

      if (currentCount > 0 && navigator.onLine && !syncInProgress.current) {
        await triggerSync()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user?.uid])

  const triggerSync = useCallback(async () => {
    if (!user?.uid || syncInProgress.current || !navigator.onLine) return

    syncInProgress.current = true
    const newState: SyncState = {
      ...loadSyncState(),
      status: 'syncing',
      isOnline: true,
    }
    setSyncState(newState)
    saveSyncState(newState)

    try {
      const result = await replayQueue(user.uid)
      const count = result.remaining
      setPendingCount(count)

      const finalState: SyncState = {
        status: count > 0 ? 'pending' : 'synced',
        lastSyncedAt: new Date().toISOString(),
        pendingWrites: count,
        errorMessage: result.failed > 0
          ? `${result.failed} item(s) failed to sync`
          : null,
        isOnline: true,
      }

      setSyncState(finalState)
      saveSyncState(finalState)
    } catch (err) {
      const errorState: SyncState = {
        ...loadSyncState(),
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Sync failed',
      }
      setSyncState(errorState)
      saveSyncState(errorState)
    } finally {
      syncInProgress.current = false
    }
  }, [user?.uid])

  const markSyncing = useCallback(() => {
    const state = { ...loadSyncState(), status: 'syncing' as const }
    setSyncState(state)
    saveSyncState(state)
  }, [])

  const markSynced = useCallback(() => {
    const state: SyncState = {
      ...loadSyncState(),
      status: 'synced',
      lastSyncedAt: new Date().toISOString(),
      pendingWrites: 0,
      errorMessage: null,
    }
    setSyncState(state)
    saveSyncState(state)
    setPendingCount(0)
  }, [])

  const markError = useCallback((error: string) => {
    const state: SyncState = {
      ...loadSyncState(),
      status: 'error',
      errorMessage: error,
    }
    setSyncState(state)
    saveSyncState(state)
  }, [])

  const markOffline = useCallback(() => {
    const state: SyncState = {
      ...loadSyncState(),
      status: 'offline',
      isOnline: false,
    }
    setSyncState(state)
    saveSyncState(state)
    setIsOnline(false)
  }, [])

  return {
    syncState,
    isSyncing: syncState.status === 'syncing',
    isOnline,
    pendingCount,
    triggerSync,
    markSyncing,
    markSynced,
    markError,
    markOffline,
  }
}
