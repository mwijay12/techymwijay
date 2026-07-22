'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface SplineSceneProps {
  scene: string
  className?: string
  fallback?: React.ReactNode
}

export function SplineScene({ scene, className, fallback }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const splineRef = useRef<any>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isElectron, setIsElectron] = useState(false)
  const [splineLoaded, setSplineLoaded] = useState(false)

  useEffect(() => {
    // Check if running in Electron or offline
    const isElectronApp = typeof window !== 'undefined' && window.electronAPI?.isElectron
    setIsElectron(!!isElectronApp)
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Skip Spline loading if offline or in Electron (offline-first)
    if (!isOnline || isElectron) return

    let mounted = true
    
    const initSpline = async () => {
      try {
        const { Application } = await import('@splinetool/runtime')
        if (!mounted || !containerRef.current) return
        
        const canvas = document.createElement('canvas')
        containerRef.current.appendChild(canvas)
        
        const app = new Application(canvas)
        await app.load(scene)
        
        if (mounted) {
          splineRef.current = app
          setSplineLoaded(true)
        }
      } catch (err) {
        // Spline failed to load - silent fallback
        console.warn('Spline failed to load, using fallback')
      }
    }
    
    initSpline()
    
    return () => {
      mounted = false
      if (splineRef.current) {
        try { splineRef.current.dispose?.() } catch {}
      }
    }
  }, [scene, isOnline, isElectron])

  // Show fallback when offline, in Electron, or Spline failed to load
  if (!isOnline || isElectron || !splineLoaded) {
    return (
      <div 
        className={className || 'w-full h-full'}
        style={{ minHeight: '300px' }}
      >
        {fallback || <DefaultSplineFallback />}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={className || 'w-full h-full'}
      style={{ minHeight: '300px' }}
    />
  )
}

// Default animated fallback for offline/Electron mode
function DefaultSplineFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative">
        {/* Animated rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500/20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-purple-500/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        {/* Center icon */}
        <motion.div
          className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-white">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
