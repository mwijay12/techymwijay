'use client'

import { useState } from 'react'
import { Eye, EyeOff, X, Key } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApiKeyInputProps {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  providerColor?: string
  /** Show a badge next to the label */
  badge?: React.ReactNode
  /** If true, the input shows a saved state preview */
  isSaved?: boolean
}

export default function ApiKeyInput({
  label,
  description,
  value,
  onChange,
  placeholder = 'Enter API key...',
  providerColor,
  badge,
  isSaved = false,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const hasValue = value.length > 0
  const maskedValue = hasValue
    ? `${value.slice(0, 4)}${'•'.repeat(Math.min(value.length - 8, 12))}${value.slice(-4)}`
    : ''

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {providerColor && (
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: providerColor }}
            />
          )}
          <label className="text-sm font-medium text-gray-200">{label}</label>
        </div>
        {badge}
      </div>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      <div
        className={cn(
          'relative flex items-center rounded-lg border transition-all duration-200',
          isFocused
            ? 'border-purple-500/50 ring-1 ring-purple-500/20'
            : isSaved && hasValue
            ? 'border-emerald-500/30'
            : 'border-white/10',
          'bg-white/5 hover:bg-white/[0.07]'
        )}
      >
        <Key className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none" />

        {isSaved && hasValue && !isFocused ? (
          // Show masked preview when saved
          <div className="flex items-center justify-between w-full pl-10 pr-2 py-2.5">
            <span className="text-sm text-gray-400 font-mono tracking-wider">
              {maskedValue}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onChange('')}
                className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Clear key"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          // Show editable input
          <>
            <input
              type={showKey ? 'text' : 'password'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isSaved && hasValue ? maskedValue : placeholder}
              className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 pl-10 pr-20 py-2.5 outline-none font-mono"
              autoComplete="off"
              spellCheck={false}
            />
            {hasValue && (
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                  tabIndex={-1}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}