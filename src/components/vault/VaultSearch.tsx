'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VaultSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function VaultSearch({
  value,
  onChange,
  placeholder = 'Search passwords, code, keys, tags...',
  className,
}: VaultSearchProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-10 py-2.5 rounded-xl text-sm',
          'bg-white/5 border border-white/10 text-white',
          'placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30',
          'transition-all duration-200'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default VaultSearch
