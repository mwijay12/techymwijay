'use client'

import { useState, useEffect, useRef } from "react"
import { SplineSceneBasic } from "@/components/demo/spline-scene-basic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveSpotlight } from "@/components/ui/interactive-spotlight"
import { 
  Brain, Cpu, Sparkles, ArrowRight, ChevronRight, Globe, Zap, Shield, 
  Users, MessageSquare, Mic, Layers, Workflow, Key, Code2, Smartphone, 
  Bot, Palette, Heart, Star, Rocket, CheckCircle, TrendingUp, Phone
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Navigation from "@/components/layout/Navigation"
import Footer from "@/components/layout/Footer"
import ChatComponent from "@/components/layout/ChatComponent"

// CountUp animation component with enhanced styling
function CountUp({ end, duration = 2, suffix = "", prefix = "" }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          let start = 0
          const increment = end / (duration * 60)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <div ref={ref} className="text-center">
      <motion.span 
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        {prefix}{count}{suffix}
      </motion.span>
    </div>
  )
}

// Animated section wrapper with scrollytelling
function SectionWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section 
      className={className}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.section>
  )
}

// Floating particles background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  const features = [
    {
      icon: <Code2 className="w-10 h-10 text-blue-400" />,
      title: "Web Development",
      description: "Stunning, responsive websites built with modern frameworks. From landing pages to full-scale web applications.",
      gradient: "from-blue-500/10 to-purple-500/10",
      glow: "blue-500"
    },
    {
      icon: <Bot className="w-10 h-10 text-emerald-400" />,
      title: "AI Integration",
      description: "Supercharge your business with AI chatbots, automation, and intelligent systems powered by GPT-4o and Gemini.",
      gradient: "from-emerald-500/10 to-teal-500/10",
      glow: "emerald-500"
    },
    {
      icon: <Smartphone className="w-10 h-10 text-purple-400" />,
      title: "UI/UX Design",
      description: "Beautiful, intuitive interfaces that users love. Pixel-perfect designs with user-centered approach.",
      gradient: "from-purple-500/10 to-pink-500/10",
      glow: "purple-500"
    },
    {
      icon: <Zap className="w-10 h-10 text-cyan-400" />,
      title: "Automation",
      description: "Streamline your operations with smart automation. Save time and reduce manual work with custom solutions.",
      gradient: "from-cyan-500/10 to-blue-500/10",
      glow: "cyan-500"
    },
    {
      icon: <Workflow className="w-10 h-10 text-orange-400" />,
      title: "Creative Tech",
      description: "Interactive 3D experiences, animations, and cutting-edge web technologies to make your brand stand out.",
      gradient: "from-orange-500/10 to-red-500/10",
      glow: "orange-500"
    },
    {
      icon: <Globe className="w-10 h-10 text-indigo-400" />,
      title: "Digital Strategy",
      description: "End-to-end digital transformation. From planning to deployment, we help you succeed online.",
      gradient: "from-indigo-500/10 to-purple-500/10",
      glow: "indigo-500"
    }
  ]

  const testimonials = [
    {
      quote: "Mwijay Tech built our e-commerce site and integrated an AI chatbot. Our sales increased by 300% in just 3 months!",
      author: "Sarah J.",
      role: "CEO, Dar es Salaam Retail",
      initials: "SJ"
    },
    {
      quote: "The automation system they built saved us 50% on operational costs. Absolutely transformative for our logistics company.",
      author: "James M.",
      role: "Operations Director, Mwanza Logistics",
      initials: "JM"
    },
    {
      quote: "Professional, creative, and incredibly responsive. Our website is now the best in our industry. Highly recommended!",
      author: "Esther K.",
      role: "Founder, Arusha Tech Hub",
      initials: "EK"
    }
  ]

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <Navigation onOpenChat={() => setChatOpen(true)} />

      {/* Hero with 3D Spline Scene */}
      <motion.section 
        className="relative h-screen w-full"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <SplineSceneBasic />
      </motion.section>

      {/* Stats with CountUp */}
      <SectionWrapper className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-sm relative">
        <FloatingParticles />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 50, suffix: "+", label: "Projects Delivered", icon: <Code2 className="w-5 h-5 text-blue-400" />, desc: "Websites & apps built" },
              { value: 24, suffix: "/7", label: "Client Support", icon: <Shield className="w-5 h-5 text-green-400" />, desc: "Always available" },
              { value: 100, suffix: "%", label: "Satisfaction", icon: <Users className="w-5 h-5 text-purple-400" />, desc: "Client happiness" },
              { value: 3, suffix: "+", label: "Years Experience", icon: <Zap className="w-5 h-5 text-yellow-400" />, desc: "In tech industry" }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                className="text-center group p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                    {stat.icon}
                  </div>
                </div>
                <CountUp end={stat.value} suffix={stat.suffix} />
                <div className="text-white font-semibold mb-1 mt-2">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Services */}
      <SectionWrapper className="py-24 px-4 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent relative">
        <FloatingParticles />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>What We Do</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-animate">Creative Tech Solutions</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We build websites, integrate AI, design beautiful interfaces, and automate your business. 
              Everything you need to thrive in the digital world.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <Card className={`relative bg-gradient-to-br ${feature.gradient} border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-full overflow-hidden card-lift`}>
                  <CardHeader>
                    <motion.div 
                      className="mb-4 p-3 w-fit rounded-xl bg-white/5 group-hover:bg-white/10 transition-all" 
                      whileHover={{ rotate: [0, -10, 10, 0] }} 
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-base leading-relaxed">{feature.description}</CardDescription>
                    <motion.div 
                      className="mt-6 flex items-center gap-2 text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
                      initial={{ x: -10 }}
                      whileHover={{ x: 5 }}
                    >
                      <span>Learn more</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* About Mwijay Tech */}
      <SectionWrapper className="py-24 px-4 bg-black/50 relative">
        <FloatingParticles />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-400 mb-4">
                <Code2 className="w-4 h-4" />
                <span>About Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Crafting Digital </span>
                <span className="text-white">Experiences</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                At Mwijay Tech, we believe technology should be beautiful, functional, and accessible. 
                We combine creative design with powerful AI to build websites and applications that 
                make a real impact.
              </p>
              <div className="flex flex-col gap-4">
                <motion.div 
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all gradient-border cursor-default"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Code2 className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Davie Mwijay</h4>
                    <p className="text-gray-500 text-sm">Founder & Lead Developer</p>
                  </div>
                  <div className="ml-auto text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">+255 790 942 616</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <Card className="relative bg-black/80 backdrop-blur-sm border border-white/10 p-8 gradient-border">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm">
                    <motion.div className="w-3 h-3 rounded-full bg-red-500" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-500 ml-2 font-mono text-xs">mwijaytech.com</span>
                    <motion.div 
                      className="ml-auto w-2 h-2 rounded-full bg-green-400"
                      animate={{ scale: [1, 1.3, 1] }} 
                      transition={{ duration: 1, repeat: Infinity }} 
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                      <span className="text-blue-400 font-mono text-sm">mwijay.davie@digital</span>
                    </div>
                    <pre className="text-sm text-gray-400 font-mono leading-relaxed bg-white/5 p-4 rounded-xl overflow-x-auto border border-white/5">
                      <code>{`{
  "vision": "Make tech accessible",
  "mission": "Build stunning digital solutions",
  "values": [
    "Creativity",
    "Quality",
    "Innovation",
    "Client-first"
  ],
  "founder": "Davie Mwijay",
  "contact": "+255 790 942 616"
}`}</code>
                    </pre>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 text-xs font-mono">Available for projects</span>
                      </div>
                      <span className="text-gray-600 text-xs font-mono">mwijaydavie@gmail.com</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Testimonials */}
      <SectionWrapper className="py-24 px-4 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent relative">
        <FloatingParticles />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-400 mb-4">
              <Star className="w-4 h-4" />
              <span>Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">What Our Clients Say</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300 card-lift">
                  <CardHeader>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <CardDescription className="text-gray-300 text-sm leading-relaxed italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold">
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{testimonial.author}</div>
                        <div className="text-gray-500 text-xs">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper className="py-24 px-4 relative overflow-hidden">
        <InteractiveSpotlight className="from-blue-500/10 via-purple-500/10 to-transparent" size={500} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-4">
              <Rocket className="w-4 h-4" />
              <span>Let's Build Together</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Ready to Start Your Project?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              From a simple website to a full AI-powered platform. Let's bring your vision to life.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <motion.button 
                onClick={() => setChatOpen(true)} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 shadow-xl shadow-blue-500/25 flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Chat With Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <a href="tel:+255790942616">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call +255 790 942 616
                </motion.button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /><span>Quality guaranteed</span></div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /><span>Fast delivery</span></div>
              <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-red-400" /><span>Client-focused</span></div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      <Footer />
      <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
    </main>
  )
}