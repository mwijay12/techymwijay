'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

export function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-amber-900/90 to-yellow-900/90 backdrop-blur-md border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Hakuna mtandao. Local features (Vault, Todos, Spending) are fully accessible!
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-amber-300/80 shrink-0">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Vault & Todos
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> AI Chat Paused
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
