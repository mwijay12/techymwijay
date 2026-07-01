/**
 * Browser-safe localStorage wrappers.
 *
 * Never crashes during SSR or when localStorage is unavailable
 * (e.g., private browsing in some browsers).
 */

import { isBrowser } from './runtime'

function getStorage(): Storage | null {
  if (!isBrowser) return null
  try {
    return localStorage
  } catch {
    return null
  }
}

/**
 * Safely get an item from localStorage.
 * Returns `null` when the key doesn't exist, during SSR,
 * or when storage is unavailable.
 */
export function getItem(key: string): string | null {
  try {
    const storage = getStorage()
    if (!storage) return null
    return storage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safely set an item in localStorage.
 * Returns `true` on success, `false` on failure.
 */
export function setItem(key: string, value: string): boolean {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Safely remove an item from localStorage.
 * Returns `true` on success, `false` on failure.
 */
export function removeItem(key: string): boolean {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Safely clear all localStorage.
 * Returns `true` on success, `false` on failure.
 */
export function clear(): boolean {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.clear()
    return true
  } catch {
    return false
  }
}

/**
 * Check if localStorage is available.
 * Returns `false` during SSR or when storage is blocked.
 */
export function isStorageAvailable(): boolean {
  return getStorage() !== null
}