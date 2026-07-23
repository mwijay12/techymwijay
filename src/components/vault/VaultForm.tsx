'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Plus, Tag, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG } from './CategoryBadge'
import type { VaultItem, VaultCategory } from '@/types/vault'
import { CloudinaryUpload } from '@/components/media/CloudinaryUpload'

interface VaultFormProps {
  isOpen: boolean
  editItem?: VaultItem | null
  defaultCategory?: VaultCategory
  onSave: (data: {
    title: string
    category: VaultCategory
    content: string
    secretContent?: string
    imageUrl?: string
    tags?: string[]
    isPinned?: boolean
    expiresAt?: string
  }) => Promise<void>
  onClose: () => void
}

const CATEGORIES: VaultCategory[] = ['notes', 'passwords', 'code', 'keys']

export function VaultForm({
  isOpen,
  editItem,
  defaultCategory = 'notes',
  onSave,
  onClose,
}: VaultFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<VaultCategory>(defaultCategory)
  const [content, setContent] = useState('')
  const [secretContent, setSecretContent] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title)
      setCategory(editItem.category)
      setContent(editItem.content)
      setSecretContent(editItem.secretContent ?? '')
      setImageUrl(editItem.imageUrl ?? '')
      setTags(editItem.tags || [])
      setIsPinned(editItem.isPinned)
      setExpiresAt(
        editItem.expiresAt
          ? new Date(editItem.expiresAt).toISOString().split('T')[0]
          : ''
      )
    } else {
      setTitle('')
      setCategory(defaultCategory)
      setContent('')
      setSecretContent('')
      setImageUrl('')
      setTags([])
      setIsPinned(false)
      setExpiresAt('')
      setShowSecret(false)
    }
    setErrors({})
  }, [editItem, defaultCategory, isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [isOpen])

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        category,
        content: content.trim(),
        secretContent: secretContent.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        tags,
        isPinned,
        expiresAt: expiresAt
          ? new Date(expiresAt).toISOString()
          : undefined,
      })
      onClose()
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to save item',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.notes
  const secretLabel =
    category === 'passwords'
      ? 'Password'
      : category === 'code'
      ? 'Code / Snippet'
      : category === 'keys'
      ? 'API Key Value'
      : 'Secret (optional)'

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-lg bg-gray-900 border border-white/10 shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col text-white"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${categoryConfig.color}20` }}
                >
                  <categoryConfig.icon
                    className="w-4 h-4"
                    style={{ color: categoryConfig.color }}
                  />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editItem ? 'Edit Entry' : 'Add to Vault'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const conf = CATEGORY_CONFIG[cat]
                    const isSelected = category === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-150',
                          isSelected
                            ? 'bg-white/10 border-purple-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        )}
                      >
                        <conf.icon
                          className="w-4 h-4"
                          style={{ color: isSelected ? conf.color : '#94a3b8' }}
                        />
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: isSelected ? conf.color : '#94a3b8' }}
                        >
                          {conf.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    category === 'passwords'
                      ? 'e.g. Gmail Account'
                      : category === 'code'
                      ? 'e.g. Firebase Init Snippet'
                      : category === 'keys'
                      ? 'e.g. OpenRouter API Key'
                      : 'e.g. Meeting Notes 2024'
                  }
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all',
                    errors.title ? 'border-red-500/50' : 'border-white/10'
                  )}
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  {category === 'code' ? 'Description' : 'Notes'}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    category === 'code'
                      ? 'What does this snippet do?'
                      : 'Any notes or context...'
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  {secretLabel}
                </label>
                <div className="relative">
                  {category === 'code' ? (
                    <textarea
                      value={secretContent}
                      onChange={(e) => setSecretContent(e.target.value)}
                      placeholder="// Paste code here..."
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/60 border border-white/10 text-emerald-300 font-mono placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  ) : (
                    <div className="relative flex items-center">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={secretContent}
                        onChange={(e) => setSecretContent(e.target.value)}
                        placeholder="Secret value..."
                        className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-black/40 border border-white/10 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 p-1 text-gray-400 hover:text-white"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Attachment / Screenshot (Optional)
                </label>
                <CloudinaryUpload
                  currentImageUrl={imageUrl}
                  onUploadComplete={(url) => setImageUrl(url)}
                  onRemove={() => setImageUrl('')}
                  compact
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-black/40 border border-white/10 min-h-[42px] items-center">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
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

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded bg-gray-800 border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Pin to top</span>
                </label>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-gray-800 border border-white/10 text-xs text-white rounded-lg px-2 py-1 focus:outline-none"
                  />
                </div>
              </div>

              {errors.submit && <p className="text-xs text-red-400">{errors.submit}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {editItem ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default VaultForm
