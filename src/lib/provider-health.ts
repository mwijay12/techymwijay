/**
 * Provider Health Tracker
 *
 * Singleton that tracks failure counts, rate limits, and health status
 * for each AI provider. Used by the engine to skip unhealthy providers.
 */

export type ProviderHealthStatus = 'healthy' | 'degraded' | 'down' | 'rate_limited' | 'unconfigured'

type ProviderHealthRecord = {
  status: ProviderHealthStatus
  failureCount: number
  lastFailedAt: number | null
  lastSuccessAt: number | null
  rateLimitedUntil: number | null
}

const RATE_LIMIT_COOLDOWN_MS = 60_000 // 1 minute
const MAX_FAILURES_BEFORE_SKIP = 3

class ProviderHealthTracker {
  private records: Map<string, ProviderHealthRecord> = new Map()

  private getRecord(providerId: string): ProviderHealthRecord {
    if (!this.records.has(providerId)) {
      this.records.set(providerId, {
        status: 'healthy',
        failureCount: 0,
        lastFailedAt: null,
        lastSuccessAt: null,
        rateLimitedUntil: null,
      })
    }
    return this.records.get(providerId)!
  }

  recordSuccess(providerId: string): void {
    const record = this.getRecord(providerId)
    record.status = 'healthy'
    record.failureCount = 0
    record.lastSuccessAt = Date.now()
    record.rateLimitedUntil = null
  }

  recordFailure(providerId: string, code: string): void {
    const record = this.getRecord(providerId)
    record.lastFailedAt = Date.now()
    record.failureCount += 1

    if (code === 'rate_limit') {
      record.status = 'rate_limited'
      record.rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS
    } else if (record.failureCount >= MAX_FAILURES_BEFORE_SKIP) {
      record.status = 'down'
    } else {
      record.status = 'degraded'
    }
  }

  isUsable(providerId: string): boolean {
    const record = this.getRecord(providerId)

    if (record.status === 'rate_limited') {
      if (record.rateLimitedUntil && Date.now() > record.rateLimitedUntil) {
        record.status = 'healthy'
        record.rateLimitedUntil = null
        return true
      }
      return false
    }

    if (record.status === 'down') return false
    return true
  }

  getStatus(providerId: string): ProviderHealthStatus {
    return this.getRecord(providerId).status
  }

  getAllStatuses(): Record<string, ProviderHealthStatus> {
    const out: Record<string, ProviderHealthStatus> = {}
    this.records.forEach((record, id) => {
      out[id] = record.status
    })
    return out
  }

  reset(providerId?: string): void {
    if (providerId) {
      this.records.delete(providerId)
    } else {
      this.records.clear()
    }
  }
}

// Singleton — shared across the app session
export const providerHealth = new ProviderHealthTracker()