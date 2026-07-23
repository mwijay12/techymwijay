'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface ScreenshotResult {
  success: boolean
  dataUrl?: string
  width?: number
  height?: number
  sourceName?: string
  error?: string
}

export interface WindowSource {
  id: string
  name: string
  thumbnail: string
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean
      platform: string
      version: string
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      navigate: (route: string) => void
      getOnlineStatus: () => Promise<{ isOnline: boolean }>
      onOnlineStatusChanged: (
        callback: (status: { isOnline: boolean }) => void
      ) => () => void
      onNavigateTo: (callback: (route: string) => void) => () => void
      openExternal: (url: string) => Promise<{ success: boolean }>
      showNotification: (title: string, body: string) => void
      setAutoStart: (enabled: boolean) => Promise<{ success: boolean; enabled: boolean }>
      getAutoStart: () => Promise<{ enabled: boolean }>
      getAppVersion: () => Promise<string>
      getAppPath: () => Promise<string>
      setTrayOnlineStatus: (isOnline: boolean) => void
      toggleDevTools: () => void

      // Prompt 17 APIs
      captureScreenshot: () => Promise<ScreenshotResult>
      getWindowSources: () => Promise<WindowSource[]>
      captureWindow: (sourceId: string) => Promise<ScreenshotResult>

      getClipboardText: () => Promise<string>
      toggleClipboardMonitor: (enabled: boolean) => Promise<boolean>
      onClipboardDetected: (
        callback: (data: { type: 'url' | 'code' | 'text'; content: string }) => void
      ) => () => void

      toggleWidget: () => Promise<boolean>
      isWidgetOpen: () => Promise<boolean>

      updateNotificationSettings: (settings: any) => void
      onRequestDailySummary: (callback: () => void) => () => void
      sendDailySummaryResponse: (data: any) => void
    }
  }
}

export interface UseElectronReturn {
  isElectron: boolean
  platform: string
  isOnline: boolean
  isMaximized: boolean
  appVersion: string
  autoStartEnabled: boolean

  minimize: () => void
  maximize: () => void
  close: () => void
  openExternal: (url: string) => Promise<void>
  showNotification: (title: string, body: string) => void
  toggleAutoStart: () => Promise<void>
  toggleDevTools: () => void

  // Prompt 17
  captureScreenshot: () => Promise<ScreenshotResult>
  getWindowSources: () => Promise<WindowSource[]>
  captureWindow: (sourceId: string) => Promise<ScreenshotResult>
  getClipboardText: () => Promise<string>
  toggleClipboardMonitor: (enabled: boolean) => Promise<boolean>
  toggleWidget: () => Promise<boolean>
  updateNotificationSettings: (settings: any) => void
}

export function useElectron(): UseElectronReturn {
  const router = useRouter()
  const [isElectron] = useState(
    () => typeof window !== 'undefined' && !!window.electronAPI?.isElectron
  )
  const [isOnline, setIsOnline] = useState(true)
  const [isMaximized, setIsMaximized] = useState(false)
  const [appVersion, setAppVersion] = useState('1.0.0')
  const [autoStartEnabled, setAutoStartEnabled] = useState(false)

  useEffect(() => {
    if (!isElectron || !window.electronAPI) return

    window.electronAPI.getOnlineStatus().then(({ isOnline }) => {
      setIsOnline(isOnline)
    })

    window.electronAPI.getAppVersion().then(version => {
      setAppVersion(version)
    })

    window.electronAPI.getAutoStart().then(({ enabled }) => {
      setAutoStartEnabled(enabled)
    })

    window.electronAPI.isMaximized().then(maximized => {
      setIsMaximized(maximized)
    })

    const cleanupOnline = window.electronAPI.onOnlineStatusChanged(
      ({ isOnline }) => {
        setIsOnline(isOnline)
        window.electronAPI?.setTrayOnlineStatus(isOnline)
      }
    )

    const cleanupNav = window.electronAPI.onNavigateTo(route => {
      router.push(route)
    })

    return () => {
      cleanupOnline?.()
      cleanupNav?.()
    }
  }, [isElectron, router])

  useEffect(() => {
    if (isElectron) return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isElectron])

  const minimize = useCallback(() => {
    window.electronAPI?.minimize()
  }, [])

  const maximize = useCallback(() => {
    window.electronAPI?.maximize()
    setIsMaximized(prev => !prev)
  }, [])

  const close = useCallback(() => {
    window.electronAPI?.close()
  }, [])

  const openExternal = useCallback(async (url: string) => {
    if (window.electronAPI) {
      await window.electronAPI.openExternal(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const showNotification = useCallback(
    (title: string, body: string) => {
      if (window.electronAPI) {
        window.electronAPI.showNotification(title, body)
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification(title, { body })
      }
    },
    []
  )

  const toggleAutoStart = useCallback(async () => {
    if (!window.electronAPI) return
    const newState = !autoStartEnabled
    const result = await window.electronAPI.setAutoStart(newState)
    if (result.success) {
      setAutoStartEnabled(result.enabled)
    }
  }, [autoStartEnabled])

  const toggleDevTools = useCallback(() => {
    window.electronAPI?.toggleDevTools()
  }, [])

  // Prompt 17 Actions
  const captureScreenshot = useCallback(async (): Promise<ScreenshotResult> => {
    if (!window.electronAPI?.captureScreenshot) {
      return { success: false, error: 'Not in Electron environment' }
    }
    return await window.electronAPI.captureScreenshot()
  }, [])

  const getWindowSources = useCallback(async (): Promise<WindowSource[]> => {
    if (!window.electronAPI?.getWindowSources) return []
    return await window.electronAPI.getWindowSources()
  }, [])

  const captureWindow = useCallback(
    async (sourceId: string): Promise<ScreenshotResult> => {
      if (!window.electronAPI?.captureWindow) {
        return { success: false, error: 'Not in Electron environment' }
      }
      return await window.electronAPI.captureWindow(sourceId)
    },
    []
  )

  const getClipboardText = useCallback(async (): Promise<string> => {
    if (!window.electronAPI?.getClipboardText) return ''
    return await window.electronAPI.getClipboardText()
  }, [])

  const toggleClipboardMonitor = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (!window.electronAPI?.toggleClipboardMonitor) return false
      return await window.electronAPI.toggleClipboardMonitor(enabled)
    },
    []
  )

  const toggleWidget = useCallback(async (): Promise<boolean> => {
    if (!window.electronAPI?.toggleWidget) return false
    return await window.electronAPI.toggleWidget()
  }, [])

  const updateNotificationSettings = useCallback((settings: any) => {
    window.electronAPI?.updateNotificationSettings(settings)
  }, [])

  return {
    isElectron,
    platform: window.electronAPI?.platform ?? 'web',
    isOnline,
    isMaximized,
    appVersion,
    autoStartEnabled,
    minimize,
    maximize,
    close,
    openExternal,
    showNotification,
    toggleAutoStart,
    toggleDevTools,

    captureScreenshot,
    getWindowSources,
    captureWindow,
    getClipboardText,
    toggleClipboardMonitor,
    toggleWidget,
    updateNotificationSettings,
  }
}
