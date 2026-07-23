'use client'

import { ChevronDown, Zap, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProviderModels } from '@/lib/ai-provider-catalog'
import type { AIProvider } from '@/types/ai'

interface ModelSelectorProps {
  provider: AIProvider
  selectedModel: string
  onSelect: (modelId: string) => void
  disabled?: boolean
  className?: string
}

export function ModelSelector({
  provider,
  selectedModel,
  onSelect,
  disabled = false,
  className,
}: ModelSelectorProps) {
  const models = getProviderModels(provider)

  if (models.length === 0) return null

  const selected = models.find(m => m.id === selectedModel) ?? models[0]

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Preferred Model
      </label>

      <div className="relative">
        <select
          value={selectedModel || selected.id}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-2.5 pr-10 rounded-xl text-sm',
            'bg-black/40 border border-white/10 appearance-none',
            'text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30',
            'transition-all duration-200 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {models.map((model) => (
            <option
              key={model.id}
              value={model.id}
              className="bg-gray-900 text-white py-1"
            >
              {model.name}
              {model.costPer1kTokens === 0 ? ' (Free)' : ''}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {selected && (
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1 font-mono">
            <Zap className="w-2.5 h-2.5 text-yellow-400" />
            {(selected.contextLength / 1000).toFixed(0)}k ctx
          </span>
          <span className="flex items-center gap-1 font-mono">
            <DollarSign className="w-2.5 h-2.5 text-emerald-400" />
            {selected.costPer1kTokens === 0
              ? 'Free'
              : `$${selected.costPer1kTokens}/1k tokens`}
          </span>
          {selected.supportsStreaming && (
            <span className="text-emerald-400">Streaming ✓</span>
          )}
        </div>
      )}
    </div>
  )
}

export default ModelSelector