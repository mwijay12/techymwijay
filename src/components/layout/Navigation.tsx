'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Mic,
  Volume2,
  Video,
  Shield,
  Wallet,
  CheckSquare,
  Brain,
  Settings,
  Menu,
  X,
  Zap,
  HeartPulse,
} from 'lucide-react'
import { UserAvatar } from '@/components/auth/UserAvatar'
import { SyncStatus } from '@/components/auth/SyncStatus'
import { SyncStatusBadge } from '@/components/pwa/SyncStatusBadge'
import { cn } from '@/lib/utils'

// ─── Route Definitions ─────────────────────────────────────
const NAV_ROUTES = [
  { href: '/',         label: 'Home',     icon: Home,        group: 'main'     },
  { href: '/ai-stt',   label: 'Dictate',  icon: Mic,         group: 'voice'    },
  { href: '/ai-tts',   label: 'Voice',    icon: Volume2,     group: 'voice'    },
  { href: '/meeting',  label: 'Meeting',  icon: Video,       group: 'voice'    },
  { href: '/blog',     label: 'Vault',    icon: Shield,      group: 'vault'    },
  { href: '/spending', label: 'Spending', icon: Wallet,      group: 'life'     },
  { href: '/todos',    label: 'Todos',    icon: CheckSquare, group: 'life'     },
  { href: '/memory',   label: 'Memory',   icon: Brain,       group: 'ai'       },
  { href: '/settings', label: 'Settings', icon: Settings,    group: 'system'   },
] as const

const PRIMARY_NAV = ['/ai-stt', '/ai-tts', '/blog', '/spending', '/todos', '/meeting']

export function Navigation({ onOpenChat }: { onOpenChat?: () => void }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isElectron, setIsElectron] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Detect Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      setIsElectron(true)
    }
  }, [])

  // Scroll detection for nav opacity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    if (mobileOpen) {
      document.addEventListener('mousedown', handleOutside)
    }
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [mobileOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Main Navigation Bar ──────────────────────────── */}
      <nav
        className={cn(
          'fixed left-0 right-0 z-50 transition-all duration-300',
          isElectron ? 'top-9' : 'top-0',
          scrolled
            ? 'bg-brand-dark/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ──────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div className="relative w-8 h-8 rounded-xl bg-gradient-brand 
                flex items-center justify-center shadow-lg
                group-hover:glow-primary transition-all duration-300">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold gradient-text">
                  Mwijay Tech
                </span>
                <div className="text-[10px] text-brand-muted leading-none -mt-0.5">
                  AI Voice Studio
                </div>
              </div>
            </Link>

            {/* ── Desktop Navigation Links ──────────────── */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ROUTES.filter(r => PRIMARY_NAV.includes(r.href)).map((route) => {
                const Icon = route.icon
                const active = isActive(route.href)

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                      'text-sm font-medium transition-all duration-200',
                      active
                        ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                        : 'text-brand-muted hover:text-brand-text hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{route.label}</span>

                    {active && (
                      <motion.div
                        layoutId="nav-active-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 
                          w-1 h-1 rounded-full bg-brand-primary"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}

              <div className="w-px h-4 bg-brand-border mx-1" />
              {NAV_ROUTES.filter(r =>
                ['/memory', '/settings'].includes(r.href)
              ).map((route) => {
                const Icon = route.icon
                const active = isActive(route.href)

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                      'text-sm font-medium transition-all duration-200',
                      active
                        ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                        : 'text-brand-muted hover:text-brand-text hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{route.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* ── Right Side: Sync + Avatar + Menu Button ── */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/health"
                className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:text-rose-400 transition-all"
                title="System Health & Verification"
              >
                <HeartPulse className="w-3.5 h-3.5" />
              </Link>
              <SyncStatusBadge />
              <UserAvatar />

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center 
                  w-9 h-9 rounded-xl glass hover:bg-white/10
                  transition-all duration-200 text-brand-muted 
                  hover:text-brand-text"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Navigation Drawer ─────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'fixed right-0 bottom-0 z-50 w-72',
                'bg-brand-surface border-l border-brand-border',
                'flex flex-col shadow-2xl lg:hidden',
                isElectron ? 'top-9' : 'top-0'
              )}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 
                border-b border-brand-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-brand 
                    flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold gradient-text text-sm">
                    Navigation
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-7 h-7 rounded-lg glass flex items-center 
                    justify-center text-brand-muted hover:text-brand-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Route groups */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6">
                <MobileNavGroup
                  label="Voice Studio"
                  routes={NAV_ROUTES.filter(r =>
                    ['/', '/ai-stt', '/ai-tts', '/meeting'].includes(r.href)
                  )}
                  isActive={isActive}
                />
                <MobileNavGroup
                  label="Developer Vault"
                  routes={NAV_ROUTES.filter(r => r.href === '/blog')}
                  isActive={isActive}
                />
                <MobileNavGroup
                  label="Personal"
                  routes={NAV_ROUTES.filter(r =>
                    ['/spending', '/todos'].includes(r.href)
                  )}
                  isActive={isActive}
                />
                <MobileNavGroup
                  label="AI & System"
                  routes={NAV_ROUTES.filter(r =>
                    ['/memory', '/settings'].includes(r.href)
                  )}
                  isActive={isActive}
                />
              </div>

              {/* Drawer footer */}
              <div className="px-4 py-4 border-t border-brand-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-muted">
                    Mwijay Tech v1.0.0
                  </span>
                  <SyncStatus />
                </div>
                <p className="text-[10px] text-brand-muted/50 mt-1">
                  Built with ❤️ in Tanzania 🇹🇿
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileNavGroup({
  label,
  routes,
  isActive,
}: {
  label: string
  routes: typeof NAV_ROUTES[number][]
  isActive: (href: string) => boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest 
        text-brand-muted/60 px-2 mb-1.5">
        {label}
      </p>
      <div className="space-y-0.5">
        {routes.map((route) => {
          const Icon = route.icon
          const active = isActive(route.href)

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'text-sm font-medium transition-all duration-150',
                active
                  ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                  : 'text-brand-text hover:bg-white/5 hover:text-brand-primary'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 flex-shrink-0',
                active ? 'text-brand-primary' : 'text-brand-muted'
              )} />
              <span>{route.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Navigation