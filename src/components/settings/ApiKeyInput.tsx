'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApiKeyInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  isRequired?: boolean
  keyCount?: number
  isPoolMode?: boolean
  className?: string
}

export function ApiKeyInput({
  label,
  value,
  onChange,
  placeholder = 'sk-••••••••••••••••••••••',
  hint,
  isRequired = false,
  keyCount,
  isPoolMode = false,
  className,
}: ApiKeyInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      console.warn('Copy failed')
    }
  }

  if (isPoolMode && keyCount !== undefined) {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
          {label}
          {isRequired && <span className="text-red-400 text-xs">*</span>}
        </label>

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          {keyCount > 0 ? (
            <>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(keyCount, 8) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-4 rounded-sm bg-purple-500/60"
                      style={{ opacity: 1 - (i / Math.min(keyCount, 8)) * 0.3 }}
                    />
                  ))}
                  {keyCount > 8 && (
                    <span className="text-xs text-purple-400 ml-1 self-center font-bold">
                      +{keyCount - 8}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-300">
                  {keyCount} {keyCount === 1 ? 'key' : 'keys'} loaded from{' '}
                  <code className="text-purple-400 text-xs font-mono">.env.local</code>
                </span>
              </div>
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Info className="w-4 h-4 text-gray-500" />
              <span>
                Add keys to{' '}
                <code className="text-purple-400 text-xs font-mono">.env.local</code>
                {' '}as{' '}
                <code className="text-blue-400 text-xs font-mono">{label.toUpperCase().replace(/ /g, '_')}_API_KEYS</code>
              </span>
            </div>
          )}
        </div>

        {hint && (
          <p className="text-xs text-gray-400 flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-500" />
            {hint}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
        {label}
        {isRequired && <span className="text-red-400 text-xs">*</span>}
      </label>

      <div className="relative flex items-center">
        <input
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 pr-20 rounded-xl text-sm',
            'bg-white/5 border border-white/10',
            'text-white placeholder:text-gray-600',
            'focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30',
            'transition-all duration-200 font-mono',
          )}
          autoComplete="off"
          spellCheck={false}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              title={isCopied ? 'Copied!' : 'Copy'}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200',
                isCopied ? 'text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/10'
              )}
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            title={isVisible ? 'Hide' : 'Show'}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {hint && (
        <p className="text-xs text-gray-400 flex items-start gap-1.5">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-500" />
          {hint}
        </p>
      )}
    </div>
  )
}

export default ApiKeyInput