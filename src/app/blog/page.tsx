
'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Sparkles, Clock, ArrowRight, ChevronRight, Tag, User, Calendar } from "lucide-react"
import Navigation from "@/components/layout/Navigation"
import Footer from "@/components/layout/Footer"
import ChatComponent from "@/components/layout/ChatComponent"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const posts = [
  {
    title: "Why Multi-Model AI Architecture is the Future of Enterprise AI",
    excerpt: "Discover how routing requests across Gemini, Cerebras, Groq, and OpenRouter creates unprecedented reliability and performance.",
    date: "June 12, 2026",
    author: "Hermes AI Team",
    category: "Architecture",
    readTime: "8 min read",
    gradient: "from-blue-500/10 to-purple-500/10",
    glow: "from-blue-500/20 to-purple-500/20"
  },
  {
    title: "Cerebras vs Groq vs Gemini: A Real-World Latency Comparison",
    excerpt: "We benchmarked all four providers across 10,000 requests. See which model wins for each use case.",
    date: "June 5, 2026",
    author: "Engineering Team",
    category: "Benchmarks",
    readTime: "12 min read",
    gradient: "from-emerald-500/10 to-teal-500/10",
    glow: "from-emerald-500/20 to-teal-500/20"
  },
  {
    title: "Building Voice AI Applications with Groq Whisper",
    excerpt: "A technical guide to implementing real-time speech recognition with sub-100ms latency using our multi-model architecture.",
    date: "May 28, 2026",
    author: "Product Team",
    category: "Tutorials",
    readTime: "10 min read",
    gradient: "from-purple-500/10 to-pink-500/10",
    glow: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "How We Handle 16 API Keys with Automatic Failover",
    excerpt: "Behind the scenes of our intelligent routing system that ensures 99.9% uptime across all providers.",
    date: "May 20, 2026",
    author: "Infrastructure Team",
    category: "Engineering",
    readTime: "6 min read",
    gradient: "from-cyan-500/10 to-blue-500/10",
    glow: "from-cyan-500/20 to-blue-500/20"
  },
  {
    title: "AI in East African FinTech: Case Studies and Opportunities",
    excerpt: "From fraud detection to customer service, see how AI is transforming financial services across Tanzania and East Africa.",
    date: "May 15, 2026",
    author: "Strategy Team",
    category: "Industry",
    readTime: "7 min read",
    gradient: "from-orange-500/10 to-red-500/10",
    glow: "from-orange-500/20 to-red-500/20"
  },
  {
    title: "Getting Started with AI-Powered Customer Service",
    excerpt: "Learn how to implement an AI chatbot that handles customer inquiries 24/7 and integrates with your existing systems.",
    date: "May 8, 2026",
    author: "Solutions Team",
    category: "Tutorials",
    readTime: "9 min read",
    gradient: "from-indigo-500/10 to-purple-500/10",
    glow: "from-indigo-500/20 to-purple-500/20"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
}

export default function BlogPage() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
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
              <Brain className="w-4 h-4" />
              <span>Blog</span>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Latest Insights</span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Thoughts on AI architecture, multi-model systems, and building the future of intelligent applications.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {posts.map((post, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${post.glow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <Card className={`relative bg-gradient-to-br ${post.gradient} border-white/10 hover:border-white/20 transition-all duration-300 h-full card-lift cursor-pointer group`}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-blue-400 bg-blue-500/10 rounded-full px-3 py-1 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-white text-lg leading-tight group-hover:text-blue-300 transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-sm leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-600">{post.date}</span>
                      </div>
                      <motion.span 
                        className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-blue-400 transition-colors"
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                      >
                        Read <ArrowRight className="w-3 h-3" />
                      </motion.span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-white mb-3">Stay Updated</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Get the latest insights on AI, web development, and digital transformation delivered to your inbox.
            </p>
            <div className="flex max-w-md mx-auto gap-3">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/25 whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
    </main>
  )
}