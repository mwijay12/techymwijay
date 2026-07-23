'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  ChevronDown,
} from 'lucide-react'
import { format } from 'date-fns'
import { useChat } from '@/hooks/use-chat'
import { useAuth } from '@/components/auth/AuthProvider'
import { useVault } from '@/hooks/use-vault'
import { useTodos } from '@/hooks/use-todos'
import { useSpending } from '@/hooks/use-spending'
import { ReadAloudButton } from '@/components/tts/ReadAloudButton'
import { cn } from '@/lib/utils'
import type { AIMessage } from '@/types/ai'

const SUGGESTED_PROMPTS = [
  {
    label: '📝 My active tasks',
    prompt: 'What are my current active tasks? Which should I focus on first?',
  },
  {
    label: '💰 Spending review',
    prompt: 'How much have I spent this month and where is my money going?',
  },
  {
    label: '🔑 Code help',
    prompt: 'Help me debug a TypeScript/React issue I am working on.',
  },
  {
    label: '🇹🇿 Kiswahili',
    prompt: 'Nisaidie kuandika barua pepe rasmi kwa Kiswahili.',
  },
  {
    label: '🎯 Plan my day',
    prompt: 'Based on my todos, help me plan today efficiently.',
  },
  {
    label: '🔐 Security tips',
    prompt: 'What are best practices for API key management as a developer?',
  },
]

const PROVIDER_COLORS: Record<string, string> = {
  openrouter: 'text-purple-400',
  groq: 'text-amber-400',
  huggingface: 'text-yellow-400',
  puter: 'text-emerald-400',
  cerebras: 'text-pink-400',
}

function renderMarkdownLite(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const result: React.ReactNode[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let codeKey = 0

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        result.push(
          <pre
            key={`code-${codeKey++}`}
            className="bg-black/60 rounded-xl p-3 text-xs font-mono text-emerald-400 overflow-x-auto my-2 border border-white/10"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeLines.push(line)
      return
    }

    const boldProcessed = line.replace(
      /\*\*(.+?)\*\*/g,
      (_, match) => `<strong>${match}</strong>`
    )

    const codeProcessed = boldProcessed.replace(
      /`(.+?)`/g,
      (_, match) =>
        `<code class="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 text-[10px] font-mono">${match}</code>`
    )

    if (line.startsWith('- ') || line.startsWith('• ')) {
      result.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
          <span
            className="text-xs text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: codeProcessed.slice(2),
            }}
          />
        </div>
      )
      return
    }

    const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numberedMatch) {
      result.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-purple-400 text-xs font-bold flex-shrink-0 mt-0.5 min-w-[16px]">
            {numberedMatch[1]}.
          </span>
          <span
            className="text-xs text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: codeProcessed.slice(numberedMatch[1].length + 2),
            }}
          />
        </div>
      )
      return
    }

    if (line.startsWith('### ')) {
      result.push(
        <p key={i} className="text-sm font-bold text-white mt-3 mb-1">
          {line.slice(4)}
        </p>
      )
      return
    }
    if (line.startsWith('## ')) {
      result.push(
        <p key={i} className="text-sm font-bold text-purple-300 mt-3 mb-1">
          {line.slice(3)}
        </p>
      )
      return
    }

    if (!line.trim()) {
      result.push(<div key={i} className="h-2" />)
      return
    }

    result.push(
      <p
        key={i}
        className="text-xs text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: codeProcessed }}
      />
    )
  })

  return result
}

