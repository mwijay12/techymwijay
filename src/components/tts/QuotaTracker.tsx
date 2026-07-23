'use client'

import { Zap, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuotaTrackerProps {
  totalCharsAvailable: number
  totalCharsUsed: number
  className?: string
}

export function QuotaTracker({
  totalCharsAvailable,
  totalCharsUsed,
  className,
}: QuotaTrackerProps) {
  const percentUsed = Math.min(
    100,
    Math.round((totalCharsUsed / (totalCharsAvailable || 170_000)) * 100)
  )

  const isLow = percentUsed >= 80

  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-2',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">
              ElevenLabs Key Pool Quota
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">
              17 free keys pool · 170,000 chars/month total
            </p>
          </div>
        </div>

        <span className="text-xs font-bold font-mono text-purple-400">
          {percentUsed}% Used
        </span>
      </div>

      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isLow
              ? 'bg-gradient-to-r from-amber-500 to-red-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          )}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
        <span>Used: {totalCharsUsed.toLocaleString()} chars</span>
        <span>
          Available: {(totalCharsAvailable - totalCharsUsed).toLocaleString()} chars
        </span>
      </div>
    </div>
  )
}

export default QuotaTracker
