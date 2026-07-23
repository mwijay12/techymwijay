'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Volume2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_PHRASES = [
  { sw: 'Habari za asubuhi!', en: 'Good morning!' },
  { sw: 'Nimefika kazini.', en: 'I have arrived at work.' },
  { sw: 'Kazi inaendelea vizuri.', en: 'Work is going well.' },
  { sw: 'Asante kwa msaada.', en: 'Thank you for the help.' },
]

interface VoiceDemoProps {
  className?: string
}

export function VoiceDemo({ className }: VoiceDemoProps) {
  const router = useRouter()
  const [activePhrase, setActivePhrase] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleMicClick = () => {
    setIsAnimating(true)
    setActivePhrase(prev => (prev + 1) % DEMO_PHRASES.length)
    setTimeout(() => setIsAnimating(false), 800)
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
          See it in action
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Speaks your{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            language
          </span>
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Swahili, English, or both — mixed naturally the way Tanzanians actually talk.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-6 py-8 min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-xl font-bold text-white mb-2">
                  {DEMO_PHRASES[activePhrase].sw}
                </p>
                <p className="text-sm text-gray-400 italic font-mono">
                  {DEMO_PHRASES[activePhrase].en}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-0.5 px-6 py-3 border-t border-white/10 bg-black/20">
            {Array.from({ length: 32 }).map((_, i) => {
              const height = isAnimating
                ? Math.random() * 24 + 4
                : 4 + Math.sin(i * 0.5) * 8
              return (
                <div
                  key={i}
                  className={cn(
                    'rounded-full transition-all duration-150',
                    isAnimating ? 'bg-purple-400' : 'bg-white/20'
                  )}
                  style={{
                    width: '3px',
                    height: `${Math.max(4, height)}px`,
                  }}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
                🌍 Auto
              </span>
              <span>Swahili-English</span>
            </div>

            <motion.button
              onClick={handleMicClick}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg',
                isAnimating
                  ? 'bg-red-500 shadow-red-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-purple-500/30'
              )}
            >
              <Mic className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={() => router.push('/ai-stt')}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <Mic className="w-4 h-4" />
            Try Live Dictation
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => router.push('/ai-tts')}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Volume2 className="w-4 h-4" />
            Text to Speech
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {[
          { flag: '🇹🇿', lang: 'Swahili', note: 'Native support' },
          { flag: '🇺🇸', lang: 'English', note: 'Full support' },
          { flag: '🌍', lang: 'Mixed', note: 'Code-switching' },
        ].map(item => (
          <div
            key={item.lang}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs"
          >
            <span className="text-base">{item.flag}</span>
            <div>
              <p className="font-semibold text-white">{item.lang}</p>
              <p className="text-gray-400 text-[10px]">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VoiceDemo
