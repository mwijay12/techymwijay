'use client'

import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useAppState } from '@/hooks/use-app-state'
import { useSync } from '@/hooks/use-sync'

export function SyncStatus() {
  const { user, isOnline, isSyncing, pendingWrites, syncState } = useAppState()
  const { triggerSync } = useSync()

  if (!user) return null

  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 text-xs font-medium text-amber-400 cursor-pointer"
        title="Offline mode active — changes stored locally"
      >
        <CloudOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    )
  }

  if (isSyncing) {
    return (
      <div
        className="flex items-center gap-1.5 text-xs font-medium text-brand-primary"
        title="Syncing with Firestore..."
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Syncing...</span>
      </div>
    )
  }

  if (syncState.status === 'error') {
    return (
      <button
        onClick={() => triggerSync()}
        className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:underline"
        title={syncState.errorMessage || 'Sync error — click to retry'}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sync Error</span>
      </button>
    )
  }

  if (pendingWrites > 0) {
    return (
      <button
        onClick={() => triggerSync()}
        className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:underline"
        title={`${pendingWrites} writes pending — click to sync`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{pendingWrites} Pending</span>
      </button>
    )
  }

  return (
    <div
      className="flex items-center gap-1.5 text-xs font-medium text-emerald-400"
      title="All changes synced to Firestore Cloud"
    >
      <CheckCircle className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Synced</span>
    </div>
  )
}