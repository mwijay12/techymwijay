/**
 * Runtime environment detection helpers.
 *
 * Safe to import in any file — always returns booleans,
 * never throws or accesses browser APIs during SSR.
 */

/** True when running in a browser environment (client-side) */
export const isBrowser = typeof window !== 'undefined'

/** True when running on the server (Node.js / SSR) */
export const isServer = !isBrowser

/** True when running as an Electron desktop application */
export const isElectron =
  isBrowser &&
  typeof window !== 'undefined' &&
  !!(window as any).electronAPI?.isElectron

/** True when running in a development environment */
export const isDevelopment =
  isBrowser &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('dev') ||
    window.location.hostname.includes('local'))

/** Detect if the app is running as a static export (no SSR) */
export const isStaticExport =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'

/**
 * Base API URL for network requests.
 * Uses the production URL when in Electron context, otherwise uses relative routes.
 */
export const BASE_API_URL = isElectron
  ? 'https://techymwijay.vercel.app'
  : ''

/**
 * Resolves an API path to an absolute URL if running inside Electron,
 * or returns the path as-is for standard browser environment.
 */
export function getApiUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_API_URL}${sanitizedPath}`
}