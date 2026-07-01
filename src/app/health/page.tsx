'use client'

import { useState, useEffect } from 'react'
import { Activity, CheckCircle, XCircle, Monitor, Cpu, Database, Radio, Globe } from 'lucide-react'
import { isFirebaseConfigured } from '@/lib/env'
import { isElectron } from '@/lib/electron'
import { isBrowser, isDevelopment } from '@/lib/runtime'
import { ProviderStatusBadge } from '@/components/ai/ProviderStatusBadge'

interface HealthData {
  status: string
  app: { name: string; version: string; description: string }
  runtime: { environment: string; timestamp: string }
  firebase: { configured: boolean; projectId: string | null }
  electron: { expected: boolean }
  ai: { defaultProvider: string; defaultModel: string; usePuter: boolean }
}

interface StatusBadgeProps {
  label: string
  status: 'ok' | 'warn' | 'error' | 'info'
}

function StatusBadge({ label, status }: StatusBadgeProps) {
  const colors = {
    ok: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warn: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[status]}`}>
      {status === 'ok' && <CheckCircle className="w-3 h-3" />}
      {status === 'warn' && <Activity className="w-3 h-3" />}
      {status === 'error' && <XCircle className="w-3 h-3" />}
      {status === 'info' && <Radio className="w-3 h-3" />}
      {label}
    </span>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | boolean | null }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm text-gray-200 font-mono">
        {value === null ? '—' : String(value)}
      </span>
    </div>
  )
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [puterDetected, setPuterDetected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })

    try {
      setPuterDetected(
        typeof window !== 'undefined' &&
        !!(window as any).puter
      )
    } catch {
      setPuterDetected(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">System Diagnostics</h1>
            <p className="text-xs text-gray-500">Internal health and configuration status</p>
          </div>
        </div>

        {loading && (
          <div className="glass-card p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-400">Checking system status...</p>
          </div>
        )}

        {error && !loading && (
          <div className="glass-card p-6 border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Health check failed</span>
            </div>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        )}

        {health && !loading && (
          <div className="space-y-4">
            {/* App Info */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                Application
              </h2>
              <div className="space-y-1">
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="App" value={`${health.app.name} v${health.app.version}`} />
                <InfoRow icon={<Cpu className="w-3.5 h-3.5" />} label="Environment" value={health.runtime.environment} />
                <InfoRow icon={<Activity className="w-3.5 h-3.5" />} label="Status" value={health.status} />
                <InfoRow icon={<Radio className="w-3.5 h-3.5" />} label="Timestamp" value={health.runtime.timestamp} />
              </div>
            </div>

            {/* Services */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Services
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Firebase</span>
                  {isFirebaseConfigured ? (
                    <StatusBadge label="Configured" status="ok" />
                  ) : (
                    <StatusBadge label="Not configured" status="warn" />
                  )}
                </div>
                {isFirebaseConfigured && health.firebase.projectId && (
                  <InfoRow icon={<Database className="w-3.5 h-3.5" />} label="Project" value={health.firebase.projectId} />
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-gray-400">Puter.js (client)</span>
                  {puterDetected === null ? (
                    <StatusBadge label="Checking..." status="info" />
                  ) : puterDetected ? (
                    <StatusBadge label="Available" status="ok" />
                  ) : (
                    <StatusBadge label="Not detected" status="warn" />
                  )}
                </div>
              </div>
            </div>

            {/* Runtime */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                Runtime
              </h2>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Current runtime</span>
                  {isElectron() ? (
                    <StatusBadge label="Electron" status="ok" />
                  ) : isBrowser ? (
                    <StatusBadge label="Browser" status="ok" />
                  ) : (
                    <StatusBadge label="Server" status="info" />
                  )}
                </div>
                <InfoRow icon={<Cpu className="w-3.5 h-3.5" />} label="User Agent" value={isBrowser ? window.navigator.userAgent.substring(0, 80) + '...' : 'N/A'} />
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Development" value={isDevelopment ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Provider Health */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                AI Provider Health
              </h2>
              <div className="space-y-2">
                {['puter', 'groq', 'gemini', 'cerebras', 'openrouter', 'huggingface'].map((id) => (
                  <div key={id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 capitalize">{id}</span>
                    <ProviderStatusBadge providerId={id} showLabel size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Config */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                AI Configuration
              </h2>
              <div className="space-y-1">
                <InfoRow icon={<Cpu className="w-3.5 h-3.5" />} label="Default Provider" value={health.ai.defaultProvider} />
                <InfoRow icon={<Cpu className="w-3.5 h-3.5" />} label="Default Model" value={health.ai.defaultModel} />
                <InfoRow icon={<Cpu className="w-3.5 h-3.5" />} label="Use Puter.js" value={health.ai.usePuter ? 'Yes' : 'No'} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}