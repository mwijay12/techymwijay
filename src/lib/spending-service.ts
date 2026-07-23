/**
 * Spending Service
 * CRUD for spending entries with localStorage + Firestore sync.
 * TZS-first — Tanzanian context throughout.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from 'date-fns'
import { broadcastSpendingUpdate, broadcastItemDeleted } from '@/lib/multi-tab'
import type {
  SpendingEntry,
  SpendingCategory,
  SpendingSummary,
  SupportedCurrency,
  BudgetGoal,
} from '@/types/spending'

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'TZS'
): string {
  const formatters: Record<SupportedCurrency, Intl.NumberFormat> = {
    TZS: new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }),
    KES: new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }),
  }
  return formatters[currency].format(amount)
}

export function formatCurrencyShort(
  amount: number,
  currency: SupportedCurrency = 'TZS'
): string {
  const symbol = currency === 'TZS' ? 'TSh' : currency === 'USD' ? '$' : 'KSh'
  if (amount >= 1_000_000) {
    return `${symbol} ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `${symbol} ${(amount / 1_000).toFixed(0)}K`
  }
  return `${symbol} ${amount}`
}

const getStorageKey = (userId: string) => `mwijay_spending_${userId}`
const getBudgetKey = (userId: string) => `mwijay_budget_${userId}`

export function loadSpendingFromStorage(userId: string): SpendingEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    if (!raw) return []
    return JSON.parse(raw) as SpendingEntry[]
  } catch {
    return []
  }
}

function saveSpendingToStorage(
  userId: string,
  entries: SpendingEntry[]
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(entries))
  } catch {
    console.warn('[Spending] localStorage full')
  }
}

export function loadBudgetGoal(userId: string): BudgetGoal | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getBudgetKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveBudgetGoal(userId: string, goal: BudgetGoal): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getBudgetKey(userId), JSON.stringify(goal))
}

function firestoreToEntry(
  data: Record<string, unknown>,
  id: string
): SpendingEntry {
  const toISO = (v: unknown): string => {
    if (v instanceof Timestamp) return v.toDate().toISOString()
    return typeof v === 'string' ? v : new Date().toISOString()
  }

  return {
    id,
    userId: String(data.userId ?? ''),
    amount: Number(data.amount ?? 0),
    currency: (data.currency as SupportedCurrency) ?? 'TZS',
    category: (data.category as SpendingCategory) ?? 'nyingine',
    description: String(data.description ?? ''),
    notes: data.notes ? String(data.notes) : undefined,
    date: String(data.date ?? format(new Date(), 'yyyy-MM-dd')),
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    syncedAt: new Date().toISOString(),
  }
}

async function syncEntryToFirestore(entry: SpendingEntry): Promise<void> {
  if (!db) return
  try {
    await setDoc(doc(db, 'spending_entries', entry.id), {
      ...entry,
      updatedAt: serverTimestamp(),
      syncedAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[Spending] Firestore sync failed:', err)
  }
}

async function deleteEntryFromFirestore(id: string): Promise<void> {
  if (!db) return
  try {
    await deleteDoc(doc(db, 'spending_entries', id))
  } catch (err) {
    console.warn('[Spending] Firestore delete failed:', err)
  }
}

export async function syncSpendingFromFirestore(
  userId: string
): Promise<SpendingEntry[]> {
  if (!db) return loadSpendingFromStorage(userId)
  try {
    const q = query(
      collection(db, 'spending_entries'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const snap = await getDocs(q)
    const entries = snap.docs.map(d =>
      firestoreToEntry(d.data() as Record<string, unknown>, d.id)
    )
    if (entries.length > 0) {
      saveSpendingToStorage(userId, entries)
    }
    return entries
  } catch {
    return loadSpendingFromStorage(userId)
  }
}

export async function createSpendingEntry(
  userId: string,
  data: {
    amount: number
    currency?: SupportedCurrency
    category: SpendingCategory
    description: string
    notes?: string
    date?: string
  }
): Promise<SpendingEntry> {
  const now = new Date().toISOString()
  const entry: SpendingEntry = {
    id: uuidv4(),
    userId,
    amount: Math.abs(data.amount),
    currency: data.currency ?? 'TZS',
    category: data.category,
    description: data.description.trim(),
    notes: data.notes?.trim() || undefined,
    date: data.date ?? format(new Date(), 'yyyy-MM-dd'),
    createdAt: now,
    updatedAt: now,
  }

  const existing = loadSpendingFromStorage(userId)
  saveSpendingToStorage(userId, [entry, ...existing])
  broadcastSpendingUpdate(entry.id)
  syncEntryToFirestore(entry).catch(() => {})

  return entry
}

export async function updateSpendingEntry(
  userId: string,
  id: string,
  updates: Partial<Omit<SpendingEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<SpendingEntry> {
  const entries = loadSpendingFromStorage(userId)
  const idx = entries.findIndex(e => e.id === id)
  if (idx === -1) throw new Error(`Entry ${id} not found`)

  const updated: SpendingEntry = {
    ...entries[idx],
    ...updates,
    id,
    userId,
    updatedAt: new Date().toISOString(),
  }

  entries[idx] = updated
  saveSpendingToStorage(userId, entries)
  broadcastSpendingUpdate(id)
  syncEntryToFirestore(updated).catch(() => {})

  return updated
}

export async function deleteSpendingEntry(
  userId: string,
  id: string
): Promise<void> {
  const entries = loadSpendingFromStorage(userId)
  saveSpendingToStorage(userId, entries.filter(e => e.id !== id))
  broadcastItemDeleted('spending', id)
  deleteEntryFromFirestore(id).catch(() => {})
}

export function getEntriesForMonth(
  entries: SpendingEntry[],
  year: number,
  month: number
): SpendingEntry[] {
  return entries.filter(e => {
    const d = parseISO(e.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

export function computeMonthlySummary(
  entries: SpendingEntry[],
  year: number,
  month: number,
  currency: SupportedCurrency = 'TZS'
): SpendingSummary {
  const monthEntries = getEntriesForMonth(entries, year, month)

  const totalAmount = monthEntries.reduce((sum, e) => sum + e.amount, 0)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dailyAverage = monthEntries.length > 0
    ? totalAmount / daysInMonth
    : 0

  const byCategory = {} as Record<SpendingCategory, number>
  monthEntries.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
  })

  const byDay: Record<string, number> = {}
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  eachDayOfInterval({ start, end }).forEach(day => {
    byDay[format(day, 'yyyy-MM-dd')] = 0
  })
  monthEntries.forEach(e => {
    byDay[e.date] = (byDay[e.date] ?? 0) + e.amount
  })

  const biggestSpend = monthEntries.length > 0
    ? monthEntries.reduce((max, e) => e.amount > max.amount ? e : max)
    : null

  const topCategory = Object.entries(byCategory).length > 0
    ? (Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0][0] as SpendingCategory)
    : null

  return {
    totalAmount,
    currency,
    transactionCount: monthEntries.length,
    dailyAverage,
    biggestSpend,
    byCategory,
    byDay,
    topCategory,
  }
}

export function exportMonthAsCSV(
  entries: SpendingEntry[],
  year: number,
  month: number
): void {
  const monthEntries = getEntriesForMonth(entries, year, month)
    .sort((a, b) => a.date.localeCompare(b.date))

  const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Notes']
  const rows = monthEntries.map(e => [
    e.date,
    `"${e.description}"`,
    e.category,
    e.amount.toString(),
    e.currency,
    e.notes ? `"${e.notes}"` : '',
  ])

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mwijay-spending-${year}-${String(month + 1).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
