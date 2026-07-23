'use client'

import { useMemo } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAppSettings } from '@/hooks/use-app-settings'
import { useSync } from '@/hooks/use-sync'
import { usePWA } from '@/hooks/use-pwa'
import { useElectron } from '@/hooks/use-electron'
import type { UserProfile } from '@/types/user'
import type { AppSettings } from '@/lib/app-settings'
import type { SyncState } from '@/lib/firestore-sync'

export type AppPlatform = 'web' | 'electron' | 'pwa' | 'extension'

export interface AppState {
  user: UserProfile | null
  isAuthenticated: boolean
  isAuthLoading: boolean

  settings: AppSettings
  isSettingsLoaded: boolean

  platform: AppPlatform
  isElectron: boolean
  isPWA: boolean
  isOnline: boolean

  syncState: SyncState
  isSyncing: boolean
  pendingWrites: number

  isInstallable: boolean
  isInstalled: boolean
  updateAvailable: boolean

  features: {
    canUseGroqSTT: boolean
    canUseElevenLabs: boolean
    canUseAIChat: boolean
    canUseSpline3D: boolean
    canInstallApp: boolean
    hasGlobalHotkeys: boolean
    hasSystemTray: boolean
    hasClipboardMonitor: boolean
    hasOfflineMode: boolean
  }
}

function detectPlatform(
  isElectron: boolean,
  isPWA: boolean
): AppPlatform {
  if (isElectron) return 'electron'
  if (isPWA) return 'pwa'
  if (
    typeof window !== 'undefined' &&
    typeof (window as any).chrome !== 'undefined' &&
    (window as any).chrome?.runtime?.id
  ) {
    return 'extension'
  }
  return 'web'
}

export function useAppState(): AppState {
  const { user, loading: isAuthLoading } = useAuth()
  const { settings, isLoaded: isSettingsLoaded } = useAppSettings()
  const sync = useSync()
  const pwa = usePWA()
  const electron = useElectron()

  const platform = detectPlatform(electron.isElectron, pwa.isInstalled)
  const isOnline = electron.isElectron
    ? electron.isOnline
    : pwa.isOnline

  const features = useMemo(() => ({
    canUseGroqSTT: isOnline,
    canUseElevenLabs: isOnline,
    canUseAIChat: isOnline,
    canUseSpline3D: isOnline && !electron.isElectron,
    canInstallApp: pwa.isInstallable && !pwa.isInstalled && !electron.isElectron,
    hasGlobalHotkeys: electron.isElectron,
    hasSystemTray: electron.isElectron,
    hasClipboardMonitor: electron.isElectron,
    hasOfflineMode: pwa.isInstalled || electron.isElectron,
  }), [isOnline, electron.isElectron, pwa.isInstallable, pwa.isInstalled])

  return {
    user,
    isAuthenticated: !!user,
    isAuthLoading,

    settings,
    isSettingsLoaded,

    platform,
    isElectron: electron.isElectron,
    isPWA: pwa.isInstalled,
    isOnline,

    syncState: sync.syncState,
    isSyncing: sync.isSyncing,
    pendingWrites: sync.pendingCount,

    isInstallable: pwa.isInstallable,
    isInstalled: pwa.isInstalled,
    updateAvailable: pwa.updateAvailable,

    features,
  }
}
