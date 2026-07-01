'use client'

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface AudioVisualizerProps {
  isPlaying: boolean
  color?: string
  barCount?: number
}

export default function AudioVisualizer({ isPlaying, color = "from-purple-500 to-blue-500", barCount = 32 }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="flex items-end justify-center gap-[2px] h-16 w-full">
      {Array.from({ length: barCount }).map((_, i) => {
        const height = isPlaying ? 20 + Math.sin(i * 1.5) * 15 + Math.random() * 15 : 4
        return (
          <motion.div
            key={i}
            className={`w-1.5 rounded-full bg-gradient-to-t ${color} opacity-80`}
            animate={{
              height: isPlaying 
                ? [4, 8 + Math.sin(i * 0.5 + Date.now() * 0.001) * 12 + Math.random() * 8, 4]
                : [4, 4],
            }}
            transition={{
              duration: 0.3 + Math.random() * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.02,
            }}
          />
        )
      })}
    </div>
  )
}