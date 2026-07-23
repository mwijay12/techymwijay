'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Plus,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useMemory } from '@/hooks/use-memory'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { MemoryForm } from '@/components/memory/MemoryForm'
import { MemoryStats } from '@/components/memory/MemoryStats'
import { MemoryCategoryFilter } from '@/components/memory/MemoryCategoryFilter'
import type { AIMemoryEntry } from '@/types/ai'

export default function MemoryPage() {
  const {
    filteredMemories,
    stats,
    isLoading,
    filterType,
    searchQuery,
    setFilterType,
    setSearchQuery,
    addMemory,
    editMemory,
    removeMemory,
    exportMemories,
    refreshFromFirestore,
  } = useMemory()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<AIMemoryEntry | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleOpenAdd = () => {
    setEditingMemory(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (memory: AIMemoryEntry) => {
    setEditingMemory(memory)
    setIsFormOpen(true)
  }

  const handleSave = async (data: {
    type: any
    content: string
    tags?: string[]
  }) => {
    if (editingMemory) {
      await editMemory(editingMemory.id, data)
    } else {
      await addMemory(data)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshFromFirestore()
    } finally {
      setIsRefreshing(false)
    }
  }

  const counts: Record<string, number> = {
    all: stats.total,
    ...stats.byType,
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PageWrapper maxWidth="7xl">
          <div className="space-y-6 pb-16">
            {/* Top Bar / Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Personal AI Memory
                  </h1>
                </div>
                <p className="text-xs text-gray-400">
                  Kumbukumbu za AI — Teach your assistant facts, preferences, and context that persist across calls
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                  title="Sync with Firestore"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>

                <button
                  onClick={exportMemories}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                  title="Export memories as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Memory</span>
                </button>
              </div>
            </div>

            {/* Stats Dashboard */}
            <MemoryStats stats={stats} />

            {/* Filter & Search bar */}
            <MemoryCategoryFilter
              filterType={filterType}
              searchQuery={searchQuery}
              onTypeChange={setFilterType}
              onSearchChange={setSearchQuery}
              counts={counts}
            />

            {/* Memory list */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 p-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  No memories found
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                  {searchQuery || filterType !== 'all'
                    ? 'No memories match your search filter.'
                    : 'Teach your AI assistant facts about you so it understands your context better.'}
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20"
                >
                  Add First Memory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredMemories.map(memory => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onEdit={handleOpenEdit}
                      onDelete={removeMemory}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Add / Edit modal */}
          <MemoryForm
            isOpen={isFormOpen}
            editMemory={editingMemory}
            onSave={handleSave}
            onClose={() => setIsFormOpen(false)}
          />
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}
