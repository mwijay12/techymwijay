'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ALL_CATEGORIES, CATEGORY_CONFIG } from '@/types/spending'
import type { SpendingEntry, SpendingCategory, SupportedCurrency } from '@/types/spending'

interface SpendingFormProps {
  isOpen: boolean
  editEntry?: SpendingEntry | null
  defaultCurrency?: SupportedCurrency
  onSave: (data: {
    amount: number
    currency: SupportedCurrency
    category: SpendingCategory
    description: string
    notes?: string
    date: string
  }) => Promise<void>
  onClose: () => void
}

const TZS_QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000]
const USD_QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100]
const KES_QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000]

const CURRENCIES: SupportedCurrency[] = ['TZS', 'USD', 'KES']

export function SpendingForm({
  isOpen,
  editEntry,
  defaultCurrency = 'TZS',
  onSave,
  onClose,
}: SpendingFormProps) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<SupportedCurrency>(defaultCurrency)
  const [category, setCategory] = useState<SpendingCategory>('chakula')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editEntry) {
      setAmount(editEntry.amount.toString())
      setCurrency(editEntry.currency)
      setCategory(editEntry.category)
      setDescription(editEntry.description)
      setNotes(editEntry.notes ?? '')
      setDate(editEntry.date)
    } else {
      setAmount('')
      setCurrency(defaultCurrency)
      setCategory('chakula')
      setDescription('')
      setNotes('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
    }
    setErrors({})
  }, [editEntry, defaultCurrency, isOpen])

  const quickAmounts =
    currency === 'TZS'
      ? TZS_QUICK_AMOUNTS
      : currency === 'USD'
      ? USD_QUICK_AMOUNTS
      : KES_QUICK_AMOUNTS

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Enter a valid amount greater than 0'
    }
    if (!description.trim()) {
      errs.description = 'Description is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSaving(true)
    try {
      await onSave({
        amount: parseFloat(amount),
        currency,
        category,
        description: description.trim(),
        notes: notes.trim() || undefined,
        date,
      })
      onClose()
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to save',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickAmount = (val: number) => {
    setAmount(prev => {
      const current = parseFloat(prev) || 0
      return (current + val).toString()
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-white"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-base font-bold text-white">
                {editEntry ? 'Edit Expense' : '➕ Add Expense'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Amount
                </label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                    className="px-3 py-2.5 rounded-xl text-sm bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 font-semibold"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c} className="bg-gray-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setErrors(prev => ({ ...prev, amount: '' }))
                    }}
                    placeholder="0"
                    min="0"
                    step={currency === 'TZS' ? '100' : '0.01'}
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-xl text-sm bg-black/40 border text-white text-right placeholder:text-gray-600 font-mono text-lg focus:outline-none focus:border-purple-500/50 transition-all',
                      errors.amount ? 'border-red-500/50' : 'border-white/10'
                    )}
                  />
                </div>

                {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickAmounts.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:text-purple-300 hover:border-purple-500/30 transition-colors"
                    >
                      +{currency === 'TZS' ? `${val >= 1000 ? `${val / 1000}K` : val}` : val}
                    </button>
                  ))}
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
                  Category — Aina
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_CATEGORIES.map((cat) => {
                    const conf = CATEGORY_CONFIG[cat]
                    const isSelected = category === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150 text-center',
                          isSelected
                            ? `${conf.bgClass} border-purple-500/50`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        )}
                      >
                        <span className="text-lg leading-none">{conf.emoji}</span>
                        <span className={cn('text-[9px] font-medium leading-tight', isSelected ? conf.textClass : 'text-gray-400')}>
                          {conf.labelSw}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      setErrors(prev => ({ ...prev, description: '' }))
                    }}
                    placeholder={
                      category === 'chakula'
                        ? 'e.g. Lunch at Mama Ntilie'
                        : category === 'usafiri'
                        ? 'e.g. Daladala Kariakoo'
                        : category === 'airtime'
                        ? 'e.g. Vodacom data bundle'
                        : category === 'mpesa'
                        ? 'e.g. M-Pesa withdrawal'
                        : 'What did you spend on?'
                    }
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-black/40 border text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all',
                      errors.description ? 'border-red-500/50' : 'border-white/10'
                    )}
                  />
                </div>
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Date — Tarehe
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any extra notes..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>

              {errors.submit && <p className="text-xs text-red-400">{errors.submit}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isSaving ? 'Inahifadhi...' : editEntry ? 'Sasisha' : 'Hifadhi'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SpendingForm
