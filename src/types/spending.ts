// ─── Tanzanian Spending Categories ────────────────────────
export type SpendingCategory =
  | 'chakula'      // Food & Drinks
  | 'usafiri'      // Transport
  | 'airtime'      // Airtime & Data
  | 'mpesa'        // Mobile Money (M-Pesa/Airtel/Tigo)
  | 'kodi'         // Rent & Utilities
  | 'elimu'        // Education
  | 'tech'         // Tech & Software
  | 'burudani'     // Entertainment
  | 'afya'         // Health
  | 'mavazi'       // Clothing
  | 'nyingine'     // Other

export type SupportedCurrency = 'TZS' | 'USD' | 'KES'

export interface SpendingEntry {
  id: string
  userId: string
  amount: number
  currency: SupportedCurrency
  category: SpendingCategory
  description: string
  notes?: string
  date: string                // 'YYYY-MM-DD'
  createdAt: string           // ISO
  updatedAt: string           // ISO
  syncedAt?: string
}

export interface SpendingSummary {
  totalAmount: number
  currency: SupportedCurrency
  transactionCount: number
  dailyAverage: number
  biggestSpend: SpendingEntry | null
  byCategory: Record<SpendingCategory, number>
  byDay: Record<string, number>   // 'YYYY-MM-DD' → total
  topCategory: SpendingCategory | null
}

export interface BudgetGoal {
  monthlyLimit: number
  currency: SupportedCurrency
  alertAt: number             // percentage (e.g. 80 = alert at 80%)
}

// ─── Category Display Config ───────────────────────────────
export const CATEGORY_CONFIG: Record<
  SpendingCategory,
  {
    labelEn: string
    labelSw: string
    emoji: string
    color: string
    bgClass: string
    textClass: string
  }
> = {
  chakula: {
    labelEn: 'Food & Drinks',
    labelSw: 'Chakula',
    emoji: '🍽️',
    color: '#f97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
  },
  usafiri: {
    labelEn: 'Transport',
    labelSw: 'Usafiri',
    emoji: '🚗',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
  },
  airtime: {
    labelEn: 'Airtime & Data',
    labelSw: 'Airtime/Data',
    emoji: '📱',
    color: '#8b5cf6',
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-400',
  },
  mpesa: {
    labelEn: 'Mobile Money',
    labelSw: 'M-Pesa/Airtel',
    emoji: '💸',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
  },
  kodi: {
    labelEn: 'Rent & Utilities',
    labelSw: 'Kodi/Huduma',
    emoji: '🏠',
    color: '#ef4444',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
  },
  elimu: {
    labelEn: 'Education',
    labelSw: 'Elimu',
    emoji: '📚',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-400',
  },
  tech: {
    labelEn: 'Tech & Software',
    labelSw: 'Teknolojia',
    emoji: '💻',
    color: '#6366f1',
    bgClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-400',
  },
  burudani: {
    labelEn: 'Entertainment',
    labelSw: 'Burudani',
    emoji: '🎮',
    color: '#ec4899',
    bgClass: 'bg-pink-500/10',
    textClass: 'text-pink-400',
  },
  afya: {
    labelEn: 'Health',
    labelSw: 'Afya',
    emoji: '🏥',
    color: '#14b8a6',
    bgClass: 'bg-teal-500/10',
    textClass: 'text-teal-400',
  },
  mavazi: {
    labelEn: 'Clothing',
    labelSw: 'Mavazi',
    emoji: '👕',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
  },
  nyingine: {
    labelEn: 'Other',
    labelSw: 'Nyingine',
    emoji: '📦',
    color: '#94a3b8',
    bgClass: 'bg-slate-500/10',
    textClass: 'text-slate-400',
  },
}

export const ALL_CATEGORIES: SpendingCategory[] = [
  'chakula',
  'usafiri',
  'airtime',
  'mpesa',
  'kodi',
  'elimu',
  'tech',
  'burudani',
  'afya',
  'mavazi',
  'nyingine',
]
