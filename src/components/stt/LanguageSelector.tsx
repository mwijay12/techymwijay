'use client'

import { Languages, ArrowRight } from 'lucide-react'

export const SUPPORTED_LANGUAGES = [
  { code: 'sw-TZ', label: 'Kiswahili', flag: '🇹🇿', short: 'sw' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸', short: 'en' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧', short: 'en' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷', short: 'fr' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸', short: 'es' },
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷', short: 'pt' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪', short: 'de' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳', short: 'zh' },
  { code: 'ar-SA', label: 'العربية', flag: '🇸🇦', short: 'ar' },
  { code: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳', short: 'hi' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['short']

export const languageNames: Record<string, string> = {
  'sw': 'Kiswahili', 'en': 'English', 'es': 'Español', 'fr': 'Français',
  'de': 'Deutsch', 'it': 'Italiano', 'pt': 'Português', 'ja': '日本語',
  'zh': '中文', 'ar': 'العربية',
}

export const languageMap: Record<string, string> = {
  'sw': 'sw-TZ', 'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR',
  'de': 'de-DE', 'it': 'it-IT', 'pt': 'pt-BR', 'ja': 'ja-JP',
  'zh': 'zh-CN', 'ar': 'ar-SA',
}

type Props = {
  language: string
  targetLang: string
  onLanguageChange: (lang: string) => void
  onTargetLangChange: (lang: string) => void
  autoTranslate: boolean
  onAutoTranslateChange: (val: boolean) => void
  disabled?: boolean
}

export function LanguageSelector({
  language,
  targetLang,
  onLanguageChange,
  onTargetLangChange,
  autoTranslate,
  onAutoTranslateChange,
  disabled = false,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <Languages className="w-3 h-3 text-gray-500" />
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
      >
        {Object.entries(languageNames).map(([k, v]) => (
          <option key={k} value={k} className="bg-gray-900">{v}</option>
        ))}
      </select>
      {language !== targetLang && (
        <>
          <ArrowRight className="w-3 h-3 text-gray-600" />
          <select
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value)}
            disabled={disabled}
            className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
          >
            {Object.entries(languageNames).map(([k, v]) =>
              k !== language ? (
                <option key={k} value={k} className="bg-gray-900">{v}</option>
              ) : null
            )}
          </select>
        </>
      )}
      <button
        onClick={() => onAutoTranslateChange(!autoTranslate)}
        className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
          autoTranslate
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : 'text-gray-500 border-white/10'
        }`}
      >
        Auto
      </button>
    </div>
  )
}