'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, GraduationCap, Code2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORY_POINTS = [
  {
    icon: MapPin,
    title: 'Based in Tanzania 🇹🇿',
    description:
      'Built in Dar es Salaam for the East African developer community. Every feature is designed with the Tanzanian context in mind.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: GraduationCap,
    title: 'BIT Student & Developer',
    description:
      'As a Bachelor of Information Technology student, I needed a tool that could handle my classes, projects, and side hustles in one place.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Code2,
    title: 'Open Developer Infrastructure',
    description:
      'Tired of hitting API quotas and losing work? Built a 115+ key pool that rotates automatically. No more interruptions.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Heart,
    title: 'Privacy by Design',
    description:
      'Your passwords and secrets are AES-256 encrypted on YOUR device. Your master password never touches any server. Ever.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
]

interface PersonalStoryProps {
  className?: string
}

export function PersonalStory({ className }: PersonalStoryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} className={cn('space-y-8', className)}>
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3"
        >
          The story behind it
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-black text-white"
        >
          Built by{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Davie Mwijay
          </span>{' '}
          in Tanzania
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-purple-500/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-5xl text-purple-400/20 font-serif leading-none mb-3 select-none">
              "
            </div>

            <blockquote className="text-sm text-gray-200 leading-relaxed relative z-10 font-sans">
              Nilikuwa na tatizo kubwa — API keys zinakwisha haraka, passwords scattered everywhere, na hakuna tool moja inayoelewa Kiswahili. So I built one.
            </blockquote>

            <div className="text-4xl text-purple-400/20 font-serif text-right leading-none mt-3 select-none">
              "
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                DM
              </div>
              <div>
                <p className="text-sm font-bold text-white">Davie Mwijay</p>
                <p className="text-xs text-gray-400">Founder, Mwijay Tech · Dar es Salaam 🇹🇿</p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 text-2xl opacity-20 select-none">
              🇹🇿
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-3 space-y-3">
          {STORY_POINTS.map((point, i) => {
            const Icon = point.icon
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-purple-500/30 transition-all duration-200"
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', point.bg)}>
                  <Icon className={cn('w-4 h-4', point.color)} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">{point.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{point.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {[
          'Next.js 16',
          'TypeScript',
          'Electron 42',
          'Firebase',
          'Groq Whisper',
          'ElevenLabs',
          'AES-256-GCM',
          'Framer Motion',
          'Chrome Extension',
          'Tailwind CSS',
        ].map(tech => (
          <span
            key={tech}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all duration-200"
          >
            {tech}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default PersonalStory
