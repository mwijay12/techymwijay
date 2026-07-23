/**
 * Electron runtime detection and API helpers.
 *
 * Provides safe access to window.electronAPI without crashing
 * when running in a regular browser or during SSR.
 */

import { isBrowser } from './runtime'

/**
 * Safely check if the app is running inside Electron.
 * Returns false during SSR and in regular browsers.
 */
export function isElectron(): boolean {
  return isBrowser && !!(window as Window & typeof globalThis).electronAPI?.isElectron
}

/**
 * Safely access the Electron preload API.
 * Returns null when not in Electron or during SSR.
 */
export function getElectronAPI() {
  if (!isBrowser || typeof window === 'undefined') return null
  const win = window as Window & typeof globalThis
  return win.electronAPI ?? null
}

/**
 * Get the Electron app version string.
 * Returns null when not in Electron.
 */
export async function getElectronVersion(): Promise<string | null> {
  const api = getElectronAPI()
  if (!api || !api.getAppVersion) return null
  try {
    return await api.getAppVersion()
  } catch {
    return null
  }
}