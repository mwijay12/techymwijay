/**
 * AI Memory Extractor
 * Analyzes conversations and suggests memory entries to save.
 * Uses pattern matching + AI to identify learnable facts.
 */

import type { AIMessage } from '@/types/ai'
import type { MemoryType } from '@/lib/memory-service'

export interface MemorySuggestion {
  type: MemoryType
  content: string
  confidence: number
  reason: string
  tags: string[]
}

const EXTRACTION_PATTERNS: Array<{
  pattern: RegExp
  type: MemoryType
  confidence: number
  tags: string[]
}> = [
  {
    pattern: /\b(I use|I prefer|I work with|my stack is|I'm using)\b.{5,80}/gi,
    type: 'preference',
    confidence: 80,
    tags: ['technology', 'preference'],
  },
  {
    pattern: /\b(that's wrong|incorrect|actually|you're mistaken|no,? I)\b.{5,60}/gi,
    type: 'correction',
    confidence: 85,
    tags: ['correction'],
  },
  {
    pattern: /\b(I am|I'm|my name is|I live in|I study|I work)\b.{5,80}/gi,
    type: 'fact',
    confidence: 75,
    tags: ['identity'],
  },
  {
    pattern: /\b(ninaishi|ninafanya kazi|ninaishi Tanzania|niko Dar)\b/gi,
    type: 'context',
    confidence: 90,
    tags: ['tanzania', 'location'],
  },
  {
    pattern: /\b(I know|I can|I'm good at|I've built|I've worked with)\b.{5,80}/gi,
    type: 'skill',
    confidence: 70,
    tags: ['skill'],
  },
]

export function extractFromMessage(
  message: string,
  role: 'user' | 'assistant'
): MemorySuggestion[] {
  if (role !== 'user') return []

  const suggestions: MemorySuggestion[] = []
  const seen = new Set<string>()

  EXTRACTION_PATTERNS.forEach(({ pattern, type, confidence, tags }) => {
    const matches = message.matchAll(new RegExp(pattern))
    for (const match of matches) {
      const content = match[0].trim()
      if (content.length < 10 || seen.has(content.toLowerCase())) continue
      seen.add(content.toLowerCase())

      suggestions.push({
        type,
        content,
        confidence,
        reason: `Detected "${type}" pattern in your message`,
        tags,
      })
    }
  })

  return suggestions.slice(0, 3)
}

export function extractFromConversation(
  messages: AIMessage[]
): MemorySuggestion[] {
  const allSuggestions: MemorySuggestion[] = []
  const seen = new Set<string>()

  const recentUserMessages = messages
    .filter(m => m.role === 'user')
    .slice(-5)

  recentUserMessages.forEach(msg => {
    const suggestions = extractFromMessage(msg.content, 'user')
    suggestions.forEach(s => {
      const key = s.content.toLowerCase().slice(0, 40)
      if (!seen.has(key)) {
        seen.add(key)
        allSuggestions.push(s)
      }
    })
  })

  return allSuggestions
}

export function buildExtractionPrompt(
  messages: AIMessage[],
  existingMemories: string[]
): string {
  const conversation = messages
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'Davie' : 'AI'}: ${m.content}`)
    .join('\n')

  const existingList = existingMemories
    .slice(0, 5)
    .map(m => `- ${m}`)
    .join('\n')

  return `You are analyzing a conversation to extract memory-worthy facts about the user.

CONVERSATION:
${conversation}

EXISTING MEMORIES (already known):
${existingList || '(none yet)'}

Extract 1-3 NEW facts worth remembering about the user from this conversation.
Only extract facts that are NOT already in the existing memories.
Focus on: preferences, facts about the user, their location/context, skills, corrections.

Respond in this exact JSON format:
{
  "suggestions": [
    {
      "type": "preference|fact|context|skill|correction",
      "content": "The memory statement in first person about the user",
      "confidence": 85,
      "tags": ["tag1", "tag2"],
      "reason": "Why this is worth remembering"
    }
  ]
}

If nothing new is worth remembering, return: {"suggestions": []}
Keep each content statement under 150 characters.
Write in third person: "Davie prefers..." or "The user works in..."`
}

export function parseExtractionResponse(
  response: string
): MemorySuggestion[] {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return []

    const parsed = JSON.parse(jsonMatch[0])
    const suggestions = parsed.suggestions

    if (!Array.isArray(suggestions)) return []

    return suggestions
      .filter(
        (s: any) =>
          s.content &&
          s.type &&
          ['preference', 'fact', 'context', 'skill', 'correction'].includes(
            s.type
          )
      )
      .map(
        (s: any): MemorySuggestion => ({
          type: s.type,
          content: String(s.content).slice(0, 200),
          confidence: Math.min(100, Math.max(0, Number(s.confidence) || 75)),
          reason: String(s.reason || 'Extracted from conversation'),
          tags: Array.isArray(s.tags)
            ? s.tags.map(String).slice(0, 5)
            : [],
        })
      )
      .slice(0, 3)
  } catch {
    return []
  }
}
