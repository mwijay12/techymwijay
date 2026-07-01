'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Chrome, Shield, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export function UserAvatar() {
  const { user, isAnonymous, signOut, upgradeAnonymousToGoogle } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-white/50" />
          </div>
        )}
        {isAnonymous && (
          <span className="text-xs text-white/30 hidden sm:block">Guest</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl p-2 z-50 shadow-xl"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-sm font-medium text-white/80">
                {user.displayName ?? 'Anonymous User'}
              </p>
              <p className="text-xs text-white/30">
                {user.email ?? 'No email — guest session'}
              </p>
            </div>

            {isAnonymous && (
              <button
                onClick={() => { upgradeAnonymousToGoogle(); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Chrome className="w-4 h-4 text-blue-400" />
                Sign in with Google
              </button>
            )}

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/25">
              <Shield className="w-3 h-3" />
              Data synced to your account
            </div>

            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-white/50 hover:text-red-400 transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}