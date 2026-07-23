'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2, Calendar, Tag, AlignLeft } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '@/types/todo'
import type { TodoItem, TodoPriority, TodoStatus } from '@/types/todo'

interface TodoFormProps {
  isOpen: boolean
  editTodo?: TodoItem | null
  onSave: (data: {
    title: string
    description?: string
    priority: TodoPriority
    status?: TodoStatus
    dueDate?: string
    tags?: string[]
  }) => Promise<void>
  onClose: () => void
}

export function TodoForm({
  isOpen,
  editTodo,
  onSave,
  onClose,
}: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [status, setStatus] = useState<TodoStatus>('todo')
  const [dueDate, setDueDate] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title)
      setDescription(editTodo.description ?? '')
      setPriority(editTodo.priority)
      setStatus(editTodo.status)
      setDueDate(editTodo.dueDate ?? '')
      setTags(editTodo.tags || [])
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStatus('todo')
      setDueDate('')
      setTags([])
    }
    setErrors({})
  }, [editTodo, isOpen])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  const removeTag = (t: string) => {
    setTags(prev => prev.filter(x => x !== t))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: dueDate || undefined,
        tags,
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
            className="relative z-10 w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">
                {editTodo ? 'Edit Task' : 'Add New Task'}
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
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all',
                    errors.title ? 'border-red-500/50' : 'border-white/10'
                  )}
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, link, context..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
                  Priority — Umuhimu
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_PRIORITIES.map((p) => {
                    const conf = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.medium
                    const isSelected = priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          'flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all',
                          isSelected
                            ? `${conf.bgClass} border-purple-500/50 ${conf.textClass}`
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        )}
                      >
                        <span>{conf.emoji}</span>
                        <span>{conf.labelSw}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {editTodo && (
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
                    Status — Hali
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ALL_STATUSES.map((s) => {
                      const conf = STATUS_CONFIG[s] || STATUS_CONFIG.todo
                      const isSelected = status === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={cn(
                            'flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all',
                            isSelected
                              ? `${conf.bgClass} border-purple-500/50 ${conf.textClass}`
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          )}
                        >
                          <span>{conf.emoji}</span>
                          <span>{conf.labelSw}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Due Date — Mwisho wa Siku
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-black/40 border border-white/10 min-h-[42px] items-center">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? 'Type tag and press Enter...' : ''}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none px-1 min-w-[120px]"
                  />
                </div>
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
                  {isSaving ? 'Inahifadhi...' : editTodo ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default TodoForm
