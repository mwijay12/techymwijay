'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { SignInButton } from '@/components/auth/SignInButton'
import { 
  Mic, 
  Shield, 
  Brain, 
  Wallet,
  CheckCircle 
} from 'lucide-react'

const FEATURES = [
  { icon: <Mic className="w-4 h-4" />, text: 'Swahili-English voice dictation' },
  { icon: <Shield className="w-4 h-4" />, text: 'Encrypted developer vault' },
  { icon: <Brain className="w-4 h-4" />, text: 'AI that remembers you' },
  { icon: <Wallet className="w-4 h-4" />, text: 'Spending & todo tracker' },
]

export default function SignInPage() {
  const { user, isAuthenticated, loading, error, signInAsGuest } = useAuth()
  const router = useRouter()

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleGuestEntry = () => {
    signInAsGuest()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 
          rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/10 
          rounded-full blur-3xl animate-pulse-slow" 
          style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl">
          
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 
              rounded-2xl bg-gradient-brand mb-4 shadow-lg glow-primary">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-1">
              Mwijay Tech
            </h1>
            <p className="text-brand-muted text-sm">
              Your personal AI productivity OS
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3 mb-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg 
                  bg-brand-primary/10 border border-brand-primary/20 
                  flex items-center justify-center text-brand-primary">
                  {feature.icon}
                </div>
                <span className="text-brand-text">{feature.text}</span>
                <CheckCircle className="w-3.5 h-3.5 text-brand-success ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-brand-error/10 
              border border-brand-error/20 text-brand-error text-sm text-center">
              {error}
            </div>
          )}

          {/* Sign-in buttons */}
          <div className="space-y-3">
            <SignInButton size="lg" className="w-full" />
            
            <button
              type="button"
              onClick={handleGuestEntry}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-brand-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              Continue as Guest (Instant Access)
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-center text-xs text-brand-muted mt-6">
            Your data stays yours.{' '}
            <span className="text-brand-primary">
              Encrypted locally
            </span>
            {' '}and synced to your private Firebase account.
          </p>
        </div>

        {/* Version badge */}
        <p className="text-center text-xs text-brand-muted/50 mt-4">
          Mwijay Tech v1.0.0 · Built by Davie Mwijay · Tanzania 🇹🇿
        </p>
      </div>
    </main>
  )
}
