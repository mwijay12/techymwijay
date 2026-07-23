'use client'

import { useState } from 'react'
import { Target, Edit2, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { formatCurrency } from '@/lib/spending-service'
import { cn } from '@/lib/utils'
import type { BudgetGoal, SupportedCurrency } from '@/types/spending'

interface BudgetGoalCardProps {
  budgetGoal: BudgetGoal | null
  totalSpent: number
  currency: SupportedCurrency
  onSaveGoal: (goal: BudgetGoal) => void
}

export function BudgetGoalCard({
  budgetGoal,
  totalSpent,
  currency,
  onSaveGoal,
}: BudgetGoalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [limit, setLimit] = useState(budgetGoal?.monthlyLimit.toString() ?? '500000')

  const monthlyLimit = budgetGoal?.monthlyLimit ?? 0
  const pct = monthlyLimit > 0 ? Math.round((totalSpent / monthlyLimit) * 100) : 0
  const isOver = pct >= 100
  const isWarning = pct >= (budgetGoal?.alertAt ?? 80) && !isOver

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(limit)
    if (!isNaN(val) && val >= 0) {
      onSaveGoal({
        monthlyLimit: val,
        currency,
        alertAt: 80,
      })
      setIsEditing(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Monthly Budget Goal — Bajeti ya Mwezi
            </h3>
            <p className="text-[11px] text-gray-400">
              {monthlyLimit > 0
                ? `Limit: ${formatCurrency(monthlyLimit, currency)}`
                : 'No budget limit set'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Set Budget Goal"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="flex items-center gap-2 pt-2">
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="e.g. 500000"
            className="flex-1 px-3 py-2 rounded-xl text-sm bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : monthlyLimit > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">
              Spent: {formatCurrency(totalSpent, currency)}
            </span>
            <span
              className={cn(
                'font-bold',
                isOver ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-emerald-400'
              )}
            >
              {pct}% used
            </span>
          </div>

          <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className={cn(
                'h-full transition-all duration-500 rounded-full',
                isOver
                  ? 'bg-red-500 shadow-lg shadow-red-500/50'
                  : isWarning
                  ? 'bg-yellow-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              )}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>

          {isOver && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 pt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>You have exceeded your monthly budget! (Umezidi bajeti)</span>
            </div>
          )}

          {isWarning && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 pt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Warning: You have used {pct}% of your budget!</span>
            </div>
          )}

          {!isOver && !isWarning && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>On track! Remaining: {formatCurrency(monthlyLimit - totalSpent, currency)}</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">
          Click the edit icon above to set your monthly TZS spending target.
        </p>
      )}
    </div>
  )
}

export default BudgetGoalCard
