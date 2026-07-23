/**
 * Analytics Service — PostHog Wrapper
 * Privacy-first analytics. No PII stored.
 * Free tier: 1M events/month.
 *
 * Safe client-side telemetry wrapper.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST
  ?? 'https://app.posthog.com'

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, string | number | boolean | null>
}

export const ANALYTICS_EVENTS = {
  PAGE_VIEW:            'page_view',
  STT_STARTED:          'stt_recording_started',
  STT_COMPLETED:        'stt_recording_completed',
  TTS_GENERATED:        'tts_speech_generated',
  VAULT_ITEM_CREATED:   'vault_item_created',
  VAULT_ITEM_DELETED:   'vault_item_deleted',
  VAULT_SEARCHED:       'vault_searched',
  TODO_CREATED:         'todo_created',
  TODO_COMPLETED:       'todo_completed',
  SPENDING_ADDED:       'spending_entry_added',
  BUDGET_SET:           'budget_goal_set',
  MEETING_STARTED:      'meeting_recording_started',
  MEETING_COMPLETED:    'meeting_recording_completed',
  AI_CHAT_SENT:         'ai_chat_message_sent',
  AI_MEMORY_ADDED:      'ai_memory_entry_added',
  PWA_INSTALLED:        'pwa_app_installed',
  ELECTRON_OPENED:      'electron_app_opened',
  EXTENSION_USED:       'chrome_extension_used',
  USER_SIGNED_IN:       'user_signed_in',
  USER_SIGNED_OUT:      'user_signed_out',
} as const

let posthog: any = null
let isInitialized = false

export async function initAnalytics(): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !POSTHOG_KEY ||
    isInitialized
  ) return

  if (
    process.env.NODE_ENV === 'development' &&
    !process.env.NEXT_PUBLIC_ANALYTICS_DEV
  ) {
    return
  }

  try {
    // Check if posthog is loaded on window
    if ((window as any).posthog) {
      posthog = (window as any).posthog
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        persistence: 'localStorage',
        disable_session_recording: true,
      })
      isInitialized = true
    }
  } catch (err) {
    // Analytics is optional — silent fallback
  }
}

export function track(
  event: string,
  properties?: Record<string, string | number | boolean | null>
): void {
  if (!isInitialized || !posthog) return

  const safeProps = sanitizeProperties(properties)

  try {
    posthog.capture(event, {
      ...safeProps,
      app: 'mwijay-tech',
      version: '1.0.0',
      platform: detectPlatform(),
    })
  } catch (err) {
    // Silent
  }
}

export function trackPageView(path: string): void {
  track(ANALYTICS_EVENTS.PAGE_VIEW, {
    path,
    referrer: typeof document !== 'undefined'
      ? document.referrer || 'direct'
      : 'unknown',
  })
}

export function identifyUser(userId: string): void {
  if (!isInitialized || !posthog) return
  const anonymousId = hashString(userId)
  try {
    posthog.identify(anonymousId)
  } catch {}
}

export function resetAnalytics(): void {
  if (!isInitialized || !posthog) return
  try {
    posthog.reset()
  } catch {}
}

function sanitizeProperties(
  props?: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  if (!props) return {}

  const safe: Record<string, string | number | boolean | null> = {}
  const PII_KEYS = ['email', 'name', 'phone', 'uid', 'userId', 'user_id', 'token']

  Object.entries(props).forEach(([key, value]) => {
    if (PII_KEYS.some(pii => key.toLowerCase().includes(pii))) return
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = value
    } else if (value === null) {
      safe[key] = null
    }
  })

  return safe
}

function detectPlatform(): string {
  if (typeof window === 'undefined') return 'server'
  if ((window as any).electronAPI?.isElectron) return 'electron'
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa'
  return 'web'
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
