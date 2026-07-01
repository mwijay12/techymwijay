'use client'

import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  originalText: string
  translatedText?: string
  originalLanguage: string
  translationLanguage: string
  showTranslation: boolean
  isFullscreen: boolean
  interimText: string
}

const DISPLAY_LABELS: Record<string, string> = {
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

export function MeetingDualPane({
  originalText,
  translatedText,
  originalLanguage,
  translationLanguage,
  showTranslation,
  isFullscreen,
  interimText,
}: Props) {
  const origLabel = DISPLAY_LABELS[originalLanguage] ?? originalLanguage
  const transLabel = translationLanguage
    ? DISPLAY_LABELS[translationLanguage] ?? translationLanguage
    : 'English'

  const paneTextSize = isFullscreen ? 'text-3xl lg:text-4xl' : 'text-xl lg:text-2xl'

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 min-h-[300px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <div className={`relative z-10 w-full max-w-5xl grid gap-4 ${showTranslation ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Original language pane */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 min-h-[200px] flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{origLabel}</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={originalText.slice(-20) || 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center w-full"
              >
                {originalText && (
                  <p className={`${paneTextSize} font-semibold text-white leading-tight`}>{originalText}</p>
                )}
                {!originalText && interimText && (
                  <p className={`${paneTextSize} font-medium text-white/40 italic leading-tight`}>{interimText}</p>
                )}
                {!originalText && !interimText && (
                  <p className={`${paneTextSize} text-white/20 italic`}>Waiting for speech...</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Translation pane */}
        {showTranslation && (
          <div className="glass-card rounded-2xl p-4 sm:p-6 min-h-[200px] flex flex-col border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{transLabel}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={translatedText ?? 'no-trans'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center w-full"
                >
                  {translatedText ? (
                    <p className={`${paneTextSize} font-medium text-blue-300/90 leading-tight`}>{translatedText}</p>
                  ) : (
                    <p className={`${paneTextSize} text-blue-300/30 italic`}>Translation will appear here...</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}