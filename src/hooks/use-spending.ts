'use client'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import {
  createSpendingEntry,
  updateSpendingEntry,
  deleteSpendingEntry,
  loadSpendingFromStorage,
  loadBudgetGoal,
  saveBudgetGoal,
  computeMonthlySummary,
  getEntriesForMonth,
  syncSpendingFromFirestore,
} from '@/lib/spending-service'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAppSettings } from '@/hooks/use-app-settings'
import type {
  SpendingEntry,
  SpendingCategory,
  SpendingSummary,
  SupportedCurrency,
  BudgetGoal,
} from '@/types/spending'

interface UseSpendingReturn {
  allEntries: SpendingEntry[]
  monthEntries: SpendingEntry[]
  summary: SpendingSummary
  budgetGoal: BudgetGoal | null
  isLoading: boolean

  viewYear: number
  viewMonth: number
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToCurrentMonth: () => void
  isCurrentMonth: boolean

  addEntry: (
    data: Parameters<typeof createSpendingEntry>[1]
  ) => Promise<SpendingEntry>
  editEntry: (
    id: string,
    updates: Parameters<typeof updateSpendingEntry>[2]
  ) => Promise<SpendingEntry>
  removeEntry: (id: string) => Promise<void>

  setBudgetGoal: (goal: BudgetGoal) => void
  budgetUsedPercent: number

  currency: SupportedCurrency
}

export function useSpending(): UseSpendingReturn {
  const { user } = useAuth()
  const { settings } = useAppSettings()
  const currency = (settings.personal?.currency ?? 'TZS') as SupportedCurrency

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [allEntries, setAllEntries] = useState<SpendingEntry[]>([])
  const [budgetGoal, setBudgetGoalState] = useState<BudgetGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const targetUid = user?.uid || 'guest-user'

    setIsLoading(true)
    const local = loadSpendingFromStorage(targetUid)
    setAllEntries(local)
    setBudgetGoalState(loadBudgetGoal(targetUid))
    setIsLoading(false)

    if (typeof window !== 'undefined' && navigator.onLine) {
      syncSpendingFromFirestore(targetUid)
        .then(setAllEntries)
        .catch(() => {})
    }
  }, [user?.uid])

  const goToPreviousMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    const currentNow = new Date()
    setViewMonth(prev => {
      const nextMonth = prev === 11 ? 0 : prev + 1
      const nextYear = prev === 11 ? viewYear + 1 : viewYear

      if (
        nextYear > currentNow.getFullYear() ||
        (nextYear === currentNow.getFullYear() &&
          nextMonth > currentNow.getMonth())
      ) {
        return prev
      }

      if (prev === 11) setViewYear(y => y + 1)
      return nextMonth
    })
  }, [viewYear])

  const goToCurrentMonth = useCallback(() => {
    const n = new Date()
    setViewYear(n.getFullYear())
    setViewMonth(n.getMonth())
  }, [])

  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth()

  const monthEntries = useMemo(
    () => getEntriesForMonth(allEntries, viewYear, viewMonth),
    [allEntries, viewYear, viewMonth]
  )

  const summary = useMemo(
    () => computeMonthlySummary(allEntries, viewYear, viewMonth, currency),
    [allEntries, viewYear, viewMonth, currency]
  )

  const budgetUsedPercent = useMemo(() => {
    if (!budgetGoal || budgetGoal.monthlyLimit === 0) return 0
    return Math.min(
      Math.round((summary.totalAmount / budgetGoal.monthlyLimit) * 100),
      100
    )
  }, [summary.totalAmount, budgetGoal])

  const addEntry = useCallback(
    async (data: Parameters<typeof createSpendingEntry>[1]) => {
      const targetUid = user?.uid || 'guest-user'
      const entry = await createSpendingEntry(targetUid, {
        ...data,
        currency: data.currency ?? currency,
      })
      setAllEntries(prev => [entry, ...prev])
      return entry
    },
    [user?.uid, currency]
  )

  const editEntry = useCallback(
    async (
      id: string,
      updates: Parameters<typeof updateSpendingEntry>[2]
    ) => {
      const targetUid = user?.uid || 'guest-user'
      const updated = await updateSpendingEntry(targetUid, id, updates)
      setAllEntries(prev => prev.map(e => (e.id === id ? updated : e)))
      return updated
    },
    [user?.uid]
  )

  const removeEntry = useCallback(
    async (id: string) => {
      const targetUid = user?.uid || 'guest-user'
      await deleteSpendingEntry(targetUid, id)
      setAllEntries(prev => prev.filter(e => e.id !== id))
    },
    [user?.uid]
  )

  const setBudgetGoal = useCallback(
    (goal: BudgetGoal) => {
      const targetUid = user?.uid || 'guest-user'
      saveBudgetGoal(targetUid, goal)
      setBudgetGoalState(goal)
    },
    [user?.uid]
  )

  return {
    allEntries,
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
    budgetUsedPercent,
    currency,
  }
}
