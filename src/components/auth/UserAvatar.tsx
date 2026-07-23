'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  Settings,
  User,
  Brain,
  ChevronDown,
  Shield,
  Chrome,
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export function UserAvatar() {
  const { user, isAnonymous, signOut, upgradeAnonymousToGoogle, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-brand-surface animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/signin"
        className="px-4 py-2 text-sm font-medium glass rounded-lg 
          border border-brand-primary/30 text-brand-primary 
          hover:bg-brand-primary/10 transition-all duration-200"
      >
        Sign In
      </Link>
    )
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    setIsOpen(false)
    try {
      await signOut()
      router.push('/')
    } finally {
      setSigningOut(false)
    }
  }

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl 
          hover:bg-white/5 transition-all duration-200 group"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden 
          ring-2 ring-brand-primary/30 group-hover:ring-brand-primary/60 
          transition-all duration-200">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? 'User'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-brand 
              flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          )}
        </div>
        {isAnonymous && (
          <span className="text-xs text-brand-muted hidden sm:block">Guest</span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-brand-muted transition-transform duration-200 
            ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-12 z-50 w-64 
            glass-strong rounded-2xl border border-white/10 
            shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
            
            {/* User Info */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-brand-primary/30 flex-shrink-0">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName ?? 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand 
                      flex items-center justify-center text-white text-sm font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-text truncate">
                    {user.displayName ?? (isAnonymous ? 'Guest User' : 'Mwijay User')}
                  </p>
                  <p className="text-xs text-brand-muted truncate">
                    {user.email || 'Anonymous guest session'}
                  </p>
                </div>
              </div>

              {isAnonymous ? (
                <button
                  onClick={() => {
                    upgradeAnonymousToGoogle()
                    setIsOpen(false)
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-all"
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>Link Google Account</span>
                </button>
              ) : (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-success">
                  <Shield className="w-3 h-3" />
                  <span>Authenticated via Google</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <MenuLink
                href="/settings"
                icon={<Settings className="w-4 h-4" />}
                label="Settings & API Keys"
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href="/memory"
                icon={<Brain className="w-4 h-4" />}
                label="AI Memory"
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href="/blog"
                icon={<User className="w-4 h-4" />}
                label="Developer Vault"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-white/5">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                  text-sm text-brand-error hover:bg-brand-error/10 
                  transition-all duration-200 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl
        text-sm text-brand-text hover:bg-white/5 
        hover:text-brand-primary transition-all duration-200"
    >
      <span className="text-brand-muted">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}