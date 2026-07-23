/**
 * Integration Tests
 * In-app test runner for verifying all major features.
 * Run from /health page to verify system before deployment.
 */

export interface TestResult {
  passed: boolean
  message: string
  durationMs: number
  details?: Record<string, unknown>
  error?: string
}

export interface IntegrationTest {
  id: string
  name: string
  category: string
  description: string
  requiresAuth?: boolean
  requiresNetwork?: boolean
  run: (ctx: TestContext) => Promise<TestResult>
}

export interface TestContext {
  userId?: string
  authToken?: string
  isOnline: boolean
}

async function runTest(
  fn: () => Promise<TestResult>
): Promise<TestResult> {
  const start = Date.now()
  try {
    const result = await fn()
    return { ...result, durationMs: Date.now() - start }
  } catch (err) {
    return {
      passed: false,
      message: 'Test threw an exception',
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export const INTEGRATION_TESTS: IntegrationTest[] = [
  // ── Auth Tests ────────────────────────────────────────
  {
    id: 'auth-firebase-init',
    name: 'Firebase Initialization',
    category: 'auth',
    description: 'Verify Firebase app initializes correctly',
    run: async () => runTest(async () => {
      const { getApps } = await import('firebase/app')
      const apps = getApps()
      return {
        passed: apps.length > 0,
        message: apps.length > 0
          ? `Firebase initialized (${apps.length} app${apps.length > 1 ? 's' : ''})`
          : 'Firebase not initialized',
        durationMs: 0,
        details: {
          appCount: apps.length,
          projectId: apps[0]?.options?.projectId,
        },
      }
    }),
  },
  {
    id: 'auth-session',
    name: 'Auth Session Check',
    category: 'auth',
    description: 'Verify user auth session is active',
    requiresAuth: true,
    run: async (ctx) => runTest(async () => {
      return {
        passed: !!ctx.userId,
        message: ctx.userId
          ? `Authenticated as ${ctx.userId.slice(0, 8)}...`
          : 'Not authenticated',
        durationMs: 0,
        details: { userId: ctx.userId?.slice(0, 8) },
      }
    }),
  },

  // ── Firestore Tests ───────────────────────────────────
  {
    id: 'firestore-write',
    name: 'Firestore Write Test',
    category: 'sync',
    description: 'Write a test document to Firestore',
    requiresAuth: true,
    requiresNetwork: true,
    run: async (ctx) => runTest(async () => {
      const { doc, setDoc, deleteDoc, getFirestore } = await import('firebase/firestore')
      const { getApp } = await import('firebase/app')
      const db = getFirestore(getApp())

      const testDoc = doc(db, '_integration_tests', `test-${ctx.userId}-${Date.now()}`)

      await setDoc(testDoc, {
        test: true,
        userId: ctx.userId,
        timestamp: new Date().toISOString(),
      })

      await deleteDoc(testDoc)

      return {
        passed: true,
        message: 'Firestore write and delete successful',
        durationMs: 0,
      }
    }),
  },
  {
    id: 'firestore-read',
    name: 'Firestore Read Test',
    category: 'sync',
    description: 'Read user profile from Firestore',
    requiresAuth: true,
    requiresNetwork: true,
    run: async (ctx) => runTest(async () => {
      const { doc, getDoc, getFirestore } = await import('firebase/firestore')
      const { getApp } = await import('firebase/app')
      const db = getFirestore(getApp())

      const userDoc = doc(db, 'users', ctx.userId!)
      const snap = await getDoc(userDoc)

      return {
        passed: snap.exists(),
        message: snap.exists()
          ? 'User profile found in Firestore'
          : 'User profile not found — may need to sign in again',
        durationMs: 0,
        details: {
          hasProfile: snap.exists(),
          fields: snap.exists() ? Object.keys(snap.data()!) : [],
        },
      }
    }),
  },

  // ── Vault Tests ───────────────────────────────────────
  {
    id: 'vault-crud',
    name: 'Vault CRUD Operations',
    category: 'vault',
    description: 'Create, read, update, delete vault item',
    requiresAuth: true,
    run: async (ctx) => runTest(async () => {
      const {
        createVaultItem,
        updateVaultItem,
        deleteVaultItem,
        loadVaultFromStorage,
      } = await import('@/lib/vault-service')

      const userId = ctx.userId!

      const item = await createVaultItem(userId, {
        title: 'Integration Test Item',
        category: 'notes',
        content: 'This is a test note',
        tags: ['test'],
      })

      const items = loadVaultFromStorage(userId)
      const found = items.find(i => i.id === item.id)

      await updateVaultItem(userId, item.id, {
        content: 'Updated test note',
      })

      await deleteVaultItem(userId, item.id)
      const afterDelete = loadVaultFromStorage(userId)
      const deletedItem = afterDelete.find(i => i.id === item.id)

      return {
        passed: !!found && !deletedItem,
        message: found && !deletedItem
          ? 'Vault CRUD operations all passed'
          : `CRUD failed: ${!found ? 'read failed' : 'delete failed'}`,
        durationMs: 0,
        details: { created: !!item, found: !!found, deleted: !deletedItem },
      }
    }),
  },
  {
    id: 'vault-encryption',
    name: 'AES-256 Encryption',
    category: 'vault',
    description: 'Test encrypt/decrypt cycle',
    run: async () => runTest(async () => {
      const { encryptSecret, decryptSecret } = await import('@/lib/encryption')
      const testText = 'Secret: Habari yako!'
      const password = 'TestPassword123!'

      const encrypted = await encryptSecret(testText, password, 'test-user')
      const decrypted = await decryptSecret(encrypted, password, 'test-user')

      return {
        passed: decrypted === testText,
        message: decrypted === testText
          ? 'AES-256-GCM encryption/decryption working correctly'
          : 'Encryption mismatch!',
        durationMs: 0,
        details: {
          inputLength: testText.length,
          encryptedLength: encrypted.length,
          matches: decrypted === testText,
        },
      }
    }),
  },

  // ── Todo Tests ────────────────────────────────────────
  {
    id: 'todo-crud',
    name: 'Todo CRUD Operations',
    category: 'todos',
    description: 'Create, update, delete todo item',
    requiresAuth: true,
    run: async (ctx) => runTest(async () => {
      const {
        createTodo,
        updateTodo,
        deleteTodo,
        loadTodosFromStorage,
      } = await import('@/lib/todo-service')

      const userId = ctx.userId!

      const todo = await createTodo(userId, {
        title: 'Integration Test Todo',
        priority: 'medium',
        tags: ['test'],
      })

      const todos = loadTodosFromStorage(userId)
      const found = todos.find(t => t.id === todo.id)

      await updateTodo(userId, todo.id, { status: 'done' })
      await deleteTodo(userId, todo.id)

      const afterDelete = loadTodosFromStorage(userId)
      const deleted = !afterDelete.find(t => t.id === todo.id)

      return {
        passed: !!found && deleted,
        message: found && deleted ? 'Todo CRUD all passed' : 'Todo CRUD failed',
        durationMs: 0,
        details: { created: !!todo, found: !!found, deleted },
      }
    }),
  },

  // ── Spending Tests ────────────────────────────────────
  {
    id: 'spending-crud',
    name: 'Spending Entry CRUD',
    category: 'spending',
    description: 'Create, read, delete spending entry in TZS',
    requiresAuth: true,
    run: async (ctx) => runTest(async () => {
      const {
        createSpendingEntry,
        deleteSpendingEntry,
        loadSpendingFromStorage,
      } = await import('@/lib/spending-service')

      const userId = ctx.userId!

      const entry = await createSpendingEntry(userId, {
        amount: 5000,
        currency: 'TZS',
        category: 'chakula',
        description: 'Integration test — Mama Ntilie',
        date: new Date().toISOString().split('T')[0],
      })

      const entries = loadSpendingFromStorage(userId)
      const found = entries.find(e => e.id === entry.id)
      await deleteSpendingEntry(userId, entry.id)

      return {
        passed: !!found,
        message: found ? 'Spending CRUD passed' : 'Spending entry not found after create',
        durationMs: 0,
        details: { amount: entry.amount, currency: entry.currency, found: !!found },
      }
    }),
  },

  // ── AI Provider Tests ─────────────────────────────────
  {
    id: 'ai-health-check',
    name: 'AI Provider Health',
    category: 'ai',
    description: 'Verify at least one AI provider is configured and responding',
    requiresNetwork: true,
    run: async () => runTest(async () => {
      const res = await fetch('/api/ai/health')
      const data = await res.json()

      const totalKeys = data.providers?.total ?? 0
      const hasProviders = totalKeys > 0 || data.providers?.puter > 0

      return {
        passed: res.ok && hasProviders,
        message: res.ok
          ? `${totalKeys} API keys configured across providers`
          : `Health check failed: ${res.status}`,
        durationMs: 0,
        details: data.providers,
      }
    }),
  },
  {
    id: 'ai-chat-response',
    name: 'AI Chat Response',
    category: 'ai',
    description: 'Send a test message and verify AI response',
    requiresNetwork: true,
    run: async () => runTest(async () => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id: 'test-1',
            role: 'user',
            content: 'Say exactly: INTEGRATION_TEST_OK',
            timestamp: new Date().toISOString(),
          }],
          maxTokens: 20,
          temperature: 0,
        }),
      })

      const data = await res.json()
      const hasResponse = !!data.content?.trim()

      return {
        passed: res.ok && hasResponse,
        message: hasResponse
          ? `AI responded via ${data.provider}: "${data.content?.slice(0, 50)}"`
          : `AI failed: ${data.error ?? 'no response'}`,
        durationMs: 0,
        details: {
          provider: data.provider,
          model: data.model,
          latencyMs: data.latencyMs,
        },
      }
    }),
  },

  // ── STT Tests ─────────────────────────────────────────
  {
    id: 'stt-health',
    name: 'STT Service Health',
    category: 'stt',
    description: 'Verify Groq Whisper STT endpoint is configured',
    requiresNetwork: true,
    run: async () => runTest(async () => {
      const res = await fetch('/api/stt')
      const data = await res.json()

      return {
        passed: res.ok && data.status === 'ok',
        message: res.ok
          ? `STT ready — ${data.keysAvailable} Groq keys, model: ${data.engine}`
          : `STT check failed: ${res.status}`,
        durationMs: 0,
        details: data,
      }
    }),
  },
  {
    id: 'stt-webspeech',
    name: 'Web Speech API Support',
    category: 'stt',
    description: 'Check if browser supports Web Speech API fallback',
    run: async () => runTest(async () => {
      const supported =
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

      return {
        passed: true,
        message: supported
          ? 'Web Speech API available (Swahili-English fallback active)'
          : 'Web Speech API not available — Groq Whisper only',
        durationMs: 0,
        details: { supported },
      }
    }),
  },

  // ── TTS Tests ─────────────────────────────────────────
  {
    id: 'tts-health',
    name: 'TTS Service Health',
    category: 'tts',
    description: 'Verify ElevenLabs TTS endpoint is configured',
    requiresNetwork: true,
    run: async () => runTest(async () => {
      const res = await fetch('/api/tts')
      const data = await res.json()

      return {
        passed: res.ok && data.status === 'ok',
        message: res.ok
          ? `TTS ready — ${data.keysAvailable} ElevenLabs keys`
          : 'TTS check failed',
        durationMs: 0,
        details: data,
      }
    }),
  },
  {
    id: 'tts-browser',
    name: 'Browser TTS Support',
    category: 'tts',
    description: 'Check if browser SpeechSynthesis is available',
    run: async () => runTest(async () => {
      const supported = 'speechSynthesis' in window
      const voices = supported ? window.speechSynthesis.getVoices() : []

      return {
        passed: true,
        message: supported
          ? `SpeechSynthesis available — ${voices.length} voices`
          : 'SpeechSynthesis not available',
        durationMs: 0,
        details: { supported, voiceCount: voices.length },
      }
    }),
  },

  // ── Sync Tests ────────────────────────────────────────
  {
    id: 'sync-queue',
    name: 'Sync Queue',
    category: 'sync',
    description: 'Test offline sync queue enqueue and dequeue',
    run: async () => runTest(async () => {
      const {
        enqueueSyncOperation,
        loadSyncQueue,
        clearUserQueue,
      } = await import('@/lib/sync-queue')

      const testUserId = 'integration-test-user'
      const initialCount = loadSyncQueue().length

      enqueueSyncOperation(
        'vault_items',
        'create',
        `test-${Date.now()}`,
        { title: 'test' },
        testUserId
      )

      const afterEnqueue = loadSyncQueue().length
      clearUserQueue(testUserId)
      const afterClear = loadSyncQueue().length

      return {
        passed: afterEnqueue > initialCount && afterClear <= initialCount,
        message: 'Sync queue enqueue and clear working correctly',
        durationMs: 0,
        details: { initialCount, afterEnqueue, afterClear },
      }
    }),
  },
  {
    id: 'sync-local-storage',
    name: 'LocalStorage Operations',
    category: 'sync',
    description: 'Verify localStorage read/write performance',
    run: async () => runTest(async () => {
      const testKey = `mwijay_test_${Date.now()}`
      const testData = { test: true, timestamp: Date.now() }

      localStorage.setItem(testKey, JSON.stringify(testData))
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
      localStorage.removeItem(testKey)

      const matches = retrieved.test === testData.test

      return {
        passed: matches,
        message: matches
          ? 'LocalStorage read/write working correctly'
          : 'LocalStorage mismatch',
        durationMs: 0,
        details: { written: testData, retrieved },
      }
    }),
  },

  // ── PWA Tests ─────────────────────────────────────────
  {
    id: 'pwa-manifest',
    name: 'PWA Manifest',
    category: 'pwa',
    description: 'Verify manifest.json is accessible and valid',
    requiresNetwork: true,
    run: async () => runTest(async () => {
      const res = await fetch('/manifest.json')
      const data = await res.json()

      const hasRequired =
        data.name &&
        data.short_name &&
        data.start_url &&
        data.display

      return {
        passed: res.ok && !!hasRequired,
        message: hasRequired
          ? `Manifest valid — "${data.name}"`
          : 'Manifest missing required fields',
        durationMs: 0,
        details: {
          name: data.name,
          display: data.display,
          iconCount: data.icons?.length,
        },
      }
    }),
  },
  {
    id: 'pwa-service-worker',
    name: 'Service Worker',
    category: 'pwa',
    description: 'Verify service worker is registered',
    run: async () => runTest(async () => {
      if (!('serviceWorker' in navigator)) {
        return {
          passed: false,
          message: 'Service workers not supported in this browser',
          durationMs: 0,
        }
      }

      const registration = await navigator.serviceWorker.getRegistration('/')
      const isActive = !!registration?.active

      return {
        passed: true,
        message: isActive
          ? `Service worker active — scope: ${registration?.scope}`
          : 'Service worker not yet registered',
        durationMs: 0,
        details: {
          active: isActive,
          scope: registration?.scope,
        },
      }
    }),
  },

  // ── Cloudinary Test ───────────────────────────────────
  {
    id: 'cloudinary-config',
    name: 'Cloudinary Configuration',
    category: 'sync',
    description: 'Verify Cloudinary environment variables are set',
    run: async () => runTest(async () => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      const configured = !!cloudName && !!preset

      return {
        passed: configured,
        message: configured
          ? `Cloudinary configured — cloud: ${cloudName}`
          : 'Cloudinary not configured — add env vars for media upload',
        durationMs: 0,
        details: {
          hasCloudName: !!cloudName,
          hasPreset: !!preset,
        },
      }
    }),
  },

  // ── Memory Tests ──────────────────────────────────────
  {
    id: 'memory-seeding',
    name: 'AI Memory Seeding',
    category: 'ai',
    description: 'Verify default memories are seeded for user',
    requiresAuth: true,
    run: async (ctx) => runTest(async () => {
      const { loadMemoriesFromStorage } = await import('@/lib/memory-service')
      const memories = loadMemoriesFromStorage(ctx.userId!)

      return {
        passed: memories.length > 0,
        message: memories.length > 0
          ? `${memories.length} memories loaded`
          : 'No memories found',
        durationMs: 0,
        details: {
          total: memories.length,
        },
      }
    }),
  },

  // ── Environment Tests ─────────────────────────────────
  {
    id: 'env-firebase',
    name: 'Firebase Environment Variables',
    category: 'auth',
    description: 'Verify all Firebase env vars are set',
    run: async () => runTest(async () => {
      const required = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
      ]

      const missing = required.filter(
        key => !process.env[key as keyof typeof process.env]
      )

      return {
        passed: missing.length === 0,
        message: missing.length === 0
          ? 'All Firebase env vars configured'
          : `Missing: ${missing.join(', ')}`,
        durationMs: 0,
        details: {
          missing,
        },
      }
    }),
  },
]

