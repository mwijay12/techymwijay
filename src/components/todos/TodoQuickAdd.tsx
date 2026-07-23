'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Loader2, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG } from '@/types/todo'
import type { TodoPriority } from '@/types/todo'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

interface TodoQuickAddProps {
  onAdd: (data: {
    title: string
    priority: TodoPriority
  }) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

const QUICK_PRIORITIES: TodoPriority[] = ['urgent', 'high', 'medium', 'low']

export function TodoQuickAdd({
  onAdd,
  disabled = false,
  placeholder = 'Add a task quickly... (press Enter or "N")',
}: TodoQuickAddProps) {
  const [value, setValue] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [isAdding, setIsAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'n' &&
        !e.metaKey &&
        !e.ctrlKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim() || isAdding) return

    setIsAdding(true)
    try {
      await onAdd({ title: value.trim(), priority })
      setValue('')
      inputRef.current?.focus()
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setValue('')
      inputRef.current?.blur()
    }
  }

  const { isListening, fullTranscript, startListening, stopListening } = useSpeechRecognition()

  useEffect(() => {
    if (fullTranscript) {
      setValue(fullTranscript)
    }
  }, [fullTranscript])

  const toggleMic = async () => {
    if (isListening) {
      await stopListening()
    } else {
      await startListening()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 transition-all duration-200 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20"
    >
      <div className="flex items-center gap-1 pl-1 flex-shrink-0">
        {QUICK_PRIORITIES.map(p => {
          const conf = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.medium
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              title={conf.labelEn}
              className={cn(
                'w-4 h-4 rounded-full transition-all duration-150',
                priority === p
                  ? 'ring-2 ring-white/30 scale-125'
                  : 'opacity-40 hover:opacity-80'
              )}
              style={{ backgroundColor: conf.color }}
            />
          )
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isAdding}
        className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none disabled:opacity-50 px-2"
      />

      {value && (
        <span
          className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border"
          style={{
            color: PRIORITY_CONFIG[priority].color,
            backgroundColor: `${PRIORITY_CONFIG[priority].color}15`,
            borderColor: `${PRIORITY_CONFIG[priority].color}30`,
          }}
        >
          {PRIORITY_CONFIG[priority].labelSw}
        </span>
      )}

      <button
        type="button"
        onClick={toggleMic}
        title={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150',
          isListening
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        )}
      >
        <Mic className="w-4 h-4" />
      </button>

      <button
        type="submit"
        disabled={!value.trim() || isAdding || disabled}
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150',
          value.trim() && !isAdding
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25'
            : 'bg-white/5 text-gray-500 cursor-not-allowed'
        )}
      >
        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      </button>
    </form>
  )
}

export default TodoQuickAdd
