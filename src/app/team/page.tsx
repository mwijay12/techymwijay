'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Sparkles, Globe, Code2, Zap, Shield, Users, Star, Mail, MapPin } from "lucide-react"
import Navigation from "@/components/layout/Navigation"
import Footer from "@/components/layout/Footer"
import ChatComponent from "@/components/layout/ChatComponent"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const teamMembers = [
  {
    name: "Davie Mwijay",
    role: "Founder & Lead Developer",
    bio: "Creative technologist passionate about web development, AI integration, and building stunning digital experiences. Founder of Mwijay Tech.",
    initials: "DM",
    gradient: "from-blue-600 to-purple-600"
  },
  {
    name: "Sarah Mwangi",
    role: "UI/UX Designer",
    bio: "Talented designer creating beautiful, intuitive interfaces. Specializes in user-centered design and brand identity.",
    initials: "SM",
    gradient: "from-emerald-600 to-teal-600"
  },
  {
    name: "James Kiprop",
    role: "Frontend Developer",
    bio: "Skilled frontend developer with expertise in React, Next.js, and modern web frameworks. Builds pixel-perfect responsive sites.",
    initials: "JK",
    gradient: "from-purple-600 to-pink-600"
  },
  {
    name: "Grace Omondi",
    role: "Backend Developer",
    bio: "Backend specialist handling APIs, databases, and server infrastructure. Ensures everything runs smoothly.",
    initials: "GO",
    gradient: "from-cyan-600 to-blue-600"
  },
  {
    name: "Peter Msafiri",
    role: "AI & Automation Specialist",
    bio: "Expert in AI integration, chatbots, and process automation. Powers our intelligent solutions.",
    initials: "PM",
    gradient: "from-orange-600 to-red-600"
  },
  {
    name: "Diana Shoo",
    role: "Project Manager",
    bio: "Keeps projects on track, communicates with clients, and ensures timely delivery of quality work.",
    initials: "DS",
    gradient: "from-indigo-600 to-purple-600"
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

export default function TeamPage() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
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
              <Users className="w-4 h-4" />
              <span>Our Team</span>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Meet the Team</span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Passionate engineers, designers, and innovators crafting digital solutions 
              for businesses across Tanzania.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {teamMembers.map((member, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />
                <Card className="relative bg-black/50 border-white/10 hover:border-white/20 transition-all duration-300 h-full card-lift backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <motion.div 
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-4 mx-auto shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-2xl font-bold text-white">{member.initials}</span>
                    </motion.div>
                    <CardTitle className="text-white text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-blue-400 text-sm font-medium">{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm text-center leading-relaxed">{member.bio}</p>
                    <div className="flex justify-center gap-3 mt-6">
                      <div className="p-2 rounded-full bg-white/5 hover:bg-blue-500/10 transition-colors cursor-pointer">
                        <Mail className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="p-2 rounded-full bg-white/5 hover:bg-green-500/10 transition-colors cursor-pointer">
                        <MapPin className="w-4 h-4 text-gray-400 hover:text-green-400 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Based in Dar es Salaam, serving clients across East Africa</span>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
    </main>
  )
}