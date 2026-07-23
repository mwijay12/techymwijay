'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useSync } from '@/hooks/use-sync'
import { cn } from '@/lib/utils'

export function SyncStatusBadge() {
  const { syncState, isSyncing, isOnline, pendingCount, triggerSync } =
    useSync()
  const [showTooltip, setShowTooltip] = useState(false)

  const getStatusIcon = () => {
    if (!isOnline) {
      return <CloudOff className="w-3.5 h-3.5 text-amber-400" />
    }
    if (isSyncing) {
      return <RefreshCw className="w-3.5 h-3.5 text-brand-primary animate-spin" />
    }
    if (syncState.status === 'error') {
      return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
    }
    if (pendingCount > 0) {
      return <Clock className="w-3.5 h-3.5 text-amber-400" />
    }
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (isSyncing) return 'Syncing...'
    if (syncState.status === 'error') return 'Sync Error'
    if (pendingCount > 0) return `${pendingCount} Pending`
    return 'Synced'
  }

  const getBadgeColor = () => {
    if (!isOnline)
      return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    if (isSyncing)
      return 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
    if (syncState.status === 'error')
      return 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    if (pendingCount > 0)
      return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => triggerSync()}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-90',
          getBadgeColor()
        )}

      >
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 top-full mt-2 w-56 p-3 bg-brand-card/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-50 text-xs space-y-2 pointer-events-none"
          >
            <div className="flex items-center justify-between font-bold text-white border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-brand-primary" />
                Firestore Cloud Sync
              </span>
              <span className="text-[10px] text-gray-400">
                {isOnline ? 'Online 🟢' : 'Offline 🔴'}
              </span>
            </div>

            <div className="space-y-1 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-semibold text-white">
                  {getStatusText()}
                </span>
              </div>
              {pendingCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Queue:</span>
                  <span className="font-semibold text-amber-400">
                    {pendingCount} writes pending
                  </span>
                </div>
              )}
              {syncState.lastSyncedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Sync:</span>
                  <span className="text-gray-300">
                    {new Date(syncState.lastSyncedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 italic border-t border-white/10 pt-1.5">
              Click badge to trigger manual sync replay.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
