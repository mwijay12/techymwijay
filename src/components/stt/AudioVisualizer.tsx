'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null
  isActive: boolean
  isPaused: boolean
  className?: string
  barColor?: string
  barCount?: number
  height?: number
}

export function AudioVisualizer({
  analyserNode,
  isActive,
  isPaused,
  className,
  barColor = '#8b5cf6',
  barCount = 48,
  height = 80,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, width, h)

    if (!analyserNode || !isActive || isPaused) {
      const barW = Math.floor(width / barCount) - 1
      for (let i = 0; i < barCount; i++) {
        const x = i * (barW + 1)
        const barH = 2
        const y = h / 2 - barH / 2

        ctx.fillStyle = isPaused ? `${barColor}40` : `${barColor}20`
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barW, barH, 1)
        } else {
          ctx.rect(x, y, barW, barH)
        }
        ctx.fill()
      }

      animFrameRef.current = requestAnimationFrame(draw)
      return
    }

    if (!dataArrayRef.current) {
      dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount)
    }
    analyserNode.getByteFrequencyData(dataArrayRef.current as any)

    const data = dataArrayRef.current
    const step = Math.floor(data.length / barCount)
    const barW = Math.max(1, Math.floor(width / barCount) - 1)

    for (let i = 0; i < barCount; i++) {
      const val = data[i * step] || 0
      const percent = val / 255
      const barH = Math.max(3, percent * (h - 8))
      const x = i * (barW + 1)
      const y = h / 2 - barH / 2

      const gradient = ctx.createLinearGradient(0, y, 0, y + barH)
      gradient.addColorStop(0, '#3b82f6')
      gradient.addColorStop(0.5, '#8b5cf6')
      gradient.addColorStop(1, '#ec4899')

      ctx.fillStyle = gradient
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW, barH, Math.min(2, barW / 2))
      } else {
        ctx.rect(x, y, barW, barH)
      }
      ctx.fill()
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [analyserNode, isActive, isPaused, barColor, barCount])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [draw])

  return (
    <div className={cn('w-full flex items-center justify-center', className)}>
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full max-w-2xl h-20 rounded-2xl bg-black/40 border border-white/10"
      />
    </div>
  )
}

export default AudioVisualizer
