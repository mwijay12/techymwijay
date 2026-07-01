'use client'

import { motion } from 'framer-motion'
import { FileText, Copy, Check, Loader2 } from 'lucide-react'

type Props = {
  transcribedText: string
  isFileTranscribing: boolean
  language: string
  onCopy: (text: string) => void
  copied: boolean
  languageNames: Record<string, string>
}

export function TranscriptionPanel({
  transcribedText,
  isFileTranscribing,
  language,
  onCopy,
  copied,
  languageNames,
}: Props) {
  if (!transcribedText && !isFileTranscribing) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-gray-400 flex items-center gap-1">
            <FileText className="w-2.5 h-2.5" />
            {languageNames[language] || language}
          </label>
          {transcribedText && (
            <button
              onClick={() => onCopy(transcribedText)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-white/5 border border-white/10"
            >
              {copied ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
            </button>
          )}
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-2.5 min-h-[60px]">
          {isFileTranscribing ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">AI inachakata sauti...</span>
            </div>
          ) : (
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{transcribedText}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}