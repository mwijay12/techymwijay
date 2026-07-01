'use client'

import { useState } from 'react'
import { Globe, Copy, Check, Loader2 } from 'lucide-react'
import { useAI } from '@/hooks/use-ai'
import { languageNames } from './LanguageSelector'
import type { RecordingState } from './useSTTRecorder'

type Props = {
  sourceText: string
  sourceLanguage: string
  targetLang: string
  autoTranslate: boolean
  onAutoTranslateChange: (val: boolean) => void
  translatedText: string
  setTranslatedText: (text: string) => void
  isTranslating: boolean
  setIsTranslating: (val: boolean) => void
  onCopy: (text: string) => void
  copied: boolean
}

export function TranslationBox({
  sourceText,
  sourceLanguage,
  targetLang,
  autoTranslate,
  onAutoTranslateChange,
  translatedText,
  setTranslatedText,
  isTranslating,
  setIsTranslating,
  onCopy,
  copied,
}: Props) {
  const [localCopied, setLocalCopied] = useState(false)
  const { translate, loading } = useAI()

  const handleTranslate = async () => {
    if (!sourceText.trim() || sourceLanguage === targetLang) return
    
    setIsTranslating(true)
    try {
      const sourceLangName = languageNames[sourceLanguage] || sourceLanguage
      const targetLangName = languageNames[targetLang] || targetLang
      const result = await translate(sourceText, sourceLangName, targetLangName, { maxTokens: 512 })
      if (result) setTranslatedText(result)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    onCopy(text)
    setLocalCopied(true)
    setTimeout(() => setLocalCopied(false), 2000)
  }

  if (!sourceText && !translatedText && !isTranslating) return null

  return (
    <div>
      {/* Translation */}
      {(translatedText || isTranslating) && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-blue-400 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" />
              {languageNames[targetLang] || targetLang} (Tafsiri)
            </label>
            {translatedText && (
              <button
                onClick={() => handleCopy(translatedText)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-white/5 border border-white/10"
              >
                {localCopied ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
              </button>
            )}
          </div>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5 min-h-[40px]">
            {isTranslating ? (
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Inatafsiri...</span>
              </div>
            ) : (
              <p className="text-blue-200 text-sm leading-relaxed">{translatedText}</p>
            )}
          </div>
        </div>
      )}

      {/* Manual translate button */}
      {sourceText && !translatedText && !isTranslating && sourceLanguage !== targetLang && (
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Globe className="w-3 h-3" />
          )}
          Tafsiri kwa {languageNames[targetLang]}
        </button>
      )}
    </div>
  )
}