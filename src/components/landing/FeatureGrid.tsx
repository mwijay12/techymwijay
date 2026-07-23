'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Mic,
  Volume2,
  Shield,
  Wallet,
  CheckSquare,
  Brain,
  Video,
  Settings,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spotlight } from '@/components/ui/spotlight'

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Dictation',
    titleSw: 'Kuandika kwa Sauti',
    description:
      'Real-time Swahili-English speech-to-text using Groq Whisper-large-v3. Speaks both languages — naturally.',
    href: '/ai-stt',
    color: '#8b5cf6',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/20',
    badge: 'Groq Whisper v3',
  },
  {
    icon: Volume2,
    title: 'Text to Speech',
    titleSw: 'Maandishi kwa Sauti',
    description:
      'ElevenLabs Multilingual v2 with 17-key pool rotation. Natural AI voices that understand Swahili.',
    href: '/ai-tts',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/20',
    badge: 'ElevenLabs',
  },
  {
    icon: Shield,
    title: 'Developer Vault',
    titleSw: 'Hazina ya Msanidi',
    description:
      'AES-256-GCM encrypted passwords, code snippets, API keys, and notes. Master password stays on your device.',
    href: '/blog',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20',
    badge: 'AES-256 Encrypted',
  },
  {
    icon: Wallet,
    title: 'Spending Tracker',
    titleSw: 'Kufuatilia Matumizi',
    description:
      'Track every shilingi in TZS. Tanzanian categories including M-Pesa, chakula, usafiri, and more.',
    href: '/spending',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
    badge: 'TZS First 🇹🇿',
  },
  {
    icon: CheckSquare,
    title: 'Todo System',
    titleSw: 'Orodha ya Kazi',
    description:
      'Tasks with Swahili priorities — Haraka, Muhimu, Wastani, Kawaida. Daily planner + streak tracker.',
    href: '/todos',
    color: '#6366f1',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/20',
    badge: 'Daily Planner',
  },
  {
    icon: Brain,
    title: 'AI Memory',
    titleSw: 'Kumbukumbu ya AI',
    description:
      'The AI remembers your preferences, past conversations, vault context, and grows smarter continuously.',
    href: '/memory',
    color: '#ec4899',
    bgClass: 'bg-pink-500/10',
    borderClass: 'border-pink-500/20',
    badge: 'Personal Memory',
  },
  {
    icon: Video,
    title: 'Meeting Transcriber',
    titleSw: 'Kurekodi Mikutano',
    description:
      'Capture full conference transcripts in Swahili-English. Perfect for BIT lectures, meetings, and seminars.',
    href: '/meeting',
    color: '#f97316',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/20',
    badge: 'Live Transcript',
  },
  {
    icon: Settings,
    title: 'Key Pool Manager',
    titleSw: 'Meneja wa Funguo',
    description:
      '115+ API keys across 5 providers with automatic failover. Zero quota errors, 99.9% AI uptime.',
    href: '/settings',
    color: '#94a3b8',
    bgClass: 'bg-slate-500/10',
    borderClass: 'border-slate-500/20',
    badge: '115+ Keys',
  },
]

interface FeatureGridProps {
  className?: string
}

export function FeatureGrid({ className }: FeatureGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className={cn('space-y-6', className)}>
      <div className="text-center max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3"
        >
          Everything in one place
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-black text-white mb-3"
        >
          Your complete{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            AI productivity stack
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-sm"
        >
          Built for Tanzanian developers. Works everywhere. Runs offline. Encrypts locally.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: i * 0.07,
                ease: 'easeOut',
              }}
            >
              <Spotlight
                spotlightColor={`${feature.color}18`}
                spotlightSize={300}
                className="h-full"
              >
                <Link
                  href={feature.href}
                  className={cn(
                    'group relative flex flex-col h-full p-5 bg-white/5 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:border-opacity-60 hover:-translate-y-1',
                    feature.borderClass
                  )}
                  style={{
                    borderLeftWidth: '3px',
                    borderLeftColor: feature.color,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', feature.bgClass)}>
                      <Icon className="w-4.5 h-4.5" style={{ color: feature.color }} />
                    </div>

                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        color: feature.color,
                        backgroundColor: `${feature.color}15`,
                        borderColor: `${feature.color}30`,
                      }}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 mb-2 font-medium">
                    {feature.titleSw}
                  </p>

                  <p className="text-xs text-gray-400 leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  <div
                    className="flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ color: feature.color }}
                  >
                    Open
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </Link>
              </Spotlight>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default FeatureGrid
