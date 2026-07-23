'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

export function UpdatePrompt() {
  const { updateAvailable, applyUpdate, dismissUpdate } = usePWA()

  if (!updateAvailable) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-4 z-50 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-4 shadow-2xl max-w-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-md">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                New Version Available!
              </h4>
              <p className="text-xs text-indigo-200">
                Update Mwijay Tech to get the latest features.
              </p>
            </div>
          </div>

          <button
            onClick={dismissUpdate}
            className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={applyUpdate}
            className="flex-1 py-1.5 px-3 bg-white text-indigo-950 font-bold text-xs rounded-xl shadow hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Update Now
          </button>

          <button
            onClick={dismissUpdate}
            className="py-1.5 px-3 bg-white/10 text-white font-medium text-xs rounded-xl hover:bg-white/20 transition-colors"
          >
            Later
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
