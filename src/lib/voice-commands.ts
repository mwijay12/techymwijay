/**
 * Voice Command Parser
 * Detects and parses commands from STT transcripts.
 * Supports Swahili and English command patterns.
 * Tanzanian context throughout.
 */

import { extractAmount } from '@/lib/swahili-processor'

export type VoiceCommandType =
  | 'save_vault'
  | 'add_task'
  | 'add_expense'
  | 'add_note'
  | 'clear'
  | 'copy'
  | 'none'

export interface ParsedVoiceCommand {
  type: VoiceCommandType
  confidence: number
  params: {
    title?: string
    content?: string
    amount?: number
    category?: string
  }
  originalText: string
}

const COMMAND_PATTERNS: Array<{
  type: VoiceCommandType
  patterns: RegExp[]
  extract?: (match: RegExpMatchArray, text: string) => ParsedVoiceCommand['params']
}> = [
  {
    type: 'save_vault',
    patterns: [
      /\b(save\s+to\s+vault|save\s+in\s+vault|hifadhi\s+kwenye\s+vault|hifadhi\s+vault)\b/i,
    ],
    extract: () => ({}),
  },
  {
    type: 'add_task',
    patterns: [
      /\b(add\s+task|create\s+task|new\s+task|ongeza\s+kazi|kazi\s+mpya)\s+(.+)/i,
      /\b(remind\s+me\s+to|kukumbusha)\s+(.+)/i,
      /\b(todo|to\s+do)\s*[:–-]?\s*(.+)/i,
    ],
    extract: (match) => ({
      title: match[2]?.trim() ?? match[0],
    }),
  },
  {
    type: 'add_expense',
    patterns: [
      /\b(add\s+expense|spent|nimetumia|nimetumia\s+pesa|ongeza\s+matumizi)\b/i,
      /\b(i\s+spent|nilitumia|nimetumia)\s+/i,
      /\b(expense|matumizi|pesa\s+nimetumia)\b/i,
    ],
    extract: (_, text) => {
      const amount = extractAmount(text)
      let category = 'nyingine'
      if (/chakula|food|lunch|dinner|breakfast|ugali|chips|pilau/i.test(text)) {
        category = 'chakula'
      } else if (/daladala|uber|boda|usafiri|transport|taxi|bus/i.test(text)) {
        category = 'usafiri'
      } else if (/airtime|data|vodacom|airtel|tigo|halotel/i.test(text)) {
        category = 'airtime'
      } else if (/mpesa|airtel\s+money|tigo\s+pesa|mobile\s+money/i.test(text)) {
        category = 'mpesa'
      } else if (/school|chuo|elimu|fee|ada|books|vitabu/i.test(text)) {
        category = 'elimu'
      }
      return { amount: amount ?? undefined, category }
    },
  },
  {
    type: 'add_note',
    patterns: [
      /\b(new\s+note|save\s+note|kumbuka|remember\s+this|note\s+this)\b\s*:?\s*(.+)/i,
      /\b(note\s+to\s+self)\s*:?\s*(.+)/i,
    ],
    extract: (match) => ({
      content: match[2]?.trim(),
    }),
  },
  {
    type: 'clear',
    patterns: [
      /^(clear|clear\s+transcript|futa|futa\s+yote|start\s+over)$/i,
    ],
    extract: () => ({}),
  },
  {
    type: 'copy',
    patterns: [
      /^(copy|copy\s+transcript|nakili|nakili\s+maneno)$/i,
    ],
    extract: () => ({}),
  },
]

export function parseVoiceCommand(
  transcript: string
): ParsedVoiceCommand {
  const text = transcript.trim()

  for (const cmd of COMMAND_PATTERNS) {
    for (const pattern of cmd.patterns) {
      const match = text.match(pattern)
      if (match) {
        const params = cmd.extract ? cmd.extract(match, text) : {}
        return {
          type: cmd.type,
          confidence: 0.9,
          params,
          originalText: text,
        }
      }
    }
  }

  return {
    type: 'none',
    confidence: 0,
    params: {},
    originalText: text,
  }
}

export function startsWithCommandKeyword(text: string): boolean {
  const commandStarters = [
    'save', 'add', 'create', 'new', 'clear', 'copy', 'note',
    'remind', 'todo', 'hifadhi', 'ongeza', 'kumbuka', 'futa',
    'nakili', 'kazi', 'spent', 'nimetumia',
  ]
  const firstWord = text.trim().toLowerCase().split(/\s+/)[0]
  return commandStarters.includes(firstWord)
}

export function describeCommand(cmd: ParsedVoiceCommand): string {
  switch (cmd.type) {
    case 'save_vault':
      return '📥 Saving transcript to vault...'
    case 'add_task':
      return `✅ Adding task: "${cmd.params.title ?? 'New task'}"`
    case 'add_expense':
      return `💸 Adding expense${cmd.params.amount ? `: TSh ${cmd.params.amount.toLocaleString()}` : ''}`
    case 'add_note':
      return `📝 Saving note to vault...`
    case 'clear':
      return '🗑️ Clearing transcript...'
    case 'copy':
      return '📋 Copying to clipboard...'
    default:
      return ''
  }
}