function MessageBubble({ message }: { message: AIMessage }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group flex gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5',
          isUser
            ? 'bg-purple-600'
            : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
        )}
      >
        {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
      </div>

      <div
        className={cn(
          'flex-1 max-w-[85%] space-y-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-3 py-2.5 rounded-2xl',
            isUser
              ? 'bg-purple-600 text-white rounded-tr-sm'
              : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="text-xs leading-relaxed">{message.content}</p>
          ) : (
            <div className="space-y-1">
              {renderMarkdownLite(message.content)}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-2 px-1',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className="text-[9px] text-gray-500 font-mono">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>

          {isAssistant && message.provider && (
            <span
              className={cn(
                'text-[9px] font-semibold font-mono',
                PROVIDER_COLORS[message.provider] ?? 'text-gray-400'
              )}
            >
              <Zap className="w-2 h-2 inline mr-0.5" />
              {message.provider}
            </span>
          )}

          <div
            className={cn(
              'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150'
            )}
          >
            <button
              onClick={handleCopy}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>

            {isAssistant && (
              <ReadAloudButton text={message.content} size="sm" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-2.5"
    >
      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <Bot className="w-3 h-3 text-white" />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ContextIndicator({
  hasVault,
  hasTodos,
  hasSpending,
}: {
  hasVault: boolean
  hasTodos: boolean
  hasSpending: boolean
}) {
  const items = [
    hasVault && '🔐 Vault',
    hasTodos && '✅ Todos',
    hasSpending && '💰 Spending',
  ].filter(Boolean)

  if (items.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/10 bg-purple-500/5">
      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
      <span className="text-[10px] text-purple-300">
        Context active: {items.join(' · ')}
      </span>
    </div>
  )
}

export interface ChatComponentProps {
  chatOpen?: boolean
  setChatOpen?: (open: boolean) => void
  onClose?: () => void
}

export function ChatComponent({ chatOpen, setChatOpen, onClose }: ChatComponentProps = {}) {
  const { user } = useAuth()
  const chat = useChat()

  useEffect(() => {
    if (chatOpen !== undefined) {
      chat.setIsOpen(chatOpen)
    }
  }, [chatOpen, chat])

  const handleClose = () => {
    chat.setIsOpen(false)
    if (setChatOpen) setChatOpen(false)
    if (onClose) onClose()
  }

  const { items: vaultItems } = useVault()
  const { todos } = useTodos()
  const { summary, currency } = useSpending()

  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const chatContext = useMemo(
    () => ({
      vaultItems: vaultItems.slice(0, 5).map(v => ({
        title: v.title,
        category: v.category,
      })),
      activeTodos: todos
        .filter(t => t.status !== 'done' && t.status !== 'cancelled')
        .slice(0, 5)
        .map(t => ({ title: t.title, priority: t.priority })),
      monthlySpending: summary.totalAmount,
      currency,
    }),
    [vaultItems, todos, summary.totalAmount, currency]
  )

  const hasContext =
    chatContext.vaultItems.length > 0 ||
    chatContext.activeTodos.length > 0 ||
    chatContext.monthlySpending > 0

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        chat.setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape' && chat.isOpen) {
        chat.setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [chat.isOpen, chat.setIsOpen])

  useEffect(() => {
    if (chat.isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [chat.messages, chat.isLoading, chat.isOpen])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    setShowScrollButton(distanceFromBottom > 100)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (chat.isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [chat.isOpen])

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || chat.isLoading) return
    const msg = inputValue.trim()
    setInputValue('')
    chat.sendMessage(msg, hasContext ? chatContext : undefined)
  }, [inputValue, chat, hasContext, chatContext])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) return null

  return (
    <>
      <AnimatePresence>
        {!chat.isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => chat.setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/40 hover:scale-105 transition-transform"
            title="Open AI Chat (Ctrl+K)"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            {chat.messages.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-black flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">
                  {Math.min(chat.messages.length, 9)}
                </span>
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chat.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
              onClick={() => chat.setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className={cn(
                'fixed z-50 bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden',
                'inset-x-3 bottom-3 top-20',
                'sm:inset-auto sm:right-6 sm:bottom-6',
                isExpanded
                  ? 'sm:w-[480px] sm:h-[680px]'
                  : 'sm:w-[360px] sm:h-[520px]',
                'sm:rounded-3xl rounded-2xl transition-[width,height] duration-300'
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0 bg-white/5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">Mwijay AI</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {chat.lastProvider
                      ? `via ${chat.lastProvider}`
                      : 'OpenRouter → Groq → Puter.js'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all hidden sm:flex"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {chat.messages.length > 0 && (
                    <button
                      onClick={chat.clearConversation}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Clear conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <ContextIndicator
                hasVault={chatContext.vaultItems.length > 0}
                hasTodos={chatContext.activeTodos.length > 0}
                hasSpending={chatContext.monthlySpending > 0}
              />

              {chat.error && (
                <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between gap-2">
                  <p className="text-xs text-red-400 flex-1">{chat.error}</p>
                  <button
                    onClick={chat.clearError}
                    className="text-red-400 hover:text-red-300 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
              >
                {chat.messages.length === 0 && !chat.isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xl">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">
                        Habari, {user.displayName?.split(' ')[0]}!
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                        Mimi ni Mwijay AI. Ninaweza kukusaidia na kazi yako, code, matumizi, na zaidi. What can I help with?
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      {SUGGESTED_PROMPTS.map(sp => (
                        <button
                          key={sp.label}
                          onClick={() => {
                            setInputValue(sp.prompt)
                            inputRef.current?.focus()
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-150"
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {chat.messages.map(message => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {chat.isLoading && <TypingIndicator />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              <AnimatePresence>
                {showScrollButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-20 right-4 w-8 h-8 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white shadow-lg z-10"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="px-3 py-3 border-t border-white/10 flex-shrink-0 bg-white/5">
                <div className="flex items-end gap-2 bg-black/60 rounded-2xl border border-white/10 px-3 py-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all duration-200">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Uliza swali... (Enter to send)"
                    rows={1}
                    disabled={chat.isLoading}
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-gray-500 resize-none focus:outline-none max-h-32 overflow-y-auto disabled:opacity-50 leading-relaxed font-sans"
                    style={{
                      height: 'auto',
                      minHeight: '20px',
                    }}
                    onInput={e => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                    }}
                  />

                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || chat.isLoading}
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150',
                      inputValue.trim() && !chat.isLoading
                        ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-md'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[9px] text-gray-500 text-center mt-1.5 font-mono">
                  Enter to send · Shift+Enter for newline · Ctrl+K to toggle
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatComponent