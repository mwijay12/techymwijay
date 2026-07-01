'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Mic, Code2, Bot, Key, Workflow, Globe, Zap, Shield, Users, ArrowRight, Check, Smartphone, Star, TrendingUp, Sparkles } from "lucide-react"
import Navigation from "@/components/layout/Navigation"
import Footer from "@/components/layout/Footer"
import ChatComponent from "@/components/layout/ChatComponent"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    icon: <Code2 className="w-6 h-6" />,
    title: "Web Development",
    description: "Custom websites and web applications built with modern frameworks. Responsive, fast, and optimized for performance.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    color: "text-blue-400",
    features: ["Next.js & React", "Tailwind CSS", "Responsive Design", "SEO Optimized"]
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Integration",
    description: "Integrate AI capabilities into your workflow. From chatbots to voice assistants, we make AI work for you.",
    gradient: "from-purple-500/10 to-pink-500/10",
    color: "text-purple-400",
    features: ["ChatGPT Integration", "Voice AI", "Automation", "Custom Models"]
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Voice Solutions",
    description: "Speech-to-text, text-to-speech, and voice automation for Swahili and English. Built for African languages.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    color: "text-emerald-400",
    features: ["STT & TTS", "Kiswahili Support", "Real-time Translation", "Meeting Transcription"]
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Chatbots",
    description: "Intelligent chatbots for customer support, lead generation, and internal tools. Powered by GPT-4o and more.",
    gradient: "from-orange-500/10 to-amber-500/10",
    color: "text-orange-400",
    features: ["24/7 Support", "Multi-language", "Custom Training", "Analytics"]
  },
  {
    icon: <Workflow className="w-6 h-6" />,
    title: "Process Automation",
    description: "Automate repetitive tasks and workflows. Save time and reduce errors with intelligent automation.",
    gradient: "from-rose-500/10 to-red-500/10",
    color: "text-rose-400",
    features: ["Workflow Design", "API Integration", "Data Processing", "Scheduling"]
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Digital Transformation",
    description: "End-to-end digital transformation consulting. From strategy to execution, we help you go digital.",
    gradient: "from-indigo-500/10 to-violet-500/10",
    color: "text-indigo-400",
    features: ["Strategy", "Cloud Migration", "Security Audit", "Training"]
  }
]

const plans = [
  {
    name: "Starter",
    price: "TSh 350,000",
    period: "one-time",
    description: "Perfect for small businesses getting online",
    features: [
      "5-page responsive website",
      "Basic SEO setup",
      "Mobile optimized",
      "Contact form integration",
      "1 month support",
      "Custom domain setup"
    ],
    cta: "Get Started",
    popular: false,
    icon: <Smartphone className="w-6 h-6" />
  },
  {
    name: "Business",
    price: "TSh 850,000",
    period: "one-time",
    description: "For growing businesses that need more",
    features: [
      "10-page responsive website",
      "Advanced SEO & analytics",
      "AI chatbot integration",
      "E-commerce ready",
      "3 months support",
      "Custom admin dashboard",
      "Social media integration",
      "Performance optimization"
    ],
    cta: "Most Popular",
    popular: true,
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "project-based",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited pages",
      "Custom web applications",
      "AI & voice integration",
      "Team training & support",
      "6 months support",
      "Dedicated project manager",
      "Custom API development",
      "Priority 24/7 support",
      "SLA guarantee"
    ],
    cta: "Contact Us",
    popular: false,
    icon: <Star className="w-6 h-6" />
  }
]

export default function ServicesPage() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navigation onOpenChat={() => setChatOpen(true)} />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              What We Offer
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Services &{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              From web development to AI integration — we build solutions that work for African businesses and creators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full group hover:border-white/20 transition-all duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-3 ${service.color}`}>
                      {service.icon}
                    </div>
                    <CardTitle className="text-white text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-gray-400 text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose a plan that fits your needs. All plans include our core services and support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                  plan.popular
                    ? 'border-purple-500/30 bg-purple-500/5 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500">{plan.description}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500 ml-1">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent border border-purple-500/20 p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Build Something?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Let's talk about your project. We'll help you choose the right solution.
              </p>
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatComponent chatOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}