'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mic, ArrowRight, ChevronDown, Shield } from 'lucide-react'
import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/components/auth/AuthProvider'
import { SignInButton } from '@/components/auth/SignInButton'
import { cn } from '@/lib/utils'

const TYPEWRITER_PHRASES = [
  'Record meetings in Swahili-English',
  'Manage 100+ AI keys without quota errors',
  'Encrypt your secrets locally',
  'Track spending in Tanzanian Shillings',
  'Dictate code snippets by voice',
  'Build faster with AI memory',
]

function TypewriterText() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIndex]

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, 2500)
      return () => clearTimeout(timer)
    }

    if (isDeleting) {
      if (displayed.length === 0) {
        setIsDeleting(false)
        setPhraseIndex(prev => (prev + 1) % TYPEWRITER_PHRASES.length)
        return
      }
      const timer = setTimeout(() => {
        setDisplayed(phrase.slice(0, displayed.length - 1))
      }, 30)
      return () => clearTimeout(timer)
    }

    if (displayed.length === phrase.length) {
      setIsPaused(true)
      return
    }

    const timer = setTimeout(() => {
      setDisplayed(phrase.slice(0, displayed.length + 1))
    }, 60)
    return () => clearTimeout(timer)
  }, [displayed, isDeleting, isPaused, phraseIndex])

  return (
    <span className="inline-block min-h-[1.5em] text-purple-400 font-mono">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  )
}

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const { user } = useAuth()

  return (
    <div className={cn('relative min-h-[90vh] flex flex-col justify-between py-8', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        {/* Left Column: Headline & Action */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300"
          >
            <span className="text-base">🇹🇿</span>
            <span className="font-semibold">Personal AI Productivity OS & Voice Studio</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]"
          >
            Mwijay Tech OS <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Voice & Productivity
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-300 font-medium h-12 flex items-center"
          >
            <TypewriterText />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed"
          >
            Built for Tanzanian developers and BIT students. Multi-provider AI key pool rotation, Swahili-English dictation, local AES-256 vault, TZS expense tracking, and offline support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            {user ? (
              <Link
                href="/ai-stt"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-200 shadow-xl shadow-purple-500/25"
              >
                <Mic className="w-4 h-4" />
                Launch Voice Studio
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <SignInButton size="lg" label="Get Started Free" />
            )}

            <Link
              href="/blog"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Open Developer Vault
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Prominent 3D Spline Scene with Spring Spotlight Tracking */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6 w-full"
        >
          <Card className="w-full h-[560px] md:h-[620px] bg-black/[0.96] relative overflow-hidden border-purple-500/20 shadow-2xl shadow-purple-500/10 rounded-3xl group">
            <Spotlight
              className="-top-40 left-0 md:left-60 md:-top-20"
              spotlightSize={600}
              spotlightColor="rgba(168, 85, 247, 0.35)"
            />
            <div className="w-full h-full relative z-10">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
                height={620}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-center pt-8">
        <a
          href="#stats"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-white text-xs transition-colors"
        >
          <span>Explore Platform</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </div>
  )
}

export default HeroSection
