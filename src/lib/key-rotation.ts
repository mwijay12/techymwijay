/**
 * Key Pool Rotation Engine
 * Manages round-robin key selection, failure tracking,
 * cooldown periods, and health scoring across all providers.
 *
 * SECURITY: This module only stores rotation STATE (index, counts).
 * Actual API keys are NEVER stored here — they come from SERVER_ENV.
 */

const STORAGE_PREFIX = 'mwijay_key_rotation_'
const MAX_FAILURES_BEFORE_COOLDOWN = 3
const COOLDOWN_DURATION_MS = 5 * 60 * 1000  // 5 minutes per key
const MAX_RETRIES_PER_REQUEST = 3

// ─── Types ─────────────────────────────────────────────────
export interface KeyHealth {
  index: number
  successCount: number
  failureCount: number
  consecutiveFailures: number
  lastFailedAt: number | null   // Unix timestamp
  lastUsedAt: number | null
  inCooldown: boolean
}

export interface PoolRotationState {
  provider: string
  currentIndex: number
  keys: KeyHealth[]
  totalRequests: number
  totalSuccesses: number
  totalFailures: number
  lastRotatedAt: number
}

// ─── Initialize pool state ─────────────────────────────────
export function initPoolState(
  provider: string,
  keyCount: number
): PoolRotationState {
  return {
    provider,
    currentIndex: 0,
    keys: Array.from({ length: Math.max(keyCount, 1) }, (_, i) => ({
      index: i,
      successCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      lastFailedAt: null,
      lastUsedAt: null,
      inCooldown: false,
    })),
    totalRequests: 0,
    totalSuccesses: 0,
    totalFailures: 0,
    lastRotatedAt: Date.now(),
  }
}

// ─── localStorage persistence (client-side only) ──────────
export function savePoolState(state: PoolRotationState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${state.provider}`,
      JSON.stringify(state)
    )
  } catch {
    // localStorage full or unavailable
  }
}

export function loadPoolState(
  provider: string,
  keyCount: number
): PoolRotationState {
  if (typeof window === 'undefined') {
    return initPoolState(provider, keyCount)
  }
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${provider}`)
    if (!stored) return initPoolState(provider, keyCount)

    const parsed = JSON.parse(stored) as PoolRotationState

    if (parsed.keys.length !== keyCount) {
      return initPoolState(provider, keyCount)
    }

    return parsed
  } catch {
    return initPoolState(provider, keyCount)
  }
}

export function clearPoolState(provider: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${STORAGE_PREFIX}${provider}`)
}

// ─── Cooldown check ────────────────────────────────────────
function isKeyInCooldown(keyHealth: KeyHealth): boolean {
  if (!keyHealth.lastFailedAt) return false
  if (keyHealth.consecutiveFailures < MAX_FAILURES_BEFORE_COOLDOWN) return false
  const elapsed = Date.now() - keyHealth.lastFailedAt
  return elapsed < COOLDOWN_DURATION_MS
}

// ─── Get next available key index ─────────────────────────
export function getNextAvailableIndex(state: PoolRotationState): number {
  const total = state.keys.length
  if (total === 0) return -1

  for (let attempt = 0; attempt < total; attempt++) {
    const idx = (state.currentIndex + attempt) % total
    const keyHealth = state.keys[idx]

    if (!isKeyInCooldown(keyHealth)) {
      return idx
    }
  }

  let leastFailed = 0
  let minFailures = Infinity
  state.keys.forEach((k, i) => {
    if (k.consecutiveFailures < minFailures) {
      minFailures = k.consecutiveFailures
      leastFailed = i
    }
  })
  return leastFailed
}

// ─── Backward compatibility helpers ─────────────────────
export function getNextKey(pool: { provider: string; keys: string[]; currentIndex: number }): string | null {
  if (!pool.keys || !pool.keys.length) return null
  return pool.keys[pool.currentIndex % pool.keys.length] || null
}

export function rotateKey<T extends { currentIndex: number; keys?: any[] }>(pool: T): T {
  const len = pool.keys?.length || 1
  return {
    ...pool,
    currentIndex: (pool.currentIndex + 1) % len,
  }
}

export function markKeyFailed<T extends { currentIndex: number; keys?: any[] }>(pool: T): T {
  return rotateKey(pool)
}

// ─── Record a successful key usage ────────────────────────
export function recordSuccess(
  state: PoolRotationState,
  keyIndex: number
): PoolRotationState {
  const updatedKeys = [...state.keys]
  if (updatedKeys[keyIndex]) {
    updatedKeys[keyIndex] = {
      ...updatedKeys[keyIndex],
      successCount: updatedKeys[keyIndex].successCount + 1,
      consecutiveFailures: 0,
      inCooldown: false,
      lastUsedAt: Date.now(),
    }
  }

  const nextIndex = (keyIndex + 1) % Math.max(state.keys.length, 1)

  return {
    ...state,
    currentIndex: nextIndex,
    keys: updatedKeys,
    totalRequests: state.totalRequests + 1,
    totalSuccesses: state.totalSuccesses + 1,
    lastRotatedAt: Date.now(),
  }
}

// ─── Record a failed key usage ─────────────────────────────
export function recordFailure(
  state: PoolRotationState,
  keyIndex: number
): PoolRotationState {
  const updatedKeys = [...state.keys]
  if (updatedKeys[keyIndex]) {
    const currentFailures = updatedKeys[keyIndex].consecutiveFailures + 1
    updatedKeys[keyIndex] = {
      ...updatedKeys[keyIndex],
      failureCount: updatedKeys[keyIndex].failureCount + 1,
      consecutiveFailures: currentFailures,
      lastFailedAt: Date.now(),
      lastUsedAt: Date.now(),
      inCooldown: currentFailures >= MAX_FAILURES_BEFORE_COOLDOWN,
    }
  }

  const nextIndex = (keyIndex + 1) % Math.max(state.keys.length, 1)

  return {
    ...state,
    currentIndex: nextIndex,
    keys: updatedKeys,
    totalRequests: state.totalRequests + 1,
    totalFailures: state.totalFailures + 1,
    lastRotatedAt: Date.now(),
  }
}

// ─── Get health score 0-100 for a key ─────────────────────
export function getKeyHealthScore(keyHealth: KeyHealth): number {
  const total = keyHealth.successCount + keyHealth.failureCount
  if (total === 0) return 100

  const successRate = keyHealth.successCount / total
  const cooldownPenalty = isKeyInCooldown(keyHealth) ? 0.5 : 1
  return Math.round(successRate * 100 * cooldownPenalty)
}

// ─── Get overall pool health summary ──────────────────────
export function getPoolHealthSummary(state: PoolRotationState) {
  const healthyKeys = state.keys.filter(k => !isKeyInCooldown(k)).length
  const avgScore =
    state.keys.length > 0
      ? state.keys.reduce((sum, k) => sum + getKeyHealthScore(k), 0) /
        state.keys.length
      : 0

  return {
    provider: state.provider,
    totalKeys: state.keys.length,
    healthyKeys,
    cooldownKeys: state.keys.length - healthyKeys,
    avgHealthScore: Math.round(avgScore),
    totalRequests: state.totalRequests,
    successRate:
      state.totalRequests > 0
        ? Math.round((state.totalSuccesses / state.totalRequests) * 100)
        : 100,
  }
}

export { MAX_RETRIES_PER_REQUEST }
