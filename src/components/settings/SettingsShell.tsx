'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bot,
  Mic,
  User,
  Shield,
  Settings,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import ChatComponent from '@/components/layout/ChatComponent'

interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'ai',       label: 'AI Providers',  icon: Bot,          color: 'text-purple-400' },
  { id: 'voice',    label: 'Voice & Speech', icon: Mic,          color: 'text-blue-400'   },
  { id: 'personal', label: 'Personal',       icon: User,         color: 'text-yellow-400' },
  { id: 'vault',    label: 'Vault Security', icon: Shield,       color: 'text-emerald-400 font-bold' },
  { id: 'app',      label: 'App Behavior',   icon: Settings,     color: 'text-gray-400'   },
  { id: 'danger',   label: 'Danger Zone',    icon: AlertTriangle, color: 'text-red-400'    },
]

interface SettingsShellProps {
  children: (activeSection: string) => React.ReactNode
}

export function SettingsShell({ children }: SettingsShellProps) {
  const [activeSection, setActiveSection] = useState('ai')
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <AppShell>
      <PageWrapper maxWidth="7xl">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-6 py-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings & System Preferences</h1>
              <p className="text-sm text-gray-400">
                Manage AI provider key pools, voice parameters, security controls & application preferences.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden sticky top-24">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Categories
                  </p>
                </div>

                <nav className="p-2 space-y-1">
                  {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl',
                          'text-sm font-medium transition-all duration-150 text-left',
                          isActive
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <Icon className={cn(
                          'w-4 h-4 flex-shrink-0',
                          isActive ? 'text-purple-300' : item.color
                        )} />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </aside>

            {/* Mobile Tab Bar */}
            <div className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl',
                        'text-xs font-medium transition-all duration-150 border',
                        isActive
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main Section Content */}
            <div className="flex-1 min-w-0">
              {children(activeSection)}
            </div>
          </div>
        </div>

        <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
      </PageWrapper>
    </AppShell>
  )
}

export default SettingsShell