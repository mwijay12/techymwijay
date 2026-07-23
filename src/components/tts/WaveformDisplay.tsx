'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WaveformDisplayProps {
  isPlaying: boolean
  className?: string
  barCount?: number
}

export function WaveformDisplay({
  isPlaying,
  className,
  barCount = 36,
}: WaveformDisplayProps) {
  return (
    <div className={cn('w-full flex items-center justify-center gap-1 py-4', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            isPlaying
              ? {
                  scaleY: [0.2, 1, 0.3, 0.8, 0.2],
                  opacity: [0.4, 1, 0.5, 0.9, 0.4],
                }
              : { scaleY: 0.15, opacity: 0.2 }
          }
          transition={
            isPlaying
              ? {
                  repeat: Infinity,
                  duration: 1.2,
                  delay: (i % 6) * 0.15,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
          className="w-1.5 h-16 rounded-full bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 origin-center"
        />
      ))}
    </div>
  )
}

export default WaveformDisplay
