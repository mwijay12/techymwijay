'use client'

import {
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAppSettings } from '@/hooks/use-app-settings'
import {
  loadChatFromStorage,
  saveChatToStorage,
  clearChatStorage,
  saveMessageToFirestore,
  loadChatFromFirestore,
  clearChatFromFirestore,
} from '@/lib/chat-service'
import type { AIMessage, AIProvider } from '@/types/ai'

export interface ChatContext {
  vaultItems?: Array<{ title: string; category: string }>
  activeTodos?: Array<{ title: string; priority: string }>
  monthlySpending?: number
  currency?: string
}

export interface UseChatReturn {
  messages: AIMessage[]
  isLoading: boolean
  isOpen: boolean
  error: string | null
  lastProvider: AIProvider | null

  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  sendMessage: (content: string, context?: ChatContext) => Promise<void>
  clearConversation: () => Promise<void>
  clearError: () => void
}

function buildContextString(context?: ChatContext): string {
  if (!context) return ''

  const parts: string[] = ['Current context:']

  if (context.activeTodos?.length) {
    const todoList = context.activeTodos
      .slice(0, 5)
      .map(t => `  - [${t.priority.toUpperCase()}] ${t.title}`)
      .join('\n')
    parts.push(`Active todos:\n${todoList}`)
  }

  if (context.monthlySpending !== undefined) {
    const currency = context.currency ?? 'TZS'
    parts.push(
      `This month's spending: ${currency} ${context.monthlySpending.toLocaleString()}`
    )
  }

  if (context.vaultItems?.length) {
    const vaultList = context.vaultItems
      .slice(0, 5)
      .map(v => `  - ${v.title} (${v.category})`)
      .join('\n')
    parts.push(`Recent vault items:\n${vaultList}`)
  }

  return parts.length > 1 ? `\n\n${parts.join('\n')}` : ''
}

async function callPuterJS(prompt: string): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).puter?.ai) {
    throw new Error('Puter.js not available')
  }
  const response = await (window as any).puter.ai.chat(prompt, {
    model: 'gpt-4o-mini',
  })
  return typeof response === 'string' ? response : response?.toString?.() ?? String(response)
}

export function useChat(): UseChatReturn {
  const { user } = useAuth()
  const { settings } = useAppSettings()

  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpenState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastProvider, setLastProvider] = useState<AIProvider | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const setIsOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenState(open)
  }, [])

  useEffect(() => {
    if (!user?.uid || isInitialized) return

    const local = loadChatFromStorage(user.uid)
    if (local.length > 0) {
      setMessages(local)
    }

    if (navigator.onLine) {
      loadChatFromFirestore(user.uid)
        .then(firestoreMessages => {
          if (firestoreMessages.length > 0) {
            setMessages(firestoreMessages)
            saveChatToStorage(user.uid, firestoreMessages)
          }
        })
        .catch(() => {})
    }

    setIsInitialized(true)
  }, [user?.uid, isInitialized])

  const sendMessage = useCallback(
    async (content: string, context?: ChatContext) => {
      if (!content.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      const userMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      if (user?.uid) {
        saveChatToStorage(user.uid, updatedMessages)
        saveMessageToFirestore(user.uid, userMessage).catch(() => {})
      }

      try {
        const contextStr = buildContextString(context)
        const recentMessages = updatedMessages.slice(-10)

        const messagesForAPI = contextStr
          ? recentMessages.map((m, i) =>
              i === recentMessages.length - 1 && m.role === 'user'
                ? { ...m, content: m.content + contextStr }
                : m
            )
          : recentMessages

        let aiContent = ''
        let provider: AIProvider = 'openrouter'
        let usedPuter = false

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesForAPI,
            userContext: {
              name: user?.displayName ?? 'Davie',
              language: settings.personal.language ?? 'sw-en',
              timezone: settings.personal.timezone ?? 'Africa/Dar_es_Salaam',
            },
          }),
        })

        const data = await response.json()

        if (data.usePuterFallback || !response.ok) {
          console.warn('[Chat] Server providers failed — trying Puter.js')
          try {
            const puterResponse = await callPuterJS(content)
            aiContent = puterResponse
            provider = 'puter'
            usedPuter = true
          } catch {
            throw new Error(
              data.error ?? 'All AI providers are currently unavailable.'
            )
          }
        } else {
          aiContent = data.content as string
          provider = data.provider as AIProvider
        }

        if (!aiContent.trim()) {
          throw new Error('Empty response from AI')
        }

        setLastProvider(provider)

        const aiMessage: AIMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toISOString(),
          provider,
          model: usedPuter ? 'gpt-4o-mini (Puter)' : data.model,
        }

        const finalMessages = [...updatedMessages, aiMessage]
        setMessages(finalMessages)

        if (user?.uid) {
          saveChatToStorage(user.uid, finalMessages)
          saveMessageToFirestore(user.uid, aiMessage).catch(() => {})
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to get AI response'
        setError(errorMsg)

        setMessages(prev => prev.filter(m => m.id !== userMessage.id))
        if (user?.uid) {
          saveChatToStorage(user.uid, messages)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, user, settings]
  )

  const clearConversation = useCallback(async () => {
    setMessages([])
    setError(null)
    setLastProvider(null)

    if (user?.uid) {
      clearChatStorage(user.uid)
      clearChatFromFirestore(user.uid).catch(() => {})
    }
  }, [user?.uid])

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    isLoading,
    isOpen,
    error,
    lastProvider,
    setIsOpen,
    sendMessage,
    clearConversation,
    clearError,
  }
}
