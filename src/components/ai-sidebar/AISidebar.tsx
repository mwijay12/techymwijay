'use client'

import { useEffect, useRef } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConversation } from '@/hooks/use-conversation'
import { ModelSwitcher } from './ModelSwitcher'
import { SidebarMessage } from './SidebarMessage'
import { SidebarInput } from './SidebarInput'
import { SidebarQuickActions } from './SidebarQuickActions'
import { TypingIndicator } from './TypingIndicator'

type Props = {
  isOpen: boolean
  onClose: () => void
  context?: string            // current transcription text
  contextLanguage?: string    // e.g. 'sw-TZ'
}

export function AISidebar({ isOpen, onClose, context, contextLanguage }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    error,
    activeProvider,
    activeModel,
    send,
    quickAction,
    newConversation,
    clearHistory,
    updateContext,
    switchProvider,
    switchModel,
  } = useConversation({ initialContext: context, contextLanguage })

  // Sync context from STT page
  useEffect(() => {
    if (context) updateContext(context, contextLanguage)
  }, [context, contextLanguage, updateContext])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, loading])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-50 flex flex-col bg-zinc-950/95 backdrop-blur-xl border-l border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">AI Assistant</h3>
                  <ModelSwitcher
                    activeProvider={activeProvider}
                    activeModel={activeModel}
                    onProviderChange={switchProvider}
                    onModelChange={switchModel}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={newConversation}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                  title="New conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={clearHistory}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <SidebarQuickActions
              onAction={quickAction}
              disabled={loading}
              hasContext={!!context && context.trim().length > 0}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <p className="text-white/50 text-sm">
                    {context
                      ? 'Ask me anything about your transcription, or use quick actions above.'
                      : 'Start a transcription first, then I can help analyze it.'}
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <SidebarMessage key={msg.id} message={msg} />
              ))}

              {loading && <TypingIndicator provider={activeProvider} />}
              {error && !loading && (
                <div className="px-4">
                  <div className="text-xs text-red-400/70 bg-red-500/5 rounded-lg px-3 py-2">
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <SidebarInput onSend={send} loading={loading} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}