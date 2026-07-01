'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LANGUAGES = [
  { value: 'sw-TZ', label: 'Kiswahili' },
  { value: 'en-US', label: 'English' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'pt-PT', label: 'Português' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'zh-CN', label: '中文' },
  { value: 'ar-SA', label: 'العربية' },
]

const displayLabels: Record<string, string> = {
  'sw-TZ': 'Kiswahili',
  'en-US': 'English',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'it-IT': 'Italiano',
  'pt-PT': 'Português',
  'ja-JP': '日本語',
  'zh-CN': '中文',
  'ar-SA': 'العربية',
}

type Props = {
  language: string
  onLanguageChange: (lang: string) => void
  disabled?: boolean
}

export function MeetingLanguagePicker({ language, onLanguageChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const normalized = language in displayLabels ? language : 'sw-TZ'
  const currentLabel = displayLabels[normalized] ?? 'Kiswahili'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm disabled:opacity-40"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-white/80">{currentLabel}</span>
        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl p-1.5 z-50 shadow-xl max-h-56 overflow-y-auto"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => { onLanguageChange(lang.value); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  normalized === lang.value
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="flex-1">{lang.label}</span>
                {normalized === lang.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}