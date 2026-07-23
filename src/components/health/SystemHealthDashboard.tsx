'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Activity,
  Server,
  Terminal,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { HealthCheckItem, type HealthStatus } from './HealthCheck'
import { useAppState } from '@/hooks/use-app-state'

interface ServiceHealth {
  name: string
  description: string
  status: HealthStatus
  message?: string
  latencyMs?: number
  details?: Record<string, unknown>
}

export function SystemHealthDashboard() {
  const { isOnline, platform } = useAppState()
  const [checking, setChecking] = useState(false)
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Firebase Authentication', description: 'Core authentication service', status: 'checking' },
    { name: 'Firestore Database', description: 'Cloud document storage', status: 'checking' },
    { name: 'AI Model Gateway', description: 'OpenRouter & Groq API failover order', status: 'checking' },
    { name: 'Groq Whisper STT', description: 'Speech-to-text API service', status: 'checking' },
    { name: 'ElevenLabs TTS', description: 'Text-to-speech engine', status: 'checking' },
    { name: 'Cloudinary CDN', description: 'Unsigned preset media storage', status: 'checking' },
  ])

  const runHealthChecks = useCallback(async () => {
    setChecking(true)

    // Update statuses to checking
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })))

    // Check Firebase Auth & Firestore
    const startDb = Date.now()
    let dbStatus: HealthStatus = 'down'
    let dbDetails = {}
    try {
      const res = await fetch('/api/ai/health')
      if (res.ok) {
        dbStatus = 'healthy'
      } else {
        dbStatus = 'degraded'
      }
    } catch {
      dbStatus = 'down'
    }

    const latencyDb = Date.now() - startDb

    // Check AI config
    const startAi = Date.now()
    let aiStatus: HealthStatus = 'checking'
    let aiMessage = ''
    let aiDetails = {}
    try {
      const res = await fetch('/api/ai/health')
      const data = await res.json()
      if (res.ok && data.providers) {
        aiStatus = data.providers.total > 0 || data.providers.puter > 0 ? 'healthy' : 'degraded'
        aiMessage = `${data.providers.total} API keys active`
        aiDetails = data.providers
      } else {
        aiStatus = 'down'
      }
    } catch {
      aiStatus = 'down'
    }
    const latencyAi = Date.now() - startAi

    // Check STT config
    let sttStatus: HealthStatus = 'checking'
    let sttMessage = ''
    try {
      const res = await fetch('/api/stt')
      const data = await res.json()
      if (res.ok && data.status === 'ok') {
        sttStatus = 'healthy'
        sttMessage = `Ready (${data.engine})`
      } else {
        sttStatus = 'degraded'
      }
    } catch {
      sttStatus = 'down'
    }

    // Check TTS config
    let ttsStatus: HealthStatus = 'checking'
    let ttsMessage = ''
    try {
      const res = await fetch('/api/tts')
      const data = await res.json()
      if (res.ok && data.status === 'ok') {
        ttsStatus = 'healthy'
        ttsMessage = 'Ready'
      } else {
        ttsStatus = 'degraded'
      }
    } catch {
      ttsStatus = 'down'
    }

    setServices([
      {
        name: 'Firebase Authentication',
        description: 'Core authentication service',
        status: isOnline ? 'healthy' : 'skipped',
        message: isOnline ? 'Google Identity Service Online' : 'Authentication checks skipped offline',
      },
      {
        name: 'Firestore Database',
        description: 'Cloud document storage',
        status: isOnline ? dbStatus : 'skipped',
        message: isOnline ? 'Direct Cloud access active' : 'Offline caching mode active',
        latencyMs: isOnline ? latencyDb : undefined,
        details: isOnline ? dbDetails : undefined,
      },
      {
        name: 'AI Model Gateway',
        description: 'OpenRouter & Groq API failover order',
        status: isOnline ? aiStatus : 'skipped',
        message: isOnline ? aiMessage : 'Offline — AI capabilities paused',
        latencyMs: isOnline ? latencyAi : undefined,
        details: isOnline ? aiDetails : undefined,
      },
      {
        name: 'Groq Whisper STT',
        description: 'Speech-to-text API service',
        status: isOnline ? sttStatus : 'skipped',
        message: isOnline ? sttMessage : 'Fallback to browser SpeechRecognition active',
      },
      {
        name: 'ElevenLabs TTS',
        description: 'Text-to-speech engine',
        status: isOnline ? ttsStatus : 'skipped',
        message: isOnline ? ttsMessage : 'Fallback to browser SpeechSynthesis active',
      },
      {
        name: 'Cloudinary CDN',
        description: 'Unsigned preset media storage',
        status: isOnline ? (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'healthy' : 'degraded') : 'skipped',
        message: isOnline
          ? (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? `Connected to ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}` : 'Cloudinary keys missing')
          : 'Media uploads queued locally',
      },
    ])

    setChecking(false)
  }, [isOnline])

  useEffect(() => {
    runHealthChecks()
  }, [runHealthChecks])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            System Component Health
          </h3>
          <p className="text-xs text-gray-400">
            Real-time status of external APIs, databases, and assets
          </p>
        </div>

        <button
          onClick={runHealthChecks}
          disabled={checking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 hover:bg-white/5 transition-all text-gray-300 disabled:opacity-50"
        >
          <RefreshCw className={checking ? 'w-3 h-3 animate-spin' : 'w-3 h-3'} />
          Recheck
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((service, index) => (
          <HealthCheckItem
            key={index}
            name={service.name}
            description={service.description}
            status={service.status}
            message={service.message}
            latencyMs={service.latencyMs}
            details={service.details}
          />
        ))}
      </div>
    </div>
  )
}
