'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap, Shield, Globe, ArrowRight, Github } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { SignInButton } from '@/components/auth/SignInButton'
import { cn } from '@/lib/utils'

const BENEFITS = [
  { icon: Zap, text: '100% free to use', sub: 'No subscription needed' },
  { icon: Shield, text: 'Encrypted locally', sub: 'Your data stays yours' },
  { icon: Globe, text: 'Works offline', sub: 'Electron desktop app' },
]

interface CTASectionProps {
  className?: string
}

export function CTASection({ className }: CTASectionProps) {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-3xl border border-purple-500/20 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-purple-300">
            Free & Open — Start today
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-black mb-4"
        >
          <span className="text-white">Ready to be more </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            productive?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Join Mwijay Tech — your personal AI productivity OS. Inasaidia kufanya kazi vizuri zaidi, haraka zaidi, bila stress ya API quotas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {BENEFITS.map(benefit => {
            const Icon = benefit.icon
            return (
              <div key={benefit.text} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-xs">{benefit.text}</p>
                  <p className="text-gray-500 text-[10px]">{benefit.sub}</p>
                </div>
              </div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {user ? (
            <button
              type="button"
              onClick={() => router.push('/ai-stt')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-200 shadow-xl shadow-purple-500/25"
            >
              <Zap className="w-5 h-5" />
              Open Voice Studio
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <SignInButton size="lg" label="Get Started Free" />
          )}

          <a
            href="https://github.com/mwijay12/techymwijay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[10px] text-gray-500 mt-6"
        >
          No credit card required · Free tier · Bring your own API keys · Data stays local
        </motion.p>
      </div>
    </div>
  )
}

export default CTASection
