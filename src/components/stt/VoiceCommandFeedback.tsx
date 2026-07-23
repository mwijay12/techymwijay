'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { describeCommand, type ParsedVoiceCommand } from '@/lib/voice-commands'

interface VoiceCommandFeedbackProps {
  command: ParsedVoiceCommand | null
  onDismiss: () => void
}

export function VoiceCommandFeedback({
  command,
  onDismiss,
}: VoiceCommandFeedbackProps) {
  if (!command || command.type === 'none') return null

  const description = describeCommand(command)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-md bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-xl border border-purple-500/30 p-4 rounded-2xl shadow-2xl text-white flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Voice Command Detected
            </p>
            <p className="text-xs text-white font-medium mt-0.5">
              {description}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceCommandFeedback
