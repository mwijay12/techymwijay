'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Circle,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Play,
  Tag,
  AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { PriorityBadge } from './PriorityBadge'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/todo'
import { isOverdue, getDaysUntilDue, isDueToday } from '@/lib/todo-service'
import type { TodoItem, TodoStatus } from '@/types/todo'

interface TodoCardProps {
  todo: TodoItem
  onEdit: (todo: TodoItem) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: TodoStatus) => void
}

export function TodoCard({
  todo,
  onEdit,
  onDelete,
  onToggleStatus,
}: TodoCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const statusConfig = STATUS_CONFIG[todo.status] || STATUS_CONFIG.todo
  const priorityConfig = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium
  const overdue = isOverdue(todo)
  const daysUntil = getDaysUntilDue(todo)
  const dueToday = isDueToday(todo)

  const isDone = todo.status === 'done'
  const isCancelled = todo.status === 'cancelled'

  const handleComplete = async () => {
    if (isDone) {
      onToggleStatus(todo.id, todo.status)
      return
    }
    setIsCompleting(true)
    await new Promise(r => setTimeout(r, 150))
    onToggleStatus(todo.id, todo.status)
    setIsCompleting(false)
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(todo.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-200 hover:border-white/20',
        isDone && 'opacity-60',
        isCancelled && 'opacity-40',
        overdue && !isDone && 'border-red-500/30 bg-red-500/5'
      )}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: overdue && !isDone ? '#ef4444' : priorityConfig.color,
      }}
    >
      <button
        onClick={handleComplete}
        className={cn(
          'flex-shrink-0 mt-0.5 transition-all duration-200',
          isDone ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400',
          isCompleting && 'scale-110'
        )}
        title={isDone ? 'Mark as todo' : 'Mark as done'}
      >
        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium leading-snug',
            isDone
              ? 'line-through text-gray-500'
              : isCancelled
              ? 'line-through text-gray-500'
              : 'text-white'
          )}
        >
          {todo.title}
        </p>

        {todo.description && !isDone && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <PriorityBadge priority={todo.priority} size="xs" />

          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium border',
              statusConfig.bgClass,
              statusConfig.borderClass,
              statusConfig.textClass
            )}
          >
            {statusConfig.emoji} {statusConfig.labelSw}
          </span>

          {todo.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium border',
                overdue && !isDone
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : dueToday
                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              )}
            >
              {overdue && !isDone ? (
                <AlertTriangle className="w-2.5 h-2.5" />
              ) : (
                <Clock className="w-2.5 h-2.5" />
              )}
              {overdue && !isDone
                ? `${Math.abs(daysUntil ?? 0)}d overdue`
                : dueToday
                ? 'Due today!'
                : daysUntil !== null && daysUntil <= 3
                ? `${daysUntil}d left`
                : format(parseISO(todo.dueDate), 'd MMM')}
            </span>
          )}

          {todo.tags && todo.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
            >
              <Tag className="w-2 h-2" />
              {tag}
            </span>
          ))}
          {todo.tags && todo.tags.length > 2 && (
            <span className="text-[9px] text-gray-500">
              +{todo.tags.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {todo.status === 'todo' && (
          <button
            onClick={() => onToggleStatus(todo.id, todo.status)}
            title="Start task"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-white/10 transition-all"
          >
            <Play className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={() => onEdit(todo)}
          title="Edit"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Edit3 className="w-3 h-3" />
        </button>

        <button
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          className={cn(
            'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
            confirmDelete
              ? 'text-red-400 bg-red-500/10'
              : 'text-gray-400 hover:text-red-400 hover:bg-white/10'
          )}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}

export default TodoCard
