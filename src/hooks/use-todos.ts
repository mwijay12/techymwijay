'use client'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import {
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  reorderTodos,
  loadTodosFromStorage,
  syncTodosFromFirestore,
  computeTodoStats,
  isOverdue,
  isDueToday,
} from '@/lib/todo-service'
import { useAuth } from '@/components/auth/AuthProvider'
import type {
  TodoItem,
  TodoPriority,
  TodoStatus,
  TodoFilter,
} from '@/types/todo'

const DEFAULT_FILTER: TodoFilter = {
  status: 'all',
  priority: 'all',
  tag: null,
  search: '',
  showDone: true,
  showCancelled: false,
}

export interface UseTodosReturn {
  todos: TodoItem[]
  filteredTodos: TodoItem[]
  todayTodos: TodoItem[]
  overdueTodos: TodoItem[]
  allTags: string[]
  stats: ReturnType<typeof computeTodoStats>
  isLoading: boolean
  error: string | null

  filter: TodoFilter
  setFilter: (updates: Partial<TodoFilter>) => void
  resetFilter: () => void

  addTodo: (
    data: Parameters<typeof createTodo>[1]
  ) => Promise<TodoItem>
  editTodo: (
    id: string,
    updates: Parameters<typeof updateTodo>[2]
  ) => Promise<TodoItem>
  removeTodo: (id: string) => Promise<void>
  toggleStatus: (id: string, currentStatus: TodoStatus) => Promise<void>
  reorder: (orderedIds: string[]) => Promise<void>

  markDone: (id: string) => Promise<void>
  markInProgress: (id: string) => Promise<void>
}

export function useTodos(): UseTodosReturn {
  const { user } = useAuth()
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilterState] = useState<TodoFilter>(DEFAULT_FILTER)

  useEffect(() => {
    const targetUid = user?.uid || 'guest-user'

    setIsLoading(true)
    const local = loadTodosFromStorage(targetUid)
    setTodos(local)
    setIsLoading(false)

    if (typeof window !== 'undefined' && navigator.onLine) {
      syncTodosFromFirestore(targetUid)
        .then(setTodos)
        .catch(() => {})
    }
  }, [user?.uid])

  const setFilter = useCallback(
    (updates: Partial<TodoFilter>) => {
      setFilterState(prev => ({ ...prev, ...updates }))
    },
    []
  )

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER)
  }, [])

  const filteredTodos = useMemo(() => {
    let result = [...todos]

    if (filter.search.trim()) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.includes(q))
      )
    }

    if (filter.status !== 'all') {
      result = result.filter(t => t.status === filter.status)
    }

    if (!filter.showDone && filter.status === 'all') {
      result = result.filter(t => t.status !== 'done')
    }

    if (!filter.showCancelled) {
      result = result.filter(t => t.status !== 'cancelled')
    }

    if (filter.priority !== 'all') {
      result = result.filter(t => t.priority === filter.priority)
    }

    if (filter.tag) {
      result = result.filter(t => t.tags.includes(filter.tag!))
    }

    result.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1
      if (a.status !== 'done' && b.status === 'done') return -1

      const aOverdue = isOverdue(a)
      const bOverdue = isOverdue(b)
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (pDiff !== 0) return pDiff

      return a.order - b.order
    })

    return result
  }, [todos, filter])

  const todayTodos = useMemo(() => {
    return todos
      .filter(t => {
        if (t.status === 'cancelled') return false
        if (isDueToday(t)) return true
        if (isOverdue(t)) return true
        if (t.status === 'in_progress') return true
        return false
      })
      .sort((a, b) => {
        const aOver = isOverdue(a)
        const bOver = isOverdue(b)
        if (aOver && !bOver) return -1
        if (!aOver && bOver) return 1
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }, [todos])

  const overdueTodos = useMemo(
    () => todos.filter(isOverdue),
    [todos]
  )

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    todos.forEach(t => t.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [todos])

  const stats = useMemo(() => computeTodoStats(todos), [todos])

  const addTodo = useCallback(
    async (data: Parameters<typeof createTodo>[1]) => {
      const targetUid = user?.uid || 'guest-user'
      const todo = await createTodo(targetUid, data)
      setTodos(prev => [...prev, todo])
      return todo
    },
    [user?.uid]
  )

  const editTodo = useCallback(
    async (
      id: string,
      updates: Parameters<typeof updateTodo>[2]
    ) => {
      const targetUid = user?.uid || 'guest-user'
      const updated = await updateTodo(targetUid, id, updates)
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
      return updated
    },
    [user?.uid]
  )

  const removeTodo = useCallback(
    async (id: string) => {
      const targetUid = user?.uid || 'guest-user'
      await deleteTodo(targetUid, id)
      setTodos(prev => prev.filter(t => t.id !== id))
    },
    [user?.uid]
  )

  const toggleStatus = useCallback(
    async (id: string, currentStatus: TodoStatus) => {
      const targetUid = user?.uid || 'guest-user'
      const updated = await toggleTodoStatus(targetUid, id, currentStatus)
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
    },
    [user?.uid]
  )

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      const targetUid = user?.uid || 'guest-user'
      setTodos(prev => {
        const updated = [...prev]
        orderedIds.forEach((id, index) => {
          const todo = updated.find(t => t.id === id)
          if (todo) todo.order = index
        })
        return updated
      })
      await reorderTodos(targetUid, orderedIds)
    },
    [user?.uid]
  )

  const markDone = useCallback(
    async (id: string) => {
      const targetUid = user?.uid || 'guest-user'
      const updated = await updateTodo(targetUid, id, { status: 'done' })
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
    },
    [user?.uid]
  )

  const markInProgress = useCallback(
    async (id: string) => {
      const targetUid = user?.uid || 'guest-user'
      const updated = await updateTodo(targetUid, id, {
        status: 'in_progress',
      })
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
    },
    [user?.uid]
  )

  return {
    todos,
    filteredTodos,
    todayTodos,
    overdueTodos,
    allTags,
    stats,
    isLoading,
    error,
    filter,
    setFilter,
    resetFilter,
    addTodo,
    editTodo,
    removeTodo,
    toggleStatus,
    reorder,
    markDone,
    markInProgress,
  }
}
