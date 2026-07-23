'use client'

import { formatCurrencyShort } from '@/lib/spending-service'
import type { SupportedCurrency } from '@/types/spending'

interface SpendingBarChartProps {
  byDay: Record<string, number>
  currency: SupportedCurrency
}

export function SpendingBarChart({
  byDay,
  currency,
}: SpendingBarChartProps) {
  const days = Object.keys(byDay).sort()
  const values = days.map(d => byDay[d])
  const maxVal = Math.max(...values, 1)

  if (days.length === 0) return null

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">
          Daily Breakdown — Matumizi kwa Siku
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          Peak: {formatCurrencyShort(maxVal, currency)}
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-1 pt-6 pb-2 border-b border-white/10">
        {days.map((dayStr) => {
          const val = byDay[dayStr]
          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0
          const dayNum = parseInt(dayStr.split('-')[2], 10)

          return (
            <div
              key={dayStr}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              {val > 0 && (
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/90 text-white text-[10px] font-mono px-2 py-1 rounded-md border border-white/20 whitespace-nowrap z-20 pointer-events-none">
                  Day {dayNum}: {formatCurrencyShort(val, currency)}
                </div>
              )}

              <div
                className="w-full max-w-[14px] rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                style={{
                  height: `${Math.max(heightPct, val > 0 ? 6 : 2)}%`,
                  backgroundColor: val > 0 ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-[10px] text-gray-500 font-mono">
        <span>Day 1</span>
        <span>Day 15</span>
        <span>Day {days.length}</span>
      </div>
    </div>
  )
}

export default SpendingBarChart
