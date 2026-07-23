'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Share, PlusSquare } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

export function InstallPrompt() {
  const { isInstalled, isInstallable, isIOSSafari, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('mwijay_pwa_prompt_dismissed')
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('mwijay_pwa_prompt_dismissed', 'true')
  }

  if (isInstalled || dismissed) return null
  if (!isInstallable && !isIOSSafari) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-brand-card/95 backdrop-blur-xl border border-brand-primary/30 rounded-2xl p-4 shadow-2xl shadow-black/60"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-primary/30">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Install Mwijay Tech
                <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded-full border border-brand-primary/30">
                  PWA
                </span>
              </h4>
              <p className="text-xs text-gray-400">
                Install as a native app — works offline 🇹🇿
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action button */}
        <div className="mt-3.5 flex items-center gap-2">
          {isInstallable ? (
            <button
              onClick={installApp}
              className="flex-1 py-2 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/30 transition-all hover:scale-[1.02]"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          ) : (
            <button
              onClick={() => setShowIOSGuide(!showIOSGuide)}
              className="flex-1 py-2 px-4 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary font-semibold text-xs rounded-xl border border-brand-primary/30 flex items-center justify-center gap-2 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              {showIOSGuide ? 'Hide Instructions' : 'How to Install on iOS'}
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-xs rounded-xl border border-white/10 transition-colors"
          >
            Not Now
          </button>
        </div>

        {/* iOS Safari Instructions */}
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs text-gray-300"
          >
            <div className="flex items-center gap-2">
              <Share className="w-4 h-4 text-brand-primary shrink-0" />
              <span>1. Tap the <strong>Share</strong> button in Safari toolbar</span>
            </div>
            <div className="flex items-center gap-2">
              <PlusSquare className="w-4 h-4 text-brand-primary shrink-0" />
              <span>2. Scroll down & tap <strong>Add to Home Screen</strong></span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
