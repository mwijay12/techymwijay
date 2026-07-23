'use client'

import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { SystemHealthDashboard } from '@/components/health/SystemHealthDashboard'
import { IntegrationTestRunner } from '@/components/health/IntegrationTestRunner'
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react'
import { useAppState } from '@/hooks/use-app-state'

export default function HealthPage() {
  const { platform, isOnline } = useAppState()

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                System Health & Verification
              </h1>
              <p className="text-xs text-gray-400">
                Verify Mwijay Tech OS services, platform integration, and API channels
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#121225] border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Platform
                </span>
                <span className="text-lg">💻</span>
              </div>
              <p className="text-lg font-black text-white mt-1 capitalize">
                {platform} App
              </p>
            </div>

            <div className="bg-[#121225] border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Connectivity
                </span>
                <span className="text-lg">{isOnline ? '🟢' : '🔴'}</span>
              </div>
              <p className="text-lg font-black text-white mt-1">
                {isOnline ? 'Online Mode' : 'Offline Mode'}
              </p>
            </div>

            <div className="bg-[#121225] border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Verification
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-lg font-black text-white mt-1">
                Pre-Deploy Ready
              </p>
            </div>
          </div>

          {/* Service Health Dashboard */}
          <div className="bg-[#121225]/50 border border-white/5 p-6 rounded-2xl space-y-4">
            <SystemHealthDashboard />
          </div>

          {/* Integration Test Runner */}
          <div className="bg-[#121225]/50 border border-white/5 p-6 rounded-2xl space-y-4">
            <IntegrationTestRunner />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}