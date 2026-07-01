'use client'

import { Code2, Mail, MapPin, Phone, Heart, Sparkles, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const footerLinks = [
  {
    title: "Services",
    items: [
      { name: "Web Development", href: "/services" },
      { name: "AI Integration", href: "/services" },
      { name: "UI/UX Design", href: "/services" },
      { name: "Automation", href: "/services" },
      { name: "Creative Tech", href: "/services" }
    ]
  },
  {
    title: "Company",
    items: [
      { name: "About Us", href: "/team" },
      { name: "Blog", href: "/blog" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Pricing", href: "/pricing" },
      { name: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Support",
    items: [
      { name: "Help Center", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "FAQ", href: "#" }
    ]
  }
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 pt-16 pb-8 px-4 bg-gradient-to-b from-black to-blue-950/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <motion.div 
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Code2 className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Mwijay Tech
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              We build stunning websites, intelligent automation, and creative tech solutions. 
              Web development, AI integration, and digital transformation for your business.
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a href="tel:+255790942616" className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+255 790 942 616</span>
              </a>
              <a href="mailto:mwijaydavie@gmail.com" className="flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>mwijaydavie@gmail.com</span>
              </a>
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Dar es Salaam, Tanzania</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section, i) => (
            <div key={i}>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-3">
                {section.items.map((item, j) => (
                  <li key={j}>
                    <Link 
                      href={item.href} 
                      className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-1 group"
                    >
                      {item.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 flex items-center gap-1">
            &copy; {currentYear} Mwijay Tech. Crafted with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> in Tanzania
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</a>
            <div className="flex items-center gap-1 text-gray-600">
              <Sparkles className="w-3 h-3" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}