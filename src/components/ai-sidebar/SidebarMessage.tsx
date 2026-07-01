'use client'

import { useState } from 'react'
import { Copy, Check, AlertCircle, Zap, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { SidebarMessage as MessageType } from '@/lib/conversation-store'

type Props = {
  message: MessageType
}

export function SidebarMessage({ message }: Props) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.isError

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Quick action messages show differently — compact label instead of full prompt
  const displayContent = message.isQuickAction && message.role === 'user'
    ? `📋 ${message.actionType?.replace('_', ' ').toUpperCase()}`
    : message.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-1`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative ${
          isUser
            ? 'bg-purple-500/20 text-white/90 rounded-br-md'
            : isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-md'
              : 'bg-white/5 text-white/80 rounded-bl-md'
        }`}
      >
        {/* Quick action badge */}
        {message.isQuickAction && isUser && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-medium mb-1">
            Quick Action
          </span>
        )}

        {/* Error icon */}
        {isError && (
          <div className="flex items-center gap-1.5 mb-1 text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Error</span>
          </div>
        )}

        {/* Content — preserve whitespace for code/formatted text */}
        <div className="whitespace-pre-wrap break-words">{displayContent}</div>

        {/* Metadata footer for assistant messages */}
        {!isUser && !isError && (
          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/5">
            {message.provider && (
              <span className="text-[10px] text-white/30 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                {message.provider}{message.model ? ` · ${message.model}` : ''}
              </span>
            )}
            {message.latencyMs && (
              <span className="text-[10px] text-white/20 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {message.latencyMs}ms
              </span>
            )}
          </div>
        )}

        {/* Copy button — appears on hover */}
        {!isError && (
          <button
            onClick={handleCopy}
            className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-zinc-800 border border-white/10 hover:border-white/20"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-white/50" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}