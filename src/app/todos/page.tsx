'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Plus, Calendar, ListTodo, Sparkles } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { TodoStatsBar } from '@/components/todos/TodoStatsBar'
import { TodoQuickAdd } from '@/components/todos/TodoQuickAdd'
import { TodoFilters } from '@/components/todos/TodoFilters'
import { TodoCard } from '@/components/todos/TodoCard'
import { TodoForm } from '@/components/todos/TodoForm'
import { TodoDailyPlanner } from '@/components/todos/TodoDailyPlanner'
import { useTodos } from '@/hooks/use-todos'
import { cn } from '@/lib/utils'
import type { TodoItem } from '@/types/todo'

export default function TodosPage() {
  const {
    filteredTodos,
    todayTodos,
    overdueTodos,
    allTags,
    stats,
    isLoading,
    filter,
    setFilter,
    resetFilter,
    addTodo,
    editTodo,
    removeTodo,
    toggleStatus,
  } = useTodos()

  const [activeTab, setActiveTab] = useState<'planner' | 'all'>('planner')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)

  const handleOpenNew = () => {
    setEditingTodo(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (todo: TodoItem) => {
    setEditingTodo(todo)
    setFormOpen(true)
  }

  const handleSaveTodo = async (data: Parameters<typeof addTodo>[0]) => {
    if (editingTodo) {
      await editTodo(editingTodo.id, data)
    } else {
      await addTodo(data)
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PageWrapper maxWidth="7xl">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/15 via-transparent to-transparent" />
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6 py-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3.5 py-1 text-xs text-purple-300 mb-3">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Task OS & Daily Planner</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Kazi na Mipango
                </h1>
                <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                  Daily focus planner, task priorities, deadline tracking & streak manager. Built for developer productivity.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenNew}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-xl shadow-purple-500/25 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                  Add Task
                </button>
              </div>
            </div>

            {/* Quick Add Bar */}
            <TodoQuickAdd onAdd={async (data) => { await addTodo(data) }} />

            {/* Stats Bar */}
            <TodoStatsBar stats={stats} />

            {/* View Mode Tabs (Daily Planner vs All Tasks) */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('planner')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border',
                    activeTab === 'planner'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Today's Planner ({todayTodos.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border',
                    activeTab === 'all'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                  )}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>All Tasks ({stats.total})</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'planner' ? (
              <TodoDailyPlanner
                todayTodos={todayTodos}
                overdueTodos={overdueTodos}
                onEdit={handleOpenEdit}
                onDelete={removeTodo}
                onToggleStatus={toggleStatus}
                onOpenNew={handleOpenNew}
              />
            ) : (
              <div className="space-y-4">
                <TodoFilters
                  filter={filter}
                  allTags={allTags}
                  onFilterChange={setFilter}
                  onReset={resetFilter}
                />

                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredTodos.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                      <ListTodo className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">No tasks found</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      No tasks matched your current filter. Try clearing your filters or create a new task.
                    </p>
                    <button
                      onClick={handleOpenNew}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create First Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {filteredTodos.map((todo) => (
                        <TodoCard
                          key={todo.id}
                          todo={todo}
                          onEdit={handleOpenEdit}
                          onDelete={removeTodo}
                          onToggleStatus={toggleStatus}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* Task Form Modal */}
            <TodoForm
              isOpen={formOpen}
              editTodo={editingTodo}
              onSave={handleSaveTodo}
              onClose={() => setFormOpen(false)}
            />
          </div>
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}
