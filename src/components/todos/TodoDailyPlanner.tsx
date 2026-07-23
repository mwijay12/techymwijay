'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { TodoCard } from './TodoCard'
import type { TodoItem, TodoStatus } from '@/types/todo'

interface TodoDailyPlannerProps {
  todayTodos: TodoItem[]
  overdueTodos: TodoItem[]
  onEdit: (todo: TodoItem) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: TodoStatus) => void
  onOpenNew: () => void
}

export function TodoDailyPlanner({
  todayTodos,
  overdueTodos,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenNew,
}: TodoDailyPlannerProps) {
  const todayDateStr = format(new Date(), 'EEEE, d MMMM yyyy')

  const urgentOrHigh = todayTodos.filter(t => t.priority === 'urgent' || t.priority === 'high')
  const regular = todayTodos.filter(t => t.priority !== 'urgent' && t.priority !== 'high')

  return (
    <div className="space-y-6">
      {/* Daily Banner */}
      <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-blue-900/30 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Focus — Mpango wa Leo</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {todayDateStr}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {todayTodos.length === 0
                ? 'No tasks scheduled for today. Time to plan or take a break!'
                : `You have ${todayTodos.length} task${todayTodos.length === 1 ? '' : 's'} on your radar today.`}
            </p>
          </div>
        </div>
      </div>

      {/* Overdue alert section */}
      {overdueTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue Tasks ({overdueTodos.length}) — Zilizochelewa</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {overdueTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* High priority today */}
      {urgentOrHigh.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
            <span>🔥 High Priority Today — Muhimu sana Leo</span>
          </h3>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {urgentOrHigh.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Regular today */}
      {regular.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <span>📋 Other Tasks Today — Kawaida</span>
          </h3>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {regular.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {todayTodos.length === 0 && overdueTodos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl space-y-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white">All clear for today!</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Hakuna kazi zilizobaki kwa leo. Tumia kipindi hiki kupumzika au kupanga kazi za kesho!
          </p>
          <button
            onClick={onOpenNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all"
          >
            Create Task for Today
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default TodoDailyPlanner
