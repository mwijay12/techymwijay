'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Shield, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/AuthProvider'

interface VaultLockScreenProps {
  onUnlock: (password: string) => Promise<boolean>
  isLoading: boolean
}

export function VaultLockScreen({
  onUnlock,
  isLoading,
}: VaultLockScreenProps) {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || isLoading) return

    setError('')
    const success = await onUnlock(password)

    if (!success) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setPassword('')

      if (newAttempts >= 5) {
        setError(`${newAttempts} failed attempts. Double-check your master password.`)
      } else {
        setError('Incorrect password. Please try again.')
      }

      inputRef.current?.focus()
    }
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'Davie'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-xl shadow-purple-500/10"
          >
            <Shield className="w-8 h-8 text-purple-400" />
          </motion.div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">
            Vault Locked
          </h2>
          <p className="text-sm text-gray-400">
            Hey {firstName}, enter your master password to unlock
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Master password"
              autoComplete="current-password"
              className={cn(
                'w-full pl-11 pr-11 py-3.5 rounded-xl text-sm bg-black/60 border text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all duration-200',
                error
                  ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30'
                  : 'border-white/10 focus:border-purple-500/50 focus:ring-purple-500/30'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!password.trim() || isLoading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xl',
              password.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-purple-500/25'
                : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Unlock Vault
              </>
            )}
          </button>
        </form>

        {attempts > 0 && (
          <p className="text-center text-xs text-gray-500 mt-3">
            {attempts} failed {attempts === 1 ? 'attempt' : 'attempts'}
          </p>
        )}

        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>AES-256-GCM · PBKDF2 · 310k iterations</span>
        </div>
      </motion.div>
    </div>
  )
}

export default VaultLockScreen
