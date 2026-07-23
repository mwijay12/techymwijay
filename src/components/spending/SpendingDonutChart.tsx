'use client'

import { CATEGORY_CONFIG, type SpendingCategory, type SupportedCurrency } from '@/types/spending'
import { formatCurrencyShort } from '@/lib/spending-service'

interface SpendingDonutChartProps {
  byCategory: Record<SpendingCategory, number>
  totalAmount: number
  currency: SupportedCurrency
}

export function SpendingDonutChart({
  byCategory,
  totalAmount,
  currency,
}: SpendingDonutChartProps) {
  const entries = Object.entries(byCategory)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]) as [SpendingCategory, number][]

  if (entries.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
        <p className="text-xs text-gray-500">No category data for this month</p>
      </div>
    )
  }

  let accumulatedPercent = 0

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
      <h3 className="text-sm font-bold text-white">
        Category Split — Matumizi kwa Aina
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="4"
            />
            {entries.map(([cat, amount]) => {
              const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
              const strokeDasharray = `${pct} ${100 - pct}`
              const strokeDashoffset = -accumulatedPercent
              accumulatedPercent += pct

              const conf = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.nyingine

              return (
                <path
                  key={cat}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={conf.color}
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-gray-400">Total</span>
            <span className="text-xs font-bold text-white font-mono">
              {formatCurrencyShort(totalAmount, currency)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {entries.slice(0, 5).map(([cat, amount]) => {
            const conf = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.nyingine
            const pct = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0

            return (
              <div key={cat} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: conf.color }}
                  />
                  <span className="text-gray-300 truncate">
                    {conf.emoji} {conf.labelSw}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-gray-400">{pct}%</span>
                  <span className="text-white font-semibold">
                    {formatCurrencyShort(amount, currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SpendingDonutChart