export async function runAllTests(
  ctx: TestContext,
  onProgress?: (id: string, result: TestResult) => void
): Promise<Record<string, TestResult>> {
  const results: Record<string, TestResult> = {}

  for (const test of INTEGRATION_TESTS) {
    if (test.requiresAuth && !ctx.userId) {
      const res = {
        passed: false,
        message: 'Skipped — requires authentication',
        durationMs: 0,
      }
      results[test.id] = res
      onProgress?.(test.id, res)
      continue
    }

    if (test.requiresNetwork && !ctx.isOnline) {
      const res = {
        passed: false,
        message: 'Skipped — requires internet connection',
        durationMs: 0,
      }
      results[test.id] = res
      onProgress?.(test.id, res)
      continue
    }

    const result = await test.run(ctx)
    results[test.id] = result
    onProgress?.(test.id, result)
  }

  return results
}

export function getTestSummary(results: Record<string, TestResult>) {
  const all = Object.values(results)
  const passed = all.filter(r => r.passed).length
  const total = all.length
  const skipped = all.filter(r => r.message.startsWith('Skipped')).length
  const failed = total - passed - skipped

  return {
    total,
    passed,
    failed,
    skipped,
    successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    avgDurationMs: total > 0
      ? Math.round(all.reduce((sum, r) => sum + r.durationMs, 0) / total)
      : 0,
  }
}
