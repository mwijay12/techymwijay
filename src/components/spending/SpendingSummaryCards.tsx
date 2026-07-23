import { TrendingUp, Receipt, Calendar, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/spending-service'
import { CATEGORY_CONFIG } from '@/types/spending'
import type { SpendingSummary, SupportedCurrency } from '@/types/spending'

interface SpendingSummaryCardsProps {
  summary: SpendingSummary
  currency: SupportedCurrency
  isCurrentMonth: boolean
}

export function SpendingSummaryCards({
  summary,
  currency,
  isCurrentMonth,
}: SpendingSummaryCardsProps) {
  const topCategoryConfig = summary.topCategory
    ? CATEGORY_CONFIG[summary.topCategory]
    : null

  const cards = [
    {
      label: isCurrentMonth ? 'This Month' : 'Month Total',
      labelSw: 'Jumla ya Mwezi',
      value: formatCurrency(summary.totalAmount, currency),
      icon: <Receipt className="w-5 h-5 text-purple-400" />,
      sub: `${summary.transactionCount} ${
        summary.transactionCount === 1 ? 'transaction' : 'transactions'
      }`,
    },
    {
      label: 'Daily Average',
      labelSw: 'Wastani wa Siku',
      value: formatCurrency(Math.round(summary.dailyAverage), currency),
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      sub: 'per day this month',
    },
    {
      label: 'Top Category',
      labelSw: 'Aina Kubwa',
      value: topCategoryConfig
        ? `${topCategoryConfig.emoji} ${topCategoryConfig.labelSw}`
        : '—',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      sub: topCategoryConfig
        ? formatCurrency(
            summary.byCategory[summary.topCategory!] ?? 0,
            currency
          )
        : 'No data yet',
    },
    {
      label: 'Biggest Spend',
      labelSw: 'Matumizi Makubwa',
      value: summary.biggestSpend
        ? formatCurrency(summary.biggestSpend.amount, currency)
        : '—',
      icon: <ArrowUpRight className="w-5 h-5 text-amber-400" />,
      sub: summary.biggestSpend
        ? summary.biggestSpend.description
        : 'No data yet',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 relative overflow-hidden group hover:border-white/20 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">
              {card.labelSw} <span className="text-[10px] text-gray-500">({card.label})</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {card.icon}
            </div>
          </div>

          <h3 className="text-xl font-bold text-white font-mono tracking-tight mb-1">
            {card.value}
          </h3>

          <p className="text-[11px] text-gray-500 truncate">
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  )
}

export default SpendingSummaryCards
