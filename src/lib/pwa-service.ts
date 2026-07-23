/**
 * PWA Service
 * Handles service worker registration, update detection,
 * and install prompt management.
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers not supported')
    return null
  }

  if ((window as any).electronAPI?.isElectron) {
    console.log('[PWA] Skipping SW registration in Electron')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/sw.js',
      { scope: '/' }
    )

    console.log('[PWA] Service worker registered:', registration.scope)

    registration.update()

    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return registration
  } catch (err) {
    console.warn('[PWA] Service worker registration failed:', err)
    return null
  }
}

export function onServiceWorkerUpdate(
  registration: ServiceWorkerRegistration,
  callback: () => void
): void {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        console.log('[PWA] New version available!')
        callback()
      }
    })
  })
}

export function applyServiceWorkerUpdate(): void {
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

export async function clearServiceWorkerCache(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.getRegistration()
  if (registration?.active) {
    registration.active.postMessage({ type: 'CLEAR_CACHE' })
  }
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function captureInstallPrompt(): void {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt = e as BeforeInstallPromptEvent
    console.log('[PWA] Install prompt captured')
  })
}

export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredInstallPrompt) {
    return 'unavailable'
  }

  await deferredInstallPrompt.prompt()
  const choice = await deferredInstallPrompt.userChoice
  deferredInstallPrompt = null

  console.log(`[PWA] Install prompt outcome: ${choice.outcome}`)
  return choice.outcome
}

export function isInstallPromptAvailable(): boolean {
  return deferredInstallPrompt !== null
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/chrome/i.test(ua)
}

export async function sendSWMessage(
  message: Record<string, unknown>
): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration?.active) {
    registration.active.postMessage(message)
  }
}
