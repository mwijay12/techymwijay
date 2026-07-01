'use client'

import { useEffect, useRef } from 'react'

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const splineRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true
    
    const initSpline = async () => {
      try {
        const { Application } = await import('@splinetool/runtime')
        if (!mounted || !containerRef.current) return
        
        const canvas = document.createElement('canvas')
        containerRef.current.appendChild(canvas)
        
        const app = new Application(canvas)
        await app.load(scene)
        splineRef.current = app
      } catch (err) {
        // Spline failed to load - silent fallback
      }
    }
    
    initSpline()
    
    return () => {
      mounted = false
      if (splineRef.current) {
        try { splineRef.current.dispose?.() } catch {}
      }
    }
  }, [scene])

  return (
    <div 
      ref={containerRef}
      className={className || 'w-full h-full'}
      style={{ minHeight: '300px' }}
    />
  )
}
