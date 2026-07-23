'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useSpring, useTransform, SpringOptions } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SpotlightProps {
  className?: string
  size?: number
  spotlightSize?: number
  spotlightColor?: string
  fill?: string
  springOptions?: SpringOptions
  children?: React.ReactNode
}

export function Spotlight({
  className,
  size = 400,
  spotlightSize,
  fill = 'rgba(99, 102, 241, 0.15)',
  spotlightColor,
  springOptions = { bounce: 0 },
  children,
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)

  const actualSize = spotlightSize || size
  const actualColor = spotlightColor || fill

  const mouseX = useSpring(0, springOptions)
  const mouseY = useSpring(0, springOptions)

  const spotlightLeft = useTransform(mouseX, (x) => `${x - actualSize / 2}px`)
  const spotlightTop = useTransform(mouseY, (y) => `${y - actualSize / 2}px`)

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement
      if (parent) {
        parent.style.position = 'relative'
        parent.style.overflow = 'hidden'
        setParentElement(parent)
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return
      const { left, top } = parentElement.getBoundingClientRect()
      mouseX.set(event.clientX - left)
      mouseY.set(event.clientY - top)
    },
    [mouseX, mouseY, parentElement]
  )

  useEffect(() => {
    if (!parentElement) return

    parentElement.addEventListener('mousemove', handleMouseMove)
    parentElement.addEventListener('mouseenter', () => setIsHovered(true))
    parentElement.addEventListener('mouseleave', () => setIsHovered(false))

    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove)
      parentElement.removeEventListener('mouseenter', () => setIsHovered(true))
      parentElement.removeEventListener('mouseleave', () => setIsHovered(false))
    }
  }, [parentElement, handleMouseMove])

  return (
    <>
      <motion.div
        ref={containerRef}
        className={cn(
          'pointer-events-none absolute rounded-full blur-xl transition-opacity duration-200 z-10',
          isHovered ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{
          width: actualSize,
          height: actualSize,
          left: spotlightLeft,
          top: spotlightTop,
          background: actualColor.startsWith('rgba') || actualColor.startsWith('#')
            ? `radial-gradient(circle at center, ${actualColor}, transparent 80%)`
            : undefined,
        }}
      />
      {children}
    </>
  )
}

export default Spotlight