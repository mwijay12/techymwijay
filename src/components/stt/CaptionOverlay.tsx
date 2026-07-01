'use client'

import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  show: boolean
  interimText: string
  transcribedText: string
  translatedText: string
}

export function CaptionOverlay({ show, interimText, transcribedText, translatedText }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[90%]"
        >
          <div className="bg-black/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 text-center shadow-2xl">
            <p className="text-emerald-300 text-lg font-medium">
              {interimText || transcribedText}
            </p>
            {translatedText && (
              <p className="text-blue-300 text-sm mt-1">{translatedText}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}