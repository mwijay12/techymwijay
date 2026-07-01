'use client'

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, MessageSquare, Send, Loader2, X, Volume2, Image, StopCircle } from "lucide-react"

interface ChatMessage {
  role: string
  content: string
  type?: 'text' | 'image' | 'audio'
  imageUrl?: string
}

interface ChatComponentProps {
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
}

export default function ChatComponent({ chatOpen, setChatOpen }: ChatComponentProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I'm your Mwijay Tech AI assistant. I can chat, generate images with 'generate image of...' or 'draw...', and speak responses! How can I help you build something amazing?" }
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Listen for custom openChat event from hero buttons
  useEffect(() => {
    const handler = () => setChatOpen(true)
    window.addEventListener('openChat', handler)
    return () => window.removeEventListener('openChat', handler)
  }, [setChatOpen])

  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, m => m.replace(/```\w*\n?|\n?```/g, '').trim())
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+[.)]\s+/gm, '')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/^>\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    synthRef.current = utterance
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const isImageRequest = (text: string): boolean => {
    const imgKeywords = ['generate image', 'generate an image', 'create image', 'draw', 'make an image', 'create an image', 'picture of']
    return imgKeywords.some(kw => text.toLowerCase().includes(kw))
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setChatLoading(true)

    try {
      if (isImageRequest(userMessage)) {
        try {
          const prompt = userMessage
            .replace(/generate image of|generate an image of|create image of|create an image of|draw|make an image of|picture of/gi, '')
            .trim()
          const imageResult = await (window as any).puter.ai.txt2img(prompt || userMessage)
          const imageUrl = imageResult?.url || imageResult?.data?.url || ''
          if (imageUrl) {
            setChatMessages(prev => [...prev, { role: "assistant", content: `Here's an image of ${prompt || userMessage}:`, type: 'image', imageUrl }])
          } else {
            setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't generate that image right now." }])
          }
        } catch {
          setChatMessages(prev => [...prev, { role: "assistant", content: "Image generation is not available at the moment." }])
        }
      } else {
        const response = await (window as any).puter.ai.chat(userMessage, {
          model: 'gpt-4o',
          system: "You are Mwijay Tech's AI assistant. We build websites, integrate AI, design UI/UX, create automation, and offer creative tech solutions. Reply in simple plain text.",
          stream: false,
        })
        let text = typeof response === 'string' ? response : response?.message?.content || response?.toString() || "I'm not sure how to respond."
        text = stripMarkdown(text)
        setChatMessages(prev => [...prev, { role: "assistant", content: text }])
      }
    } catch {
      try {
        const fallbackResponse = await (window as any).puter.ai.chat(userMessage, {
          model: 'gpt-4o-mini',
          system: "You are Mwijay Tech assistant. Answer in plain text.",
          stream: false,
        })
        let text = typeof fallbackResponse === 'string' ? fallbackResponse : fallbackResponse?.message?.content || ''
        text = stripMarkdown(text)
        setChatMessages(prev => [...prev, { role: "assistant", content: text }])
      } catch {
        setChatMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again." }])
      }
    }
    setChatLoading(false)
  }

  return (
    <>
      <motion.button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-blue-500/40 before:to-purple-500/40 before:blur-xl before:animate-pulse"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        animate={{ boxShadow: ["0 0 30px rgba(59,130,246,0.6)", "0 0 60px rgba(147,51,234,0.6)", "0 0 30px rgba(59,130,246,0.6)"] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-label="Open chat assistant"
      >
        <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <MessageSquare className="w-8 h-8 text-white" />
        </motion.div>
      </motion.button>

      {!chatOpen && (
        <motion.div className="fixed bottom-24 right-8 z-50 bg-black/90 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
          <p className="text-white text-sm font-medium whitespace-nowrap">Ask Mwijay AI ✨</p>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-black/90 border-r border-b border-white/10 rotate-45" />
        </motion.div>
      )}

      {chatOpen && (
        <motion.div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-black border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/10 flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Mwijay AI</div>
                <div className="flex items-center gap-1.5">
                  <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button onClick={stopSpeaking} className="text-red-400 hover:text-red-300" aria-label="Stop speaking">
                  <StopCircle className="w-5 h-5" />
                </button>
              ) : null}
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close chat">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <motion.div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {msg.type === 'image' && msg.imageUrl ? (
                  <div className="max-w-[90%]">
                    <div className="bg-white/5 text-gray-200 rounded-2xl rounded-bl-none p-3 mb-1">
                      <p className="text-sm leading-relaxed mb-2">{msg.content}</p>
                    </div>
                    <div className="relative group">
                      <img src={msg.imageUrl} alt="Generated" className="w-full rounded-xl border border-white/10" />
                      <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black/60 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Image className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === "user" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none" : "bg-white/5 text-gray-200 rounded-bl-none"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.role === "assistant" && msg.type !== 'image' && i > 0 && (
                      <button onClick={() => speakText(msg.content)} className="mt-2 text-xs text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1" aria-label="Read aloud">
                        <Volume2 className="w-3 h-3" /> Listen
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl rounded-bl-none p-3">
                  <div className="flex items-center gap-2">
                    <motion.div className="w-2 h-2 rounded-full bg-blue-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-pink-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10 bg-black/50">
            <div className="flex items-center gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat or 'generate image of...'" 
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                disabled={chatLoading} />
              <motion.button type="submit" disabled={chatLoading || !chatInput.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center disabled:opacity-50"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Send message">
                {chatLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
              </motion.button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {["Build me a website", "Generate image of a tech office", "What services do you offer?"].map((suggestion, i) => (
                <button key={i} type="button" onClick={() => setChatInput(suggestion)}
                  className="text-xs text-gray-500 hover:text-gray-300 bg-white/5 px-2 py-1 rounded-full border border-white/5 hover:border-white/20 transition-colors whitespace-nowrap">
                  {suggestion}
                </button>
              ))}
            </div>
          </form>
        </motion.div>
      )}
    </>
  )
}