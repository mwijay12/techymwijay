'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  type: 'success' | 'error'
  message: string
}

interface SettingsToastProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function SettingsToast({ toasts, onDismiss }: SettingsToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl min-w-[260px]',
              'bg-black/90 backdrop-blur-xl border pointer-events-auto',
              toast.type === 'success'
                ? 'border-emerald-500/30 text-emerald-400'
                : 'border-red-500/30 text-red-400'
            )}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}

            <span className="text-sm text-white flex-1 font-medium">
              {toast.message}
            </span>

            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, addToast, dismiss }
}

export default SettingsToast
