'use client'

import { useState } from 'react'
import { Shield, Plus, Lock, KeyRound, Key, RefreshCw } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { VaultSearch } from '@/components/vault/VaultSearch'
import { VaultFilters } from '@/components/vault/VaultFilters'
import { VaultGrid } from '@/components/vault/VaultGrid'
import { VaultForm } from '@/components/vault/VaultForm'
import { VaultSetupPassword } from '@/components/vault/VaultSetupPassword'
import { VaultLockScreen } from '@/components/vault/VaultLockScreen'
import { VaultChangePassword } from '@/components/vault/VaultChangePassword'
import { useVault } from '@/hooks/use-vault'
import { useVaultLock } from '@/hooks/use-vault-lock'
import { MediaGallery } from '@/components/media/MediaGallery'
import type { VaultItem, VaultCategory } from '@/types/vault'

export default function VaultPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid')
  const {
    items,
    filteredItems,
    allTags,
    isLoading: isVaultLoading,
    filter,
    setFilter,
    resetFilter,
    addItem,
    editItem,
    removeItem,
    pinItem,
    countByCategory,
  } = useVault()

  const {
    lockStatus,
    isUnlocked,
    isLocked,
    needsSetup,
    isLoading: isLockLoading,
    unlock,
    setup,
    lock,
    masterPassword,
  } = useVaultLock()

  const [formOpen, setFormOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null)

  const handleOpenNew = (defaultCat?: VaultCategory) => {
    setEditingItem(null)
    if (defaultCat) {
      setFilter({ category: defaultCat })
    }
    setFormOpen(true)
  }

  const handleOpenEdit = (item: VaultItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleSaveItem = async (data: Parameters<typeof addItem>[0]) => {
    if (editingItem) {
      await editItem(editingItem.id, data, masterPassword)
    } else {
      await addItem(data, masterPassword)
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PageWrapper maxWidth="7xl">
          {/* Lock overlays */}
          {needsSetup && (
            <VaultSetupPassword
              onSetup={setup}
              isLoading={isLockLoading}
            />
          )}

          {isLocked && (
            <VaultLockScreen
              onUnlock={unlock}
              isLoading={isLockLoading}
            />
          )}

          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
            <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6 py-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1 text-xs text-indigo-400 mb-3">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Developer Vault & AES-256 Memory Hub</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Developer Vault
                </h1>
                <p className="text-gray-400 text-sm mt-1 max-w-2xl">
                  Store passwords, code snippets, API key pools, and personal notes. Client-side AES-256-GCM encrypted.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isUnlocked && (
                  <>
                    <button
                      onClick={() => setChangePasswordOpen(true)}
                      className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10"
                      title="Change Master Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>

                    <button
                      onClick={lock}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all"
                      title="Lock Vault"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleOpenNew()}
                  disabled={!isUnlocked}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-xl shadow-purple-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                  Add Vault Entry
                </button>
              </div>
            </div>

            {/* View Mode Switcher + Search + Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🗂️ All Entries ({filteredItems.length})
                  </button>
                  <button
                    onClick={() => setViewMode('gallery')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      viewMode === 'gallery'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🖼️ Media Gallery ({items.filter(i => i.imageUrl).length})
                  </button>
                </div>
              </div>

              <VaultSearch
                value={filter.search}
                onChange={(search) => setFilter({ search })}
              />

              <VaultFilters
                filter={filter}
                countByCategory={countByCategory}
                allTags={allTags}
                onFilterChange={setFilter}
                onReset={resetFilter}
              />
            </div>

            {/* Grid or Gallery */}
            {viewMode === 'gallery' ? (
              <MediaGallery items={items} onItemClick={handleOpenEdit} />
            ) : (
              <VaultGrid
                items={filteredItems}
                category={filter.category}
                searchQuery={filter.search}
                isLoading={isVaultLoading}
                masterPassword={masterPassword}
                onEdit={handleOpenEdit}
                onDelete={removeItem}
                onPin={pinItem}
                onAdd={() => handleOpenNew()}
                onResetSearch={() => setFilter({ search: '' })}
              />
            )}

            {/* Add / Edit Form Modal */}
            <VaultForm
              isOpen={formOpen}
              editItem={editingItem}
              defaultCategory={filter.category !== 'all' ? filter.category : 'notes'}
              onSave={handleSaveItem}
              onClose={() => setFormOpen(false)}
            />

            {/* Change Password Modal */}
            <VaultChangePassword
              isOpen={changePasswordOpen}
              currentPassword={masterPassword || ''}
              onClose={() => setChangePasswordOpen(false)}
              onSuccess={() => {}}
            />
          </div>
        </PageWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}