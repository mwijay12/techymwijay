'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

const STATS = [
  {
    value: 115,
    label: 'API Keys',
    suffix: '+',
    sublabel: 'across 5 providers',
    color: 'text-purple-400',
  },
  {
    value: 99.9,
    label: 'Uptime',
    suffix: '%',
    sublabel: 'auto failover',
    color: 'text-emerald-400',
  },
  {
    value: 2,
    label: 'Languages',
    suffix: '',
    sublabel: 'Swahili + English',
    color: 'text-cyan-400',
  },
  {
    value: 256,
    label: 'Encryption',
    suffix: '-bit',
    sublabel: 'AES-GCM local',
    color: 'text-amber-400',
  },
]

function AnimatedCounter({
  target,
  suffix,
  duration = 2000,
  trigger,
}: {
  target: number
  suffix: string
  duration?: number
  trigger: boolean
}) {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!trigger) return

    const start = performance.now()
    startRef.current = start

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      setCount(current)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [trigger, target, duration])

  const display = target % 1 !== 0
    ? count.toFixed(1)
    : Math.round(count).toString()

  return (
    <span>
      {display}
      {suffix}
    </span>
  )
}

interface StatsBarProps {
  className?: string
}

export function StatsBar({ className }: StatsBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div
      ref={ref}
      className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}
    >
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 text-center hover:border-purple-500/30 transition-all duration-300 group"
          style={{
            transitionDelay: `${i * 100}ms`,
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <p className={cn('text-3xl font-black mb-1 group-hover:scale-110 transition-transform duration-200 font-mono', stat.color)}>
            <AnimatedCounter
              target={stat.value}
              suffix={stat.suffix}
              trigger={isInView}
            />
          </p>
          <p className="text-sm font-semibold text-white">
            {stat.label}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {stat.sublabel}
          </p>
        </div>
      ))}
    </div>
  )
}

export default StatsBar
