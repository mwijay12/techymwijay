'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALL_MEMORY_TYPES,
  MEMORY_TYPE_CONFIG,
  type MemoryType,
} from '@/lib/memory-service'
import type { AIMemoryEntry } from '@/types/ai'

interface MemoryFormProps {
  isOpen: boolean
  editMemory?: AIMemoryEntry | null
  onSave: (data: {
    type: MemoryType
    content: string
    tags?: string[]
  }) => Promise<void>
  onClose: () => void
}

export function MemoryForm({
  isOpen,
  editMemory,
  onSave,
  onClose,
}: MemoryFormProps) {
  const [type, setType] = useState<MemoryType>('fact')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editMemory) {
      setType((editMemory.type as MemoryType) ?? 'fact')
      setContent(editMemory.content)
      setTags((editMemory as any).tags ?? [])
    } else {
      setType('fact')
      setContent('')
      setTags([])
    }
    setTagInput('')
    setErrors({})
  }, [editMemory, isOpen])

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 6) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) =>
    setTags(prev => prev.filter(t => t !== tag))

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setErrors({ content: 'Memory content is required' })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        type,
        content: content.trim(),
        tags,
      })
      onClose()
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'Failed to save memory',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-black/90 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white">
                {editMemory ? 'Edit Memory' : 'Add New Memory'}
              </h2>
              <p className="text-xs text-gray-400">
                {editMemory
                  ? 'Update this memory statement'
                  : 'Teach your AI assistant a new fact'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {errors.form && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {errors.form}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Memory Type — Aina ya Kumbukumbu
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {ALL_MEMORY_TYPES.map(t => {
                  const conf = MEMORY_TYPE_CONFIG[t]
                  const isSelected = type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all duration-150',
                        isSelected
                          ? `${conf.bgClass} ${conf.textClass}`
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      )}
                      style={
                        isSelected ? { borderColor: `${conf.color}50` } : {}
                      }
                    >
                      <span className="text-lg">{conf.emoji}</span>
                      <span className="text-[10px] font-bold">
                        {conf.label}
                      </span>
                    </button>
                  )}
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {MEMORY_TYPE_CONFIG[type].description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">
                Memory Statement — Maelezo ya Kumbukumbu
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="e.g. I prefer code solutions using Next.js App Router and TypeScript..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-all duration-200 resize-none font-sans"
              />
              {errors.content && (
                <p className="text-xs text-red-400 mt-1">{errors.content}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">
                Tags (Max 6)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 6}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 ml-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editMemory ? 'Save Changes' : 'Add Memory'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default MemoryForm
