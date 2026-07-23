/**
 * Todo Service
 * CRUD for todo items with localStorage + Firestore sync.
 * Includes reorder logic for drag-to-sort.
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
import { format, isToday, isPast, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { broadcastTodoUpdate, broadcastItemDeleted } from '@/lib/multi-tab'
import type { TodoItem, TodoPriority, TodoStatus } from '@/types/todo'

const getStorageKey = (userId: string) => `mwijay_todos_${userId}`

export function loadTodosFromStorage(userId: string): TodoItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    if (!raw) return []
    return JSON.parse(raw) as TodoItem[]
  } catch {
    return []
  }
}

function saveTodosToStorage(userId: string, todos: TodoItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(todos))
  } catch {
    console.warn('[Todos] localStorage full')
  }
}

function firestoreToTodo(
  data: Record<string, unknown>,
  id: string
): TodoItem {
  const toISO = (v: unknown): string => {
    if (v instanceof Timestamp) return v.toDate().toISOString()
    return typeof v === 'string' ? v : new Date().toISOString()
  }

  return {
    id,
    userId: String(data.userId ?? ''),
    title: String(data.title ?? ''),
    description: data.description ? String(data.description) : undefined,
    priority: (data.priority as TodoPriority) ?? 'medium',
    status: (data.status as TodoStatus) ?? 'todo',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    dueDate: data.dueDate ? String(data.dueDate) : undefined,
    completedAt: data.completedAt ? String(data.completedAt) : undefined,
    order: Number(data.order ?? 0),
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    syncedAt: new Date().toISOString(),
  }
}

async function syncTodoToFirestore(todo: TodoItem): Promise<void> {
  if (!db) return
  try {
    await setDoc(doc(db, 'todo_items', todo.id), {
      ...todo,
      updatedAt: serverTimestamp(),
      syncedAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[Todos] Firestore sync failed:', err)
  }
}

async function deleteTodoFromFirestore(id: string): Promise<void> {
  if (!db) return
  try {
    await deleteDoc(doc(db, 'todo_items', id))
  } catch (err) {
    console.warn('[Todos] Firestore delete failed:', err)
  }
}

export async function syncTodosFromFirestore(
  userId: string
): Promise<TodoItem[]> {
  if (!db) return loadTodosFromStorage(userId)
  try {
    const q = query(
      collection(db, 'todo_items'),
      where('userId', '==', userId),
      orderBy('order', 'asc')
    )
    const snap = await getDocs(q)
    const todos = snap.docs.map(d =>
      firestoreToTodo(d.data() as Record<string, unknown>, d.id)
    )
    if (todos.length > 0) {
      saveTodosToStorage(userId, todos)
    }
    return todos
  } catch {
    return loadTodosFromStorage(userId)
  }
}

function getNextOrder(todos: TodoItem[]): number {
  if (todos.length === 0) return 0
  return Math.max(...todos.map(t => t.order)) + 1
}

export async function createTodo(
  userId: string,
  data: {
    title: string
    description?: string
    priority?: TodoPriority
    dueDate?: string
    tags?: string[]
  }
): Promise<TodoItem> {
  const now = new Date().toISOString()
  const existing = loadTodosFromStorage(userId)

  const todo: TodoItem = {
    id: uuidv4(),
    userId,
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    priority: data.priority ?? 'medium',
    status: 'todo',
    tags: data.tags?.map(t => t.trim().toLowerCase()).filter(Boolean) ?? [],
    dueDate: data.dueDate || undefined,
    order: getNextOrder(existing),
    createdAt: now,
    updatedAt: now,
  }

  saveTodosToStorage(userId, [...existing, todo])
  broadcastTodoUpdate(todo.id)
  syncTodoToFirestore(todo).catch(() => {})

  return todo
}

export async function updateTodo(
  userId: string,
  id: string,
  updates: Partial<Omit<TodoItem, 'id' | 'userId' | 'createdAt'>>
): Promise<TodoItem> {
  const todos = loadTodosFromStorage(userId)
  const idx = todos.findIndex(t => t.id === id)
  if (idx === -1) throw new Error(`Todo ${id} not found`)

  const updated: TodoItem = {
    ...todos[idx],
    ...updates,
    id,
    userId,
    updatedAt: new Date().toISOString(),
  }

  if (updates.status === 'done' && !todos[idx].completedAt) {
    updated.completedAt = new Date().toISOString()
  }

  if (updates.status && updates.status !== 'done') {
    updated.completedAt = undefined
  }

  todos[idx] = updated
  saveTodosToStorage(userId, todos)
  broadcastTodoUpdate(id)
  syncTodoToFirestore(updated).catch(() => {})

  return updated
}

export async function deleteTodo(
  userId: string,
  id: string
): Promise<void> {
  const todos = loadTodosFromStorage(userId)
  saveTodosToStorage(userId, todos.filter(t => t.id !== id))
  broadcastItemDeleted('todos', id)
  deleteTodoFromFirestore(id).catch(() => {})
}

export async function toggleTodoStatus(
  userId: string,
  id: string,
  currentStatus: TodoStatus
): Promise<TodoItem> {
  const nextStatus: Record<TodoStatus, TodoStatus> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'todo',
    cancelled: 'todo',
  }
  return updateTodo(userId, id, {
    status: nextStatus[currentStatus],
  })
}

export async function reorderTodos(
  userId: string,
  orderedIds: string[]
): Promise<void> {
  const todos = loadTodosFromStorage(userId)
  const updated = todos.map(todo => {
    const newOrder = orderedIds.indexOf(todo.id)
    return newOrder !== -1 ? { ...todo, order: newOrder } : todo
  })
  saveTodosToStorage(userId, updated)

  updated
    .filter(t => orderedIds.includes(t.id))
    .forEach(t => syncTodoToFirestore(t).catch(() => {}))
}

export function isOverdue(todo: TodoItem): boolean {
  if (!todo.dueDate) return false
  if (todo.status === 'done' || todo.status === 'cancelled') return false
  return isPast(parseISO(todo.dueDate + 'T23:59:59'))
}

export function getDaysUntilDue(todo: TodoItem): number | null {
  if (!todo.dueDate) return null
  const due = parseISO(todo.dueDate)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function isDueToday(todo: TodoItem): boolean {
  if (!todo.dueDate) return false
  return isToday(parseISO(todo.dueDate))
}

export function computeTodoStats(todos: TodoItem[]) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const total = todos.filter(
    t => t.status !== 'cancelled'
  ).length

  const done = todos.filter(t => t.status === 'done').length
  const inProgress = todos.filter(t => t.status === 'in_progress').length
  const overdue = todos.filter(isOverdue).length

  const doneThisWeek = todos.filter(t => {
    if (t.status !== 'done' || !t.completedAt) return false
    const completedDate = parseISO(t.completedAt)
    return completedDate >= weekStart && completedDate <= weekEnd
  }).length

  const completionRate = total > 0
    ? Math.round((done / total) * 100)
    : 0

  const streak = computeStreak(todos)

  return {
    total,
    done,
    inProgress,
    overdue,
    doneThisWeek,
    completionRate,
    streak,
  }
}

function computeStreak(todos: TodoItem[]): number {
  const completedDates = todos
    .filter(t => t.completedAt)
    .map(t => format(parseISO(t.completedAt!), 'yyyy-MM-dd'))

  const uniqueDates = [...new Set(completedDates)].sort().reverse()
  if (uniqueDates.length === 0) return 0

  let streak = 0
  const today = format(new Date(), 'yyyy-MM-dd')
  let checkDate = today

  for (const date of uniqueDates) {
    if (date === checkDate) {
      streak++
      const d = parseISO(checkDate)
      d.setDate(d.getDate() - 1)
      checkDate = format(d, 'yyyy-MM-dd')
    } else if (date < checkDate) {
      break
    }
  }

  return streak
}
