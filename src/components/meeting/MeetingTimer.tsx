'use client'

import { motion } from 'framer-motion'

type Props = {
  elapsedSeconds: number
  isActive: boolean
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function MeetingTimer({ elapsedSeconds, isActive }: Props) {
  return (
    <div className="flex items-center gap-2">
      {isActive && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2.5 h-2.5 rounded-full bg-red-500"
        />
      )}
      <span className="font-mono text-lg font-semibold text-white/90 tabular-nums">
        {formatTime(elapsedSeconds)}
      </span>
    </div>
  )
}