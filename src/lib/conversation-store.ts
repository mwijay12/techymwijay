/**
 * Conversation Store — persistent conversation history for the AI sidebar.
 *
 * Handles:
 * - Creating conversations
 * - Adding messages with metadata
 * - Loading/saving to localStorage
 * - Auto-titling from first user message
 * - Context injection from transcription
 */

import { getItem, setItem, removeItem } from '@/lib/browser-storage'

const STORAGE_KEY = 'mwj-ai-conversations'
const MAX_CONVERSATIONS = 20
const MAX_MESSAGES_PER_CONVERSATION = 100

export type SidebarMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  provider?: string
  model?: string
  latencyMs?: number
  isError?: boolean
  isQuickAction?: boolean
  actionType?: string
}

export type Conversation = {
  id: string
  title: string
  messages: SidebarMessage[]
  createdAt: number
  updatedAt: number
  context?: string        // injected transcription context
  contextLanguage?: string
}

function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function loadConversations(): Conversation[] {
  try {
    const raw = getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistConversations(conversations: Conversation[]): void {
  // Trim to max and truncate messages
  const trimmed = conversations
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONVERSATIONS)
    .map((c) => ({
      ...c,
      messages: c.messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
    }))
  setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

export function createConversation(context?: string, contextLanguage?: string): Conversation {
  const conv: Conversation = {
    id: generateId(),
    title: 'New conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    context,
    contextLanguage,
  }
  const all = loadConversations()
  all.unshift(conv)
  persistConversations(all)
  return conv
}

export function addMessage(
  conversationId: string,
  message: Omit<SidebarMessage, 'id' | 'timestamp'>
): SidebarMessage {
  const all = loadConversations()
  const conv = all.find((c) => c.id === conversationId)
  if (!conv) throw new Error('Conversation not found')

  const fullMessage: SidebarMessage = {
    ...message,
    id: generateMessageId(),
    timestamp: Date.now(),
  }

  conv.messages.push(fullMessage)
  conv.updatedAt = Date.now()

  // Auto-title from first user message
  if (conv.title === 'New conversation' && message.role === 'user') {
    conv.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
  }

  persistConversations(all)
  return fullMessage
}

export function deleteConversation(id: string): void {
  const all = loadConversations().filter((c) => c.id !== id)
  persistConversations(all)
}

export function clearAllConversations(): void {
  removeItem(STORAGE_KEY)
}

export function updateConversationContext(id: string, context: string, language?: string): void {
  const all = loadConversations()
  const conv = all.find((c) => c.id === id)
  if (conv) {
    conv.context = context
    if (language) conv.contextLanguage = language
    conv.updatedAt = Date.now()
    persistConversations(all)
  }
}