'use client'

import { motion } from 'framer-motion'

export function TypingIndicator({ provider }: { provider?: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
        <span className="text-xs">🤖</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400/60"
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        {provider && (
          <span className="text-[10px] text-white/30">via {provider}</span>
        )}
      </div>
    </div>
  )
}