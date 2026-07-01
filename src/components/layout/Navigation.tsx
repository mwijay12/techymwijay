'use client'

import { useState, useEffect } from "react"
import { Code2, Menu, X, MessageSquare, Sparkles, Video } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { SyncStatus } from "@/components/auth/SyncStatus"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "AI TTS", href: "/ai-tts" },
  { name: "AI STT", href: "/ai-stt" },
  { name: "Meeting", href: "/meeting" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
  { name: "Settings", href: "/settings" },
]

export default function Navigation({ onOpenChat }: { onOpenChat: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Code2 className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Mwijay Tech
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 group"
              >
                {item.name}
                <span className="absolute inset-x-4 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
            <motion.button 
              onClick={onOpenChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <span className="w-4 h-4 flex items-center justify-center">💬</span>
              Chat
            </motion.button>
            <div className="flex items-center gap-2 ml-3">
              <SyncStatus />
              <UserAvatar />
            </div>
          </div>

          <button
            className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-400 hover:text-white hover:bg-white/5 transition-all px-4 py-3 rounded-xl text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <motion.button 
                onClick={() => { onOpenChat(); setMobileMenuOpen(false) }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold text-lg mt-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <Sparkles className="w-5 h-5" />
                Let's Talk
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}