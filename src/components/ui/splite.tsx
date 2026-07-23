'use client'

import { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene?: string
  className?: string
  height?: number
  fallbackAlways?: boolean
}

function CanvasFallback({
  className,
  height = 400,
}: {
  className?: string
  height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const draw = () => {
      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createRadialGradient(
        W / 2, H / 2, 0,
        W / 2, H / 2, W * 0.7
      )
      bg.addColorStop(0, 'rgba(99, 102, 241, 0.1)')
      bg.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)')
      bg.addColorStop(1, 'rgba(15, 15, 26, 0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const BAR_COUNT = 64
      const barW = W / BAR_COUNT - 1

      for (let i = 0; i < BAR_COUNT; i++) {
        const t = time / 60
        const wave1 = Math.sin(i * 0.2 + t) * 0.35
        const wave2 = Math.sin(i * 0.5 + t * 1.4) * 0.25
        const wave3 = Math.sin(i * 0.1 + t * 0.6) * 0.25
        const combined = Math.abs(wave1 + wave2 + wave3) / 1.1

        const minH = 6
        const maxH = H * 0.7
        const barH = minH + combined * maxH

        const x = i * (barW + 1)
        const y = H / 2 - barH / 2

        const ratio = i / BAR_COUNT
        const r = Math.round(99 + ratio * (6 - 99))
        const g = Math.round(102 + ratio * (182 - 102))
        const b = Math.round(241 + ratio * (212 - 241))
        const alpha = 0.3 + combined * 0.7

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barW, barH, 3)
        } else {
          ctx.rect(x, y, barW, barH)
        }
        ctx.fill()
      }

      time++
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={height}
      className={cn('w-full h-full', className)}
    />
  )
}

export function SplineScene({
  scene,
  className,
  height = 400,
  fallbackAlways = false,
}: SplineSceneProps) {
  const [hasError, setHasError] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Safety timeout: 25 seconds to allow slow connections to load Spline 3D
    const timer = setTimeout(() => {
      setLoadTimeout(true)
    }, 25000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearTimeout(timer)
    }
  }, [])

  if (isOffline || hasError || (loadTimeout && !scene) || fallbackAlways) {
    return <CanvasFallback className={className} height={height} />
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-2xl border border-white/10">
          <div className="flex flex-col items-center gap-2">
            <span className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 font-mono animate-pulse">
              Loading 3D Scene...
            </span>
          </div>
        </div>
      }
    >
      <Spline
        scene={scene || 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'}
        className={className}
        onLoad={() => {
          setHasError(false)
          setLoadTimeout(false)
        }}
        onError={() => setHasError(true)}
      />
    </Suspense>
  )
}

export default SplineScene
