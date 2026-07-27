'use client'

import { useEffect, useState, useRef } from 'react'
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
  Zap,
  WifiOff,
  Wifi,
  Minus,
  Square,
  X,
  Maximize2,
  Activity,
} from 'lucide-react'
import { UserAvatar } from '@/components/auth/UserAvatar'
import { cn } from '@/lib/utils'
import { useElectron } from '@/hooks/use-electron'

const NAV_ITEMS = [
  { href: '/',         label: 'Home',      icon: Home,        color: 'from-blue-500 to-indigo-500' },
  { href: '/ai-stt',  label: 'Dictate',   icon: Mic,         color: 'from-violet-500 to-purple-500' },
  { href: '/ai-tts',  label: 'Voice',     icon: Volume2,     color: 'from-pink-500 to-rose-500' },
  { href: '/meeting', label: 'Meeting',   icon: Video,       color: 'from-cyan-500 to-teal-500' },
  { href: '/blog',    label: 'Vault',     icon: Shield,      color: 'from-amber-500 to-orange-500' },
  { href: '/spending',label: 'Spending',  icon: Wallet,      color: 'from-emerald-500 to-green-500' },
  { href: '/todos',   label: 'Tasks',     icon: CheckSquare, color: 'from-blue-400 to-cyan-400' },
  { href: '/memory',  label: 'Memory',    icon: Brain,       color: 'from-fuchsia-500 to-pink-500' },
  { href: '/settings',label: 'Settings',  icon: Settings,    color: 'from-slate-400 to-gray-400' },
]

export function ElectronDesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const {
    isElectron, isOnline, isMaximized, appVersion,
    minimize, maximize, close,
  } = useElectron()

  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  if (!isElectron) return <>{children}</>

  const activeItem = NAV_ITEMS.find(i => isActive(i.href)) ?? NAV_ITEMS[0]

  return (
    <div className="electron-shell flex h-screen w-screen overflow-hidden bg-[#0a0a12]">

      {/* ─── Ambient Background ────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] opacity-20"
          style={{
            background: 'radial-gradient(circle at 0% 0%, #5b21b6 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-15"
          style={{
            background: 'radial-gradient(circle at 100% 100%, #1d4ed8 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-5"
          style={{
            background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ─── Sidebar ───────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="relative flex flex-col z-50 overflow-hidden flex-shrink-0"
        style={{
          paddingTop: '36px', /* room for title bar */
          background: 'rgba(12, 12, 22, 0.85)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo area */}
        <div className={cn(
          'flex items-center gap-2.5 px-3 py-4 border-b border-white/5',
          collapsed && 'justify-center px-2'
        )}>
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="text-sm font-bold text-white leading-tight">Mwijay Tech</div>
                <div className="text-[10px] text-white/40 leading-none">AI Voice Studio</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const hovered = hoveredItem === item.href

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer',
                    'transition-all duration-200 group',
                    active
                      ? 'bg-white/10 border border-white/10'
                      : 'hover:bg-white/5',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  {/* Active left bar */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                      style={{
                        background: `linear-gradient(to bottom, var(--tw-gradient-stops))`,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon with gradient bg on active */}
                  <div className={cn(
                    'relative w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    active
                      ? `bg-gradient-to-br ${item.color} shadow-md`
                      : 'bg-white/5 group-hover:bg-white/10'
                  )}>
                    <Icon className={cn(
                      'w-3.5 h-3.5 transition-colors duration-200',
                      active ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                    )} />
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.12 }}
                        className={cn(
                          'text-[13px] font-medium whitespace-nowrap transition-colors duration-200',
                          active ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                        )}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <AnimatePresence>
                      {hovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute left-[52px] z-50 bg-[#1a1a2e] border border-white/10 text-white text-xs px-2 py-1 rounded-md shadow-xl pointer-events-none whitespace-nowrap"
                        >
                          {item.label}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section: user + status */}
        <div className={cn(
          'flex items-center gap-2 p-3 border-t border-white/5',
          collapsed && 'justify-center px-2'
        )}>
          <div className="flex-shrink-0">
            <UserAvatar />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-[10px] overflow-hidden"
              >
                {isOnline ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-400 font-mono">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 font-mono">Offline</span>
                  </>
                )}
                <span className="text-white/20 ml-auto font-mono">v{appVersion}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute bottom-16 -right-3 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all z-50"
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </button>
      </motion.aside>

      {/* ─── Main Content Area ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10 pt-9">


        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default ElectronDesktopShell
