'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  noPadding?: boolean
  noAnimation?: boolean
}

const MAX_WIDTH_CLASSES = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full:  'max-w-full',
}

export function PageWrapper({
  children,
  className,
  maxWidth = '7xl',
  noPadding = false,
  noAnimation = false,
}: PageWrapperProps) {
  const content = (
    <div
      className={cn(
        'mx-auto w-full',
        MAX_WIDTH_CLASSES[maxWidth],
        !noPadding && 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
        className
      )}
    >
      {children}
    </div>
  )

  if (noAnimation) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  )
}

export default PageWrapper
