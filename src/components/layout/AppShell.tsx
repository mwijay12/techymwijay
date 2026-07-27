'use client'

import { useEffect, useState } from 'react'
import { ElectronDesktopShell } from '@/components/layout/ElectronDesktopShell'
import { ElectronTitleBar } from '@/components/layout/ElectronTitleBar'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ChatComponent } from '@/components/layout/ChatComponent'
import { ShortcutsHelp } from '@/components/electron/ShortcutsHelp'
import { ClipboardWatcher } from '@/components/electron/ClipboardWatcher'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'
import { useShortcuts } from '@/hooks/use-shortcuts'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  fullHeight?: boolean
  noFooter?: boolean
  className?: string
}

export function AppShell({
  children,
  fullHeight = false,
  noFooter = false,
  className,
}: AppShellProps) {
  const [isElectron, setIsElectron] = useState(false)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  useShortcuts({
    onShowHelp: () => setShowShortcutsHelp(true),
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
      setIsElectron(true)
    }
  }, [])

  // ── Electron: render the premium desktop shell ──────────────
  if (isElectron) {
    return (
      <>
        {/* Clipboard auto-save watcher */}
        <ClipboardWatcher />

        {/* Keyboard shortcuts reference modal */}
        <ShortcutsHelp
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />

        {/* Global AI Chat Component */}
        <ChatComponent />

        {/* Premium desktop layout */}
        <ElectronDesktopShell>
          {children}
        </ElectronDesktopShell>
      </>
    )
  }

  // ── Web / PWA: keep the original layout ────────────────────
  return (
    <div className={cn(
      'min-h-screen bg-brand-dark flex flex-col text-brand-text',
      className
    )}>
      {/* PWA Offline indicator banner */}
      <OfflineIndicator />

      {/* Offline banner notification */}
      <OfflineBanner />

      {/* Electron title bar — only shows in desktop app */}
      <ElectronTitleBar />

      {/* PWA update notification prompt */}
      <UpdatePrompt />

      {/* PWA install prompt banner */}
      <InstallPrompt />

      {/* Clipboard auto-save watcher */}
      <ClipboardWatcher />

      {/* Keyboard shortcuts reference modal */}
      <ShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Navigation */}
      <Navigation />

      {/* Main content area */}
      <main
        className={cn(
          'flex-1 flex flex-col',
          'pt-16',
          fullHeight && 'min-h-0'
        )}
      >
        {children}
      </main>

      {/* Global AI Chat Component */}
      <ChatComponent />

      {/* Footer */}
      {!noFooter && <Footer />}
    </div>
  )
}

export default AppShell
