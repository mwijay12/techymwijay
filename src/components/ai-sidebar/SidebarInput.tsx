'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  onSend: (message: string) => void
  loading: boolean
  placeholder?: string
}

export function SidebarInput({ onSend, loading, placeholder }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [value])

  const handleSend = () => {
    if (!value.trim() || loading) return
    onSend(value.trim())
    setValue('')
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-white/5">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Ask about your transcription...'}
        rows={1}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-purple-500/40 resize-none transition-colors"
        disabled={loading}
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSend}
        disabled={!value.trim() || loading}
        className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </div>
  )
}