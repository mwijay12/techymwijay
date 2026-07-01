'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { isFirebaseConfigured } from '@/lib/firebase'

export function SyncStatus() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (!isFirebaseConfigured || !user) return null

  return (
    <div
      className="flex items-center gap-1.5"
      title={
        isOnline
          ? 'Synced to cloud'
          : 'Offline — changes saved locally'
      }
    >
      {isOnline ? (
        <Cloud className="w-3.5 h-3.5 text-emerald-400/60" />
      ) : (
        <CloudOff className="w-3.5 h-3.5 text-yellow-400/60" />
      )}
      <span className="text-xs text-white/25 hidden sm:block">
        {isOnline ? 'Synced' : 'Offline'}
      </span>
    </div>
  )
}