'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Sparkles, Mail, MapPin, Phone, Loader2, Clock, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/layout/Navigation"
import Footer from "@/components/layout/Footer"
import ChatComponent from "@/components/layout/ChatComponent"

export default function ContactPage() {
  const [chatOpen, setChatOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      <Navigation onOpenChat={() => setChatOpen(true)} />

      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div 
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Mail className="w-4 h-4" />
              <span>Get In Touch</span>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Let's Build Together</span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Ready to transform your business with AI? Tell us about your project and we'll get back to you within 24 hours.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {submitted ? (
                <motion.div 
                  className="h-full flex flex-col items-center justify-center text-center p-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div 
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 360] }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-4">Message Sent Successfully!</h3>
                  <p className="text-gray-400 text-lg mb-6">Thank you for reaching out. Our team will review your message and get back to you within 24 hours.</p>
                  <motion.button
                    onClick={() => setSubmitted(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/25"
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" 
                      placeholder="Your name" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" 
                      placeholder="your@email.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Company</label>
                    <input 
                      type="text" 
                      value={formData.company} 
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" 
                      placeholder="Your company (optional)" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Message *</label>
                    <textarea 
                      required 
                      rows={5} 
                      value={formData.message} 
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all resize-none" 
                      placeholder="Tell us about your project..." 
                    />
                  </div>
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              <Card className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all card-lift">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <motion.a 
                    href="mailto:mwijaydavie@gmail.com"
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Email</p>
                      <p className="text-gray-400 text-sm">mwijaydavie@gmail.com</p>
                    </div>
                  </motion.a>
                  <motion.div 
                    className="flex items-start gap-3"
                    whileHover={{ x: 5 }}
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <MapPin className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Location</p>
                      <p className="text-gray-400 text-sm">Dar es Salaam, Tanzania</p>
                    </div>
                  </motion.div>
                  <motion.a 
                    href="tel:+255790942616"
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                      <Phone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Phone</p>
                      <p className="text-gray-400 text-sm">+255 790 942 616</p>
                    </div>
                  </motion.a>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 hover:border-white/20 transition-all card-lift gradient-border">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Office Hours
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="text-white font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-gray-400">Saturday</span>
                    <span className="text-white font-medium">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-gray-400">Sunday</span>
                    <span className="text-red-400 font-medium">Closed</span>
                  </div>
                </div>
              </Card>

              {/* Quick Response Badge */}
              <motion.div 
                className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>We typically respond within 2 hours during business hours</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
      <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
    </main>
  )
}