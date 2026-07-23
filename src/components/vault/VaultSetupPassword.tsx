'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { assessPasswordStrength } from '@/lib/encryption'

interface VaultSetupPasswordProps {
  onSetup: (password: string) => Promise<void>
  isLoading: boolean
}

export function VaultSetupPassword({
  onSetup,
  isLoading,
}: VaultSetupPasswordProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  const strength = assessPasswordStrength(password)
  const passwordsMatch = password === confirm && confirm.length > 0
  const isValid =
    password.length >= 8 &&
    passwordsMatch &&
    acknowledged &&
    strength.score >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }
    if (strength.score < 2) {
      setError('Password is too weak — add uppercase letters and numbers')
      return
    }

    try {
      await onSetup(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    }
  }

  const strengthSegments = [0, 1, 2, 3, 4]
  const segmentColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white"
      >
        <div className="px-6 py-5 border-b border-white/10 bg-purple-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Secure Your Vault
              </h2>
              <p className="text-xs text-gray-400">
                Set a master password to encrypt your secrets
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300 space-y-1">
              <p className="font-semibold text-yellow-400">
                ⚠️ Write this password down
              </p>
              <p>
                Your master password is <strong>never stored</strong> on any server. If you forget it, your encrypted secrets cannot be recovered.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter a strong master password"
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {strengthSegments.map((seg) => (
                    <div
                      key={seg}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all duration-300',
                        seg <= strength.score ? segmentColors[strength.score] : 'bg-gray-800'
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-medium', strength.color)}>
                    {strength.label}
                  </span>
                  {strength.suggestions[0] && (
                    <span className="text-xs text-gray-400">
                      {strength.suggestions[0]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  setError('')
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={cn(
                  'w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-black/40 border text-white placeholder:text-gray-600 focus:outline-none transition-all duration-200',
                  confirm.length > 0
                    ? passwordsMatch
                      ? 'border-emerald-500/50'
                      : 'border-red-500/50'
                    : 'border-white/10 focus:border-purple-500/50'
                )}
              />
              {confirm.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {passwordsMatch ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-xs text-gray-400 leading-relaxed">
              I understand that if I forget this password,{' '}
              <strong className="text-white">my encrypted secrets cannot be recovered.</strong> I have written it down.
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xl',
              isValid && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-purple-500/25'
                : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isLoading ? 'Setting up encryption...' : 'Secure My Vault'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default VaultSetupPassword
