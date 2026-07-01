'use client'

import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  finalText: string
  interimText: string
  translatedText?: string
  showTranslation: boolean
  isFullscreen: boolean
}

export function MeetingCaptionDisplay({
  finalText,
  interimText,
  translatedText,
  showTranslation,
  isFullscreen,
}: Props) {
  const textSize = isFullscreen ? 'text-4xl lg:text-5xl' : 'text-2xl lg:text-3xl'
  const translationSize = isFullscreen ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-8 py-12 min-h-[300px]">
      {/* Grid background pattern for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Main caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={finalText.slice(-30)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 text-center max-w-5xl"
        >
          {finalText && (
            <p className={`${textSize} font-semibold text-white leading-tight mb-4`}>
              {finalText}
            </p>
          )}

          {interimText && (
            <p className={`${textSize} font-medium text-white/40 italic leading-tight`}>
              {interimText}
            </p>
          )}

          {!finalText && !interimText && (
            <p className={`${textSize} text-white/20 italic`}>
              Waiting for speech...
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Translation */}
      <AnimatePresence>
        {showTranslation && translatedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mt-8 px-6 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 max-w-4xl text-center"
          >
            <p className={`${translationSize} text-blue-300/90 leading-relaxed`}>
              {translatedText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}