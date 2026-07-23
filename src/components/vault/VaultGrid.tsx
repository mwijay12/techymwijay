'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { VaultCard } from './VaultCard'
import { VaultEmptyState } from './VaultEmptyState'
import type { VaultItem, VaultCategory } from '@/types/vault'

interface VaultGridProps {
  items: VaultItem[]
  category: VaultCategory | 'all'
  searchQuery?: string
  isLoading?: boolean
  masterPassword?: string | null
  onEdit: (item: VaultItem) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  onAdd: () => void
  onResetSearch?: () => void
}

export function VaultGrid({
  items,
  category,
  searchQuery,
  isLoading = false,
  masterPassword,
  onEdit,
  onDelete,
  onPin,
  onAdd,
  onResetSearch,
}: VaultGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse p-4 space-y-3"
          >
            <div className="w-20 h-5 rounded-lg bg-white/10" />
            <div className="w-3/4 h-5 rounded-lg bg-white/10" />
            <div className="w-full h-12 rounded-lg bg-white/5" />
            <div className="w-1/2 h-4 rounded-lg bg-white/10 mt-auto" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <VaultEmptyState
        category={category}
        searchQuery={searchQuery}
        onAdd={onAdd}
        onResetSearch={onResetSearch}
      />
    )
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <VaultCard
            key={item.id}
            item={item}
            masterPassword={masterPassword}
            onEdit={onEdit}
            onDelete={onDelete}
            onPin={onPin}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default VaultGrid
