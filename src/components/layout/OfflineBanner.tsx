'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, X } from 'lucide-react'
import { useElectron } from '@/hooks/use-electron'
import { cn } from '@/lib/utils'

export function OfflineBanner() {
  const { isOnline } = useElectron()
  const [dismissed, setDismissed] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setDismissed(false)
      setWasOffline(true)
    } else if (wasOffline && isOnline) {
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  const showOffline = !isOnline && !dismissed
  const showOnline = showReconnected

  if (!showOffline && !showOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] pointer-events-none">
      <AnimatePresence>
        {showOffline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 mx-4 mt-2 rounded-xl bg-red-500/90 backdrop-blur-md border border-red-500/50 shadow-xl'
            )}
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-white flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Offline Mode</p>
                <p className="text-[10px] text-white/80">
                  AI features unavailable · Vault, todos, spending work offline
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {showOnline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={cn(
              'pointer-events-auto flex items-center gap-2 px-4 py-2.5 mx-4 mt-2 rounded-xl bg-emerald-500/90 backdrop-blur-md border border-emerald-500/50 shadow-xl'
            )}
          >
            <Wifi className="w-4 h-4 text-white flex-shrink-0" />
            <p className="text-xs font-bold text-white">
              🟢 Back online — AI features restored!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OfflineBanner
