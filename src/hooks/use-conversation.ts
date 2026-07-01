'use client'

import { useState, useCallback, useEffect } from 'react'
import { aiChat, type AIEngineOptions } from '@/lib/ai-engine'
import type { AIMessage } from '@/lib/providers/index'
import {
  createConversation,
  addMessage,
  loadConversations,
  deleteConversation,
  updateConversationContext,
  type Conversation,
  type SidebarMessage,
} from '@/lib/conversation-store'
import { useAppSettings } from '@/hooks/use-app-settings'
import { useAuth } from '@/contexts/AuthContext'
import { syncConversations } from '@/lib/sync-engine'

type UseConversationOptions = {
  initialContext?: string
  contextLanguage?: string
}

export function useConversation(options?: UseConversationOptions) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { settings } = useAppSettings()
  const { user } = useAuth()

  // Track current provider/model for display
  const [activeProvider, setActiveProvider] = useState<string>(
    settings?.ai?.defaultProvider ?? 'puter'
  )
  const [activeModel, setActiveModel] = useState<string>(
    settings?.ai?.defaultModel ?? 'gpt-4o-mini'
  )

  // Initialize or load most recent conversation
  useEffect(() => {
    const existing = loadConversations()
    if (existing.length > 0) {
      setConversation(existing[0])
    } else {
      const newConv = createConversation(
        options?.initialContext,
        options?.contextLanguage
      )
      setConversation(newConv)
    }
  }, [])

  // Update context when transcription changes
  const updateContext = useCallback(
    (context: string, language?: string) => {
      if (!conversation) return
      updateConversationContext(conversation.id, context, language)
      setConversation((prev) =>
        prev ? { ...prev, context, contextLanguage: language ?? prev.contextLanguage } : null
      )
    },
    [conversation?.id]
  )

  // The critical part — building the AI message array with context
  const buildMessages = useCallback(
    (userMessage: string): AIMessage[] => {
      if (!conversation) return [{ role: 'user', content: userMessage }]

      const messages: AIMessage[] = []

      // System prompt with context injection
      let systemPrompt = `You are a helpful AI assistant inside Mwijay AI Voice Studio — a voice productivity tool. You help with transcriptions, translations, and text analysis. Be concise and practical.`

      if (conversation.context) {
        systemPrompt += `\n\nThe user is currently working with this transcription:\n"""${conversation.context}"""\n\nRefer to this context when relevant to the user's questions.`
        if (conversation.contextLanguage) {
          systemPrompt += `\nThe transcription language is: ${conversation.contextLanguage}`
        }
      }

      messages.push({ role: 'system', content: systemPrompt })

      // Add conversation history (last 20 messages max for token efficiency)
      const recentMessages = conversation.messages.slice(-20)
      recentMessages.forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      })

      // Add current message
      messages.push({ role: 'user', content: userMessage })

      return messages
    },
    [conversation]
  )

  const send = useCallback(
    async (userMessage: string) => {
      if (!conversation || !userMessage.trim()) return

      setError(null)
      setLoading(true)

      // Save user message
      const userMsg = addMessage(conversation.id, { role: 'user', content: userMessage })
      // Sync to Firestore
      syncConversations.addMessage(user?.uid ?? null, conversation.id, userMsg)
      setConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `temp_${Date.now()}`,
              role: 'user' as const,
              content: userMessage,
              timestamp: Date.now(),
            },
          ],
        }
      })

      try {
        const messages = buildMessages(userMessage)
        const engineOptions: AIEngineOptions = {
          model: activeModel,
          forceProvider: activeProvider !== 'auto' ? activeProvider : undefined,
        }

        const result = await aiChat(messages, engineOptions)

        // Save assistant response
        const saved = addMessage(conversation.id, {
          role: 'assistant',
          content: result.text,
          provider: result.provider,
          model: result.model,
          latencyMs: result.latencyMs,
        })

        // Sync assistant response to Firestore
        syncConversations.addMessage(user?.uid ?? null, conversation.id, saved)

        setConversation((prev) => {
          if (!prev) return null
          return { ...prev, messages: [...prev.messages, saved] }
        })
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'AI request failed'
        setError(errMsg)

        const saved = addMessage(conversation.id, {
          role: 'assistant',
          content: errMsg,
          isError: true,
        })

        syncConversations.addMessage(user?.uid ?? null, conversation.id, saved)

        setConversation((prev) => {
          if (!prev) return null
          return { ...prev, messages: [...prev.messages, saved] }
        })
      } finally {
        setLoading(false)
      }
    },
    [conversation, buildMessages, activeProvider, activeModel, user?.uid]
  )

  // Quick actions
  const quickAction = useCallback(
    async (actionType: string) => {
      if (!conversation?.context) return

      const prompts: Record<string, string> = {
        summarize: `Summarize this transcription concisely:\n\n${conversation.context}`,
        grammar: `Fix the grammar and improve clarity of this text. Show the corrected version:\n\n${conversation.context}`,
        keywords: `Extract the key topics, names, and important terms from this text. List them clearly:\n\n${conversation.context}`,
        translate: `Translate this to ${conversation.contextLanguage?.startsWith('sw') ? 'English' : 'Kiswahili'}:\n\n${conversation.context}`,
        explain: `Explain what this text is about in simple terms:\n\n${conversation.context}`,
        action_items: `Extract any action items, tasks, or decisions from this text:\n\n${conversation.context}`,
      }

      const prompt = prompts[actionType]
      if (!prompt) return

      // Tag the user message as a quick action
      addMessage(conversation.id, {
        role: 'user',
        content: prompt,
        isQuickAction: true,
        actionType,
      })

      // Optimistically add to UI
      setConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `temp_qa_${Date.now()}`,
              role: 'user' as const,
              content: prompt,
              timestamp: Date.now(),
              isQuickAction: true,
              actionType,
            },
          ],
        }
      })

      // Now trigger the actual AI call
      setError(null)
      setLoading(true)
      try {
        const messages = buildMessages(prompt)
        const engineOptions: AIEngineOptions = {
          model: activeModel,
          forceProvider: activeProvider !== 'auto' ? activeProvider : undefined,
        }

        const result = await aiChat(messages, engineOptions)

        const saved = addMessage(conversation.id, {
          role: 'assistant',
          content: result.text,
          provider: result.provider,
          model: result.model,
          latencyMs: result.latencyMs,
        })

        setConversation((prev) => {
          if (!prev) return null
          return { ...prev, messages: [...prev.messages, saved] }
        })
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'AI request failed'
        setError(errMsg)
        const saved = addMessage(conversation.id, {
          role: 'assistant',
          content: errMsg,
          isError: true,
        })
        setConversation((prev) => {
          if (!prev) return null
          return { ...prev, messages: [...prev.messages, saved] }
        })
      } finally {
        setLoading(false)
      }
    },
    [conversation, buildMessages, activeProvider, activeModel]
  )

  const newConversation = useCallback(() => {
    const conv = createConversation(
      conversation?.context,
      conversation?.contextLanguage
    )
    setConversation(conv)
  }, [conversation?.context, conversation?.contextLanguage])

  const clearHistory = useCallback(() => {
    if (!conversation) return
    deleteConversation(conversation.id)
    newConversation()
  }, [conversation, newConversation])

  const switchProvider = useCallback((provider: string) => {
    setActiveProvider(provider)
  }, [])

  const switchModel = useCallback((model: string) => {
    setActiveModel(model)
  }, [])

  return {
    conversation,
    messages: conversation?.messages ?? [],
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
    clearError: () => setError(null),
  }
}