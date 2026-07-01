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

/** True when running in a development environment */
export const isDevelopment =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('dev') ||
    window.location.hostname.includes('local'))

/** Detect if the app is running as a static export (no SSR) */
export const isStaticExport =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'