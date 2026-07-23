'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Eye, EyeOff, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { assessPasswordStrength, encryptSecret, decryptSecret } from '@/lib/encryption'
import { changeMasterPassword } from '@/lib/vault-lock'
import { loadVaultFromStorage, saveVaultToStorage } from '@/lib/vault-service'
import { useAuth } from '@/components/auth/AuthProvider'
import type { VaultItem } from '@/types/vault'

interface VaultChangePasswordProps {
  isOpen: boolean
  currentPassword: string
  onClose: () => void
  onSuccess: () => void
}

export function VaultChangePassword({
  isOpen,
  currentPassword,
  onClose,
  onSuccess,
}: VaultChangePasswordProps) {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const strength = assessPasswordStrength(newPassword)
  const isValid =
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    strength.score >= 2

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetUid = user?.uid || 'guest-user'
    if (!isValid) return

    setIsProcessing(true)
    setError('')

    try {
      const items = loadVaultFromStorage(targetUid)
      const encryptedItems = items.filter(
        i => i.secretContent && i.secretContentEncrypted
      )

      setProgress(10)

      const reencryptedItems: VaultItem[] = [...items]

      for (let i = 0; i < encryptedItems.length; i++) {
        const item = encryptedItems[i]

        if (item.secretContent && item.secretContentEncrypted) {
          const plaintext = await decryptSecret(
            item.secretContent,
            currentPassword,
            targetUid
          )

          const newCiphertext = await encryptSecret(
            plaintext,
            newPassword,
            targetUid
          )

          const idx = reencryptedItems.findIndex(r => r.id === item.id)
          if (idx !== -1) {
            reencryptedItems[idx] = {
              ...reencryptedItems[idx],
              secretContent: newCiphertext,
              secretContentEncrypted: true,
              updatedAt: new Date().toISOString(),
            }
          }
        }

        setProgress(10 + Math.round((i / (encryptedItems.length || 1)) * 80))
      }

      saveVaultToStorage(targetUid, reencryptedItems)
      setProgress(90)

      await changeMasterPassword(targetUid, newPassword)
      setProgress(100)

      await new Promise(r => setTimeout(r, 400))
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={!isProcessing ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">
                  Change Master Password
                </h2>
              </div>
              {!isProcessing && (
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300">
                  Changing your password will re-encrypt all stored secrets with the new key.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  New Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new master password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new master password"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {isProcessing && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Re-encrypting vault items...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-sm bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isProcessing}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Change Password
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default VaultChangePassword
