'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Zap, Mic, Globe, ArrowRight, Sparkles, BarChart3, Clock, DollarSign, TrendingUp, Target, CheckCircle } from "lucide-react"
import Navigation from "@/components/layout/Navigation"
import Footer from "@/components/layout/Footer"
import ChatComponent from "@/components/layout/ChatComponent"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const caseStudies = [
  {
    title: "FinTech Real-Time Fraud Detection",
    client: "Major Tanzanian Bank",
    challenge: "Needed sub-50ms AI inference for real-time fraud scoring across 2M+ daily transactions.",
    solution: "Deployed AI-powered fraud detection with intelligent routing between multiple models for speed and accuracy.",
    results: [
      { icon: <Clock className="w-4 h-4 text-green-400" />, text: "42ms average response time" },
      { icon: <TrendingUp className="w-4 h-4 text-blue-400" />, text: "67% improvement in fraud detection" },
      { icon: <DollarSign className="w-4 h-4 text-yellow-400" />, text: "Millions saved in fraud losses" }
    ],
    gradient: "from-blue-500/10 to-purple-500/10",
    glow: "from-blue-500/20 to-purple-500/20"
  },
  {
    title: "E-Commerce Website & AI Chat",
    client: "Dar es Salaam Retail Chain",
    challenge: "Needed a modern e-commerce platform with AI-powered customer support to handle 10K+ daily visitors.",
    solution: "Built a full-stack Next.js e-commerce site integrated with AI chatbot for automated customer service, product recommendations, and order tracking.",
    results: [
      { icon: <BarChart3 className="w-4 h-4 text-green-400" />, text: "300% increase in online sales" },
      { icon: <Clock className="w-4 h-4 text-blue-400" />, text: "80% of inquiries handled by AI" },
      { icon: <Globe className="w-4 h-4 text-purple-400" />, text: "Nationwide delivery enabled" }
    ],
    gradient: "from-emerald-500/10 to-teal-500/10",
    glow: "from-emerald-500/20 to-teal-500/20"
  },
  {
    title: "Business Automation System",
    client: "Mwanza Logistics Company",
    challenge: "Manual data entry and document processing was causing delays and errors in their supply chain.",
    solution: "Developed a custom automation system that processes invoices, tracks inventory, and generates reports automatically using AI document processing.",
    results: [
      { icon: <TrendingUp className="w-4 h-4 text-green-400" />, text: "90% faster document processing" },
      { icon: <DollarSign className="w-4 h-4 text-yellow-400" />, text: "50% reduction in operational costs" },
      { icon: <Zap className="w-4 h-4 text-blue-400" />, text: "Zero manual data entry errors" }
    ],
    gradient: "from-purple-500/10 to-pink-500/10",
    glow: "from-purple-500/20 to-pink-500/20"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
}

export default function CaseStudiesPage() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
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
              <Sparkles className="w-4 h-4" />
              <span>Case Studies</span>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Real Results, Real Impact</span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 text-lg max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              See how businesses across Tanzania are transforming with our digital solutions.
            </motion.p>
          </motion.div>

          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {caseStudies.map((item, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <Card className={`relative bg-gradient-to-br ${item.gradient} border-white/10 hover:border-white/20 transition-all duration-300 card-lift`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 rounded-full px-3 py-1 mb-2">
                          <Target className="w-3 h-3" />
                          Client Case
                        </div>
                        <p className="text-sm text-blue-400 font-medium mb-1">{item.client}</p>
                        <CardTitle className="text-white text-2xl">{item.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          The Challenge
                        </h4>
                        <p className="text-gray-400 text-sm">{item.challenge}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          Our Solution
                        </h4>
                        <p className="text-gray-400 text-sm">{item.solution}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Results
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {item.results.map((result, j) => (
                          <motion.div 
                            key={j} 
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 + j * 0.1 }}
                            whileHover={{ x: 5 }}
                          >
                            <div className="p-2 rounded-lg bg-white/5">
                              {result.icon}
                            </div>
                            <span className="text-gray-300 text-sm font-medium">{result.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-500 mb-6">Want to see similar results for your business?</p>
            <motion.button
              onClick={() => setChatOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 shadow-xl shadow-blue-500/25 inline-flex items-center gap-2"
            >
              Start Your Success Story
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
      <Footer />
      <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
    </main>
  )
}