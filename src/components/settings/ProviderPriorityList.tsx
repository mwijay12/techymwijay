'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIProviderId } from '@/lib/ai-provider-catalog'
import { getProviderById } from '@/lib/ai-provider-catalog'

interface ProviderPriorityListProps {
  priority: AIProviderId[]
  onChange: (newPriority: AIProviderId[]) => void
}

export default function ProviderPriorityList({
  priority,
  onChange,
}: ProviderPriorityListProps) {
  const moveUp = (index: number) => {
    if (index === 0) return
    const newPriority = [...priority]
    ;[newPriority[index - 1], newPriority[index]] = [
      newPriority[index],
      newPriority[index - 1],
    ]
    onChange(newPriority)
  }

  const moveDown = (index: number) => {
    if (index === priority.length - 1) return
    const newPriority = [...priority]
    ;[newPriority[index], newPriority[index + 1]] = [
      newPriority[index + 1],
      newPriority[index],
    ]
    onChange(newPriority)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">
        Provider Priority Order
      </label>
      <p className="text-xs text-gray-500">
        Drag or use arrows to reorder. First provider with a valid key will be used as fallback.
      </p>
      <div className="space-y-1.5">
        {priority.map((providerId, index) => {
          const provider = getProviderById(providerId)
          if (!provider) return null

          return (
            <motion.div
              key={providerId}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
                index === 0
                  ? 'border-purple-500/20 bg-purple-500/5'
                  : 'border-white/5 bg-white/[0.02]'
              )}
            >
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className={cn(
                    'p-0.5 rounded transition-colors',
                    index === 0
                      ? 'text-gray-700 cursor-not-allowed'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  )}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === priority.length - 1}
                  className={cn(
                    'p-0.5 rounded transition-colors',
                    index === priority.length - 1
                      ? 'text-gray-700 cursor-not-allowed'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  )}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <span className="text-xs font-mono text-gray-600 w-4">
                {index + 1}
              </span>

              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: provider.colorToken }}
              />

              <span className="text-sm text-gray-300 flex-1">
                {provider.label}
              </span>

              {index === 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Primary
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}