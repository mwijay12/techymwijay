'use client'

import { useState } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: string
  icon: LucideIcon
  iconColor?: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
  className?: string
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  iconColor = 'text-purple-400',
  children,
  defaultOpen = true,
  badge,
  className,
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        'bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden',
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors duration-200 text-left"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
          <Icon className={cn('w-4 h-4', iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-white">
              {title}
            </span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>

        <ChevronDown
          className={cn(
            'flex-shrink-0 w-4 h-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-white/10 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsSection