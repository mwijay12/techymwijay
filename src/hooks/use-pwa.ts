'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  registerServiceWorker,
  onServiceWorkerUpdate,
  applyServiceWorkerUpdate,
  captureInstallPrompt,
  showInstallPrompt,
  isInstallPromptAvailable,
  isAppInstalled,
  isIOSSafari,
} from '@/lib/pwa-service'

export interface UsePWAReturn {
  isInstalled: boolean
  isInstallable: boolean
  isIOSSafari: boolean
  updateAvailable: boolean
  isOnline: boolean
  swRegistered: boolean

  installApp: () => Promise<void>
  applyUpdate: () => void
  dismissUpdate: () => void
}

export function usePWA(): UsePWAReturn {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [swRegistered, setSwRegistered] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsInstalled(isAppInstalled())
    setIsIOS(isIOSSafari())
    setIsOnline(navigator.onLine)

    captureInstallPrompt()

    const checkInstallable = () => {
      setIsInstallable(isInstallPromptAvailable())
    }

    window.addEventListener('beforeinstallprompt', checkInstallable)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    registerServiceWorker().then((registration) => {
      if (registration) {
        setSwRegistered(true)

        onServiceWorkerUpdate(registration, () => {
          setUpdateAvailable(true)
        })

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'REPLAY_SYNC_QUEUE') {
            window.dispatchEvent(new CustomEvent('mwijay-replay-sync'))
          }
        })
      }
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallable)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = useCallback(async () => {
    const outcome = await showInstallPrompt()
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setIsInstallable(false)
    }
  }, [])

  const applyUpdate = useCallback(() => {
    applyServiceWorkerUpdate()
    setUpdateAvailable(false)
  }, [])

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false)
  }, [])

  return {
    isInstalled,
    isInstallable,
    isIOSSafari: isIOS,
    updateAvailable,
    isOnline,
    swRegistered,
    installApp,
    applyUpdate,
    dismissUpdate,
  }
}
