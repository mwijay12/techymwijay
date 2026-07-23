'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Wallet, Sparkles, Filter, Receipt } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { SpendingSummaryCards } from '@/components/spending/SpendingSummaryCards'
import { SpendingBarChart } from '@/components/spending/SpendingBarChart'
import { SpendingDonutChart } from '@/components/spending/SpendingDonutChart'
import { SpendingFilters } from '@/components/spending/SpendingFilters'
import { SpendingEntryCard } from '@/components/spending/SpendingEntryCard'
import { SpendingForm } from '@/components/spending/SpendingForm'
import { BudgetGoalCard } from '@/components/spending/BudgetGoalCard'
import { useSpending } from '@/hooks/use-spending'
import { exportMonthAsCSV } from '@/lib/spending-service'
import type { SpendingEntry, SpendingCategory } from '@/types/spending'

export default function SpendingPage() {
  const {
    monthEntries,
    summary,
    budgetGoal,
    isLoading,
    viewYear,
    viewMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    addEntry,
    editEntry,
    removeEntry,
    setBudgetGoal,
    currency,
  } = useSpending()

  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<SpendingEntry | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<SpendingCategory | 'all'>('all')

  const handleOpenNew = () => {
    setEditingEntry(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (entry: SpendingEntry) => {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  const handleSaveEntry = async (data: Parameters<typeof addEntry>[0]) => {
    if (editingEntry) {
      await editEntry(editingEntry.id, data)
    } else {
      await addEntry(data)
    }
  }

  const filteredEntries = selectedCategory === 'all'
    ? monthEntries
    : monthEntries.filter(e => e.category === selectedCategory)

  return (
    <ProtectedRoute>
      <AppShell>
        <PageWrapper maxWidth="7xl">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6 py-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1 text-xs text-emerald-400 mb-3">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Spending Tracker — Tanzanian Edition 🇹🇿</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Matumizi Yangu
                </h1>
                <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                  Track every TZS spent on food, transport, airtime, M-Pesa & bills. Smart category insights & monthly budget goals.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenNew}
                  className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-xl shadow-emerald-500/25 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                  Add Expense
                </button>
              </div>
            </div>

            {/* Summary Stat Cards */}
            <SpendingSummaryCards
              summary={summary}
              currency={currency}
              isCurrentMonth={isCurrentMonth}
            />

            {/* Budget Goal Card */}
            <BudgetGoalCard
              budgetGoal={budgetGoal}
              totalSpent={summary.totalAmount}
              currency={currency}
              onSaveGoal={setBudgetGoal}
            />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingBarChart
                byDay={summary.byDay}
                currency={currency}
              />

              <SpendingDonutChart
                byCategory={summary.byCategory}
                totalAmount={summary.totalAmount}
                currency={currency}
              />
            </div>

            {/* Controls + Month Picker */}
            <SpendingFilters
              viewYear={viewYear}
              viewMonth={viewMonth}
              selectedCategory={selectedCategory}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onCurrentMonth={goToCurrentMonth}
              isCurrentMonth={isCurrentMonth}
              onCategoryChange={setSelectedCategory}
              onExportCSV={() => exportMonthAsCSV(monthEntries, viewYear, viewMonth)}
            />

            {/* Entries List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-400" />
                  <span>Transactions ({filteredEntries.length})</span>
                </h3>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">No expenses found</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    {selectedCategory !== 'all'
                      ? 'No transactions in this category for this month.'
                      : 'Haujaingiza matumizi yoyote mwezi huu. Bofya "Add Expense" kuanza!'}
                  </p>
                  <button
                    onClick={handleOpenNew}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record First Expense
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredEntries.map((entry) => (
                      <SpendingEntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={handleOpenEdit}
                        onDelete={removeEntry}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Modal Form */}
            <SpendingForm
              isOpen={formOpen}
              editEntry={editingEntry}
              defaultCurrency={currency}
              onSave={handleSaveEntry}
              onClose={() => setFormOpen(false)}
            />
          </div>
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}
