// ─── Core Types ────────────────────────────────────────────
export type TodoPriority = 'urgent' | 'high' | 'medium' | 'low'
export type TodoStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

export interface TodoItem {
  id: string
  userId: string
  title: string
  description?: string
  priority: TodoPriority
  status: TodoStatus
  tags: string[]
  dueDate?: string          // 'YYYY-MM-DD'
  completedAt?: string      // ISO date string
  order: number             // for manual reorder
  createdAt: string         // ISO date string
  updatedAt: string         // ISO date string
  syncedAt?: string
}

// ─── Priority Config ───────────────────────────────────────
export const PRIORITY_CONFIG: Record<
  TodoPriority,
  {
    labelEn: string
    labelSw: string
    emoji: string
    color: string
    bgClass: string
    textClass: string
    borderClass: string
    order: number           // sort order (1 = highest)
  }
> = {
  urgent: {
    labelEn: 'Urgent',
    labelSw: 'Haraka!',
    emoji: '🔴',
    color: '#ef4444',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
    order: 1,
  },
  high: {
    labelEn: 'High',
    labelSw: 'Muhimu',
    emoji: '🟠',
    color: '#f97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    order: 2,
  },
  medium: {
    labelEn: 'Medium',
    labelSw: 'Wastani',
    emoji: '🟡',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    order: 3,
  },
  low: {
    labelEn: 'Low',
    labelSw: 'Kawaida',
    emoji: '🟢',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    order: 4,
  },
}

// ─── Status Config ─────────────────────────────────────────
export const STATUS_CONFIG: Record<
  TodoStatus,
  {
    labelEn: string
    labelSw: string
    emoji: string
    color: string
    bgClass: string
    textClass: string
    borderClass: string
  }
> = {
  todo: {
    labelEn: 'To Do',
    labelSw: 'Kufanya',
    emoji: '📋',
    color: '#94a3b8',
    bgClass: 'bg-slate-500/10',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-500/20',
  },
  in_progress: {
    labelEn: 'In Progress',
    labelSw: 'Inaendelea',
    emoji: '⚡',
    color: '#6366f1',
    bgClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/30',
  },
  done: {
    labelEn: 'Done',
    labelSw: 'Imekamilika',
    emoji: '✅',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
  },
  cancelled: {
    labelEn: 'Cancelled',
    labelSw: 'Imefutwa',
    emoji: '❌',
    color: '#ef4444',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/20',
  },
}

export const ALL_PRIORITIES: TodoPriority[] = ['urgent', 'high', 'medium', 'low']
export const ALL_STATUSES: TodoStatus[] = ['todo', 'in_progress', 'done', 'cancelled']

export interface TodoFilter {
  status: TodoStatus | 'all'
  priority: TodoPriority | 'all'
  tag: string | null
  search: string
  showDone: boolean
  showCancelled: boolean
}
