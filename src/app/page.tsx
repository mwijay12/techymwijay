'use client'

import AppShell from '@/components/layout/AppShell'
import PageWrapper from '@/components/layout/PageWrapper'
import { HeroSection } from '@/components/landing/HeroSection'
import { StatsBar } from '@/components/landing/StatsBar'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { VoiceDemo } from '@/components/landing/VoiceDemo'
import { PersonalStory } from '@/components/landing/PersonalStory'
import { CTASection } from '@/components/landing/CTASection'

export default function LandingPage() {
  return (
    <AppShell>
      <PageWrapper maxWidth="7xl">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 space-y-20 pb-16">
          <HeroSection />
          
          <div id="stats">
            <StatsBar />
          </div>

          <FeatureGrid />

          <VoiceDemo />

          <PersonalStory />

          <CTASection />
        </div>
      </PageWrapper>
    </AppShell>
  )
}