'use client'

import { useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIProviderModel } from '@/lib/ai-provider-catalog'

interface ModelSelectorProps {
  models: AIProviderModel[]
  value: string
  onChange: (modelId: string) => void
  label?: string
  disabled?: boolean
}

export default function ModelSelector({
  models,
  value,
  onChange,
  label = 'Default Model',
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedModel = models.find((m) => m.id === value)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all duration-200',
            disabled
              ? 'border-white/5 bg-white/[0.02] text-gray-600 cursor-not-allowed'
              : 'border-white/10 bg-white/5 hover:bg-white/[0.07] text-white cursor-pointer',
            isOpen && 'border-purple-500/50 ring-1 ring-purple-500/20'
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className={cn(disabled && 'text-gray-600')}>
              {selectedModel?.label ?? 'Select a model'}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-xl shadow-black/40 overflow-hidden">
            {models.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange(model.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                  model.id === value
                    ? 'bg-purple-500/10 text-purple-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex-1">
                  <div className="font-medium">{model.label}</div>
                  {model.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {model.description}
                    </div>
                  )}
                </div>
                {model.id === value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}