'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clipboard, X, Shield, Code2, Link, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVault } from '@/hooks/use-vault'
import { useAuth } from '@/components/auth/AuthProvider'

interface ClipboardContent {
  type: 'url' | 'code' | 'text'
  content: string
}

export function ClipboardWatcher() {
  const { user } = useAuth()
  const { addItem } = useVault()
  const [detected, setDetected] = useState<ClipboardContent | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isElectron =
    typeof window !== 'undefined' && !!window.electronAPI?.isElectron

  useEffect(() => {
    if (!isElectron || !window.electronAPI?.onClipboardDetected) return

    const cleanup = window.electronAPI.onClipboardDetected((data) => {
      if (data && user) {
        setDetected(data)
        setSaved(false)
      }
    })

    return cleanup
  }, [isElectron, user])

  const handleSaveToVault = useCallback(async () => {
    if (!detected || !user) return

    setIsSaving(true)
    try {
      const category =
        detected.type === 'code'
          ? 'code'
          : detected.type === 'url'
          ? 'notes'
          : 'notes'

      const title =
        detected.type === 'url'
          ? `Link: ${new URL(detected.content).hostname}`
          : detected.type === 'code'
          ? `Code snippet — ${new Date().toLocaleDateString('sw-TZ')}`
          : `Clipboard note — ${new Date().toLocaleDateString('sw-TZ')}`

      await addItem({
        title,
        category,
        content:
          detected.type === 'url'
            ? `Saved from clipboard: ${detected.content}`
            : 'Clipboard snippet',
        secretContent:
          detected.type === 'code' ? detected.content : undefined,
        tags: ['clipboard', detected.type],
      })

      setSaved(true)
      setTimeout(() => {
        setDetected(null)
        setSaved(false)
      }, 2000)
    } finally {
      setIsSaving(false)
    }
  }, [detected, user, addItem])

  const handleDismiss = () => {
    setDetected(null)
    setSaved(false)
  }

  if (!detected || !isElectron) return null

  const typeConfig = {
    url: { icon: <Link className="w-3.5 h-3.5" />, label: 'URL detected', color: 'text-purple-400' },
    code: { icon: <Code2 className="w-3.5 h-3.5" />, label: 'Code detected', color: 'text-blue-400' },
    text: { icon: <Clipboard className="w-3.5 h-3.5" />, label: 'Text detected', color: 'text-gray-400' },
  }

  const config = typeConfig[detected.type]

  return (
    <AnimatePresence>
      {detected && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-24 right-6 z-[180] w-72 glass-strong rounded-2xl border border-brand-border shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-brand-border/50">
            <div className={cn('flex-shrink-0', config.color)}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-text">
                {config.label}
              </p>
              <p className="text-[10px] text-brand-muted">Save to vault?</p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-brand-muted hover:text-brand-text transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-3 py-2">
            <p className="text-[10px] text-brand-muted font-mono truncate bg-brand-surface rounded px-2 py-1">
              {detected.content.slice(0, 80)}
              {detected.content.length > 80 ? '...' : ''}
            </p>
          </div>

          <div className="flex gap-2 px-3 pb-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-medium glass border border-brand-border text-brand-muted hover:text-brand-text transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={handleSaveToVault}
              disabled={isSaving || saved}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all',
                saved
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-brand-primary text-white hover:bg-brand-primary/90'
              )}
            >
              {saved ? (
                <>
                  <Check className="w-3 h-3" />
                  Saved!
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3" />
                  {isSaving ? 'Saving...' : 'Save to Vault'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ClipboardWatcher
