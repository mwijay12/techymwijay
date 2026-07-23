/**
 * Swahili-English Code-Switch Post-Processor
 * Corrects common mishearings when Whisper transcribes Swahili-English mixed speech.
 * Tanzanian context — Dar es Salaam slang and developer vocabulary included.
 */

const SWAHILI_CORRECTIONS: Record<string, string> = {
  // Greetings
  'habari yako':    'habari yako',
  'habari gani':    'habari gani',
  'nzuri sana':     'nzuri sana',
  'poa kabisa':     'poa kabisa',
  'mambo vipi':     'mambo vipi',
  'fiti':           'fiti',
  'sawa sawa':      'sawa sawa',

  // Common phrases Whisper mishears
  'a sante':        'asante',
  'a santo':        'asante',
  'assante':        'asante',
  'kari bu':        'karibu',
  'n diyo':         'ndiyo',
  'nd iyo':         'ndiyo',
  'si jui':         'sijui',
  'si ju':          'sijui',
  'pole pole':      'pole pole',
  'hap ana':        'hapana',
  'si yo':          'siyo',

  // TZ developer slang
  'si unajua':      'si unajua',
  'unaona':         'unaona',
  'inafanya kazi':  'inafanya kazi',
  'haifanyi kazi':  'haifanyi kazi',
  'nimefika':       'nimefika',
  'tunaenda':       'tunaenda',
  'tunaendelea':    'tunaendelea',
  'kwanza':         'kwanza',
  'baadaye':        'baadaye',
  'sasa hivi':      'sasa hivi',
  'kidogo':         'kidogo',
  'vizuri':         'vizuri',
  'bado':           'bado',

  // BIT student context
  'data base':      'database',
  'data bases':     'databases',
  'java script':    'JavaScript',
  'type script':    'TypeScript',
  'fire base':      'Firebase',
  'git hub':        'GitHub',
  'vs code':        'VS Code',
  'rea act':        'React',
  'next j s':       'Next.js',
  'node j s':       'Node.js',

  // Numbers in Swahili context
  'moja':           'moja',
  'mbili':          'mbili',
  'tatu':           'tatu',
  'nne':            'nne',
  'tano':           'tano',
  'sita':           'sita',
  'saba':           'saba',
  'nane':           'nane',
  'tisa':           'tisa',
  'kumi':           'kumi',

  // Money in TZS context
  'shilingi':       'shilingi',
  'elfu':           'elfu',
  'laki':           'laki',
}

export function applySwahiliCorrections(transcript: string): string {
  let result = transcript

  Object.entries(SWAHILI_CORRECTIONS).forEach(([wrong, correct]) => {
    const regex = new RegExp(`\\b${escapeRegex(wrong)}\\b`, 'gi')
    result = result.replace(regex, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return correct.charAt(0).toUpperCase() + correct.slice(1)
      }
      return correct
    })
  })

  return result
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function detectLanguageMix(
  transcript: string
): 'swahili' | 'english' | 'mixed' {
  if (!transcript.trim()) return 'english'

  const words = transcript.toLowerCase().split(/\s+/)
  const swahiliWords = new Set(Object.keys(SWAHILI_CORRECTIONS))

  const swahiliIndicators = new Set([
    'na', 'ya', 'wa', 'za', 'kwa', 'ni', 'si', 'la', 'pa',
    'pia', 'hii', 'hiyo', 'hilo', 'hizi', 'hizo',
    'mimi', 'wewe', 'yeye', 'sisi', 'nyinyi', 'wao',
    'ndiyo', 'hapana', 'asante', 'karibu', 'sawa',
    'lakini', 'au', 'bali', 'ila', 'kwamba',
    'ninakwenda', 'ninafanya', 'ninahitaji',
    ...Array.from(swahiliWords),
  ])

  const swahiliCount = words.filter(w => swahiliIndicators.has(w)).length
  const ratio = swahiliCount / words.length

  if (ratio > 0.4) return 'swahili'
  if (ratio > 0.15) return 'mixed'
  return 'english'
}

export function formatTranscript(raw: string): string {
  if (!raw.trim()) return ''

  let result = raw.trim()
  result = applySwahiliCorrections(result)
  result = result.charAt(0).toUpperCase() + result.slice(1)

  result = result
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/([.,!?;:])\s*/g, '$1 ')
    .trim()

  if (result && !/[.!?]$/.test(result)) {
    result += '.'
  }

  return result
}

export function extractAmount(text: string): number | null {
  const patterns = [
    /(?:tsh|shilingi|tshs?)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:shilingi|tsh)?/gi,
    /(\d+)\s*k(?:elfu)?\b/gi,
    /(\d+)\s*laki\b/gi,
    /elfu\s*(\d+)/gi,
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(text)
    if (match) {
      const amount = match[1].replace(/,/g, '')

      if (/k(?:elfu)?/i.test(match[0])) {
        return parseFloat(amount) * 1000
      }

      if (/laki/i.test(match[0])) {
        return parseFloat(amount) * 100_000
      }

      return parseFloat(amount)
    }
  }

  return null
}

export function cleanForStorage(transcript: string): string {
  return transcript.replace(/\s+/g, ' ').trim()
}
