'use client'

import { Plus, Shield, Search, KeyRound, Code2, Key, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import type { VaultCategory } from '@/types/vault'

interface VaultEmptyStateProps {
  category: VaultCategory | 'all'
  searchQuery?: string
  onAdd: () => void
  onResetSearch?: () => void
}

export function VaultEmptyState({
  category,
  searchQuery,
  onAdd,
  onResetSearch,
}: VaultEmptyStateProps) {
  if (searchQuery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white/5 border border-white/10 my-8"
      >
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No items found</h3>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          No entries matched your query "<strong className="text-white">{searchQuery}</strong>".
        </p>
        {onResetSearch && (
          <button
            onClick={onResetSearch}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
          >
            Clear Search
          </button>
        )}
      </motion.div>
    )
  }

  const icons: Record<string, any> = {
    all: Shield,
    passwords: KeyRound,
    code: Code2,
    keys: Key,
    notes: FileText,
  }

  const Icon = icons[category] || Shield

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white/5 border border-white/10 my-8"
    >
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400 shadow-xl shadow-purple-500/10">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {category === 'all'
          ? 'Your Vault is Empty'
          : `No ${category} stored yet`}
      </h3>
      <p className="text-sm text-gray-400 max-w-md mb-6">
        Store your sensitive API keys, database credentials, reusable code snippets, and critical technical notes securely.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-purple-500/25 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add First Entry
      </button>
    </motion.div>
  )
}

export default VaultEmptyState
