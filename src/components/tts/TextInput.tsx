'use client'

import { useRef } from 'react'
import { Clipboard, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  placeholder?: string
  className?: string
}

const SAMPLE_TEXTS = [
  {
    label: 'Swahili greeting',
    text: 'Habari za asubuhi! Leo ni siku nzuri ya kufanya kazi. Tutaendelea kwa nguvu na bidii. Asante kwa kusikiliza.',
  },
  {
    label: 'English + Swahili',
    text: 'Welcome to Mwijay Tech! This app helps you be more productive. Inakusaidia kufanya kazi vizuri zaidi. You can dictate, translate, and save notes using your voice.',
  },
  {
    label: 'BIT student',
    text: 'Today I need to study database design, finish the React project, and prepare for the algorithms exam. Baadaye nitaenda library kusoma.',
  },
]

export function TextInput({
  value,
  onChange,
  maxLength = 5000,
  placeholder = 'Type or paste text here to convert to speech... (Andika au bandika maandishi hapa)',
  className,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange((value + ' ' + text).trim())
      textareaRef.current?.focus()
    } catch {
      console.warn('Clipboard access denied')
    }
  }

  const charCount = value.length
  const charPercent = Math.round((charCount / maxLength) * 100)
  const isNearLimit = charPercent >= 80
  const isAtLimit = charPercent >= 100

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={6}
          className="w-full px-5 py-4 bg-transparent text-sm text-white placeholder:text-gray-500 resize-none focus:outline-none leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-1.5 rounded-sm transition-all duration-200',
                    i < Math.ceil(charPercent / 10)
                      ? isAtLimit
                        ? 'bg-red-500'
                        : isNearLimit
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                      : 'bg-white/10'
                  )}
                />
              ))}
            </div>
            <span className={cn(
              'text-[10px] font-mono',
              isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-gray-400'
            )}>
              {charCount.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              title="Paste from clipboard"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              <Clipboard className="w-3 h-3" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                title="Clear text"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {!value && (
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] text-gray-500 self-center font-medium uppercase tracking-wider">
            Try Preset:
          </span>
          {SAMPLE_TEXTS.map(sample => (
            <button
              key={sample.label}
              type="button"
              onClick={() => onChange(sample.text)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-purple-300 hover:border-purple-500/30 transition-all duration-150"
            >
              <FileText className="w-2.5 h-2.5" />
              {sample.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TextInput
