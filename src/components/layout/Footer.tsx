import Link from 'next/link'
import { Zap, Github, Globe, Heart } from 'lucide-react'

const FOOTER_LINKS = [
  { href: '/ai-stt',   label: 'Dictate'  },
  { href: '/ai-tts',   label: 'Voice'    },
  { href: '/blog',     label: 'Vault'    },
  { href: '/meeting',  label: 'Meeting'  },
  { href: '/spending', label: 'Spending' },
  { href: '/todos',    label: 'Todos'    },
  { href: '/memory',   label: 'Memory'   },
  { href: '/settings', label: 'Settings' },
  { href: '/contact',  label: 'Contact'  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-brand-border/50 bg-brand-dark/50 
      backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start 
          sm:items-center justify-between gap-6 mb-8">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand 
              flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold gradient-text">Mwijay Tech</p>
              <p className="text-[10px] text-brand-muted">
                AI Voice Studio & Developer Vault
              </p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/mwijay12/techymwijay"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg glass flex items-center justify-center
                text-brand-muted hover:text-brand-primary hover:glow-primary
                transition-all duration-200"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="/"
              className="w-8 h-8 rounded-lg glass flex items-center justify-center
                text-brand-muted hover:text-brand-accent
                transition-all duration-200"
              title="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-8">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-brand-muted hover:text-brand-primary 
                transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 
          pt-6 border-t border-brand-border/30">
          
          {/* System status */}
          <div className="flex items-center gap-1.5 text-xs text-brand-success">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
            <span>All systems operational</span>
          </div>

          <div className="hidden sm:block w-px h-3 bg-brand-border" />

          {/* Provider count */}
          <span className="text-xs text-brand-muted">
            5 AI providers · 100+ key pool
          </span>

          <div className="hidden sm:block w-px h-3 bg-brand-border" />

          {/* Version */}
          <span className="text-xs text-brand-muted">
            v1.0.0
          </span>

          {/* Copyright — pushed to end */}
          <div className="sm:ml-auto flex items-center gap-1 text-xs text-brand-muted/60">
            <span>© {year} Davie Mwijay</span>
            <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
            <span>Tanzania 🇹🇿</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer