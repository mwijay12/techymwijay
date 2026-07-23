'use client'

import { useState } from 'react'
import { Copy, Download, Trash2, Edit2, Check, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReadAloudButton } from '@/components/tts/ReadAloudButton'

interface TranscriptEditorProps {
  transcript: string
  interimTranscript?: string
  detectedLanguage: 'swahili' | 'english' | 'mixed'
  isListening: boolean
  onClear: () => void
  onSaveToVault?: (text: string) => void
  onSaveTask?: (text: string) => void
}

export function TranscriptEditor({
  transcript,
  interimTranscript,
  detectedLanguage,
  isListening,
  onClear,
  onSaveToVault,
  onSaveTask,
}: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [copied, setCopied] = useState(false)

  const currentText = isEditing ? editedText : transcript
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0

  const handleStartEdit = () => {
    setEditedText(transcript)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
  }

  const handleCopy = async () => {
    if (!currentText) return
    await navigator.clipboard.writeText(currentText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!currentText) return
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Transcript
          </span>
          {detectedLanguage && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                detectedLanguage === 'swahili'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : detectedLanguage === 'mixed'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              )}
            >
              <Globe className="w-2.5 h-2.5" />
              {detectedLanguage === 'swahili'
                ? 'Swahili'
                : detectedLanguage === 'mixed'
                ? 'Swahili-English Code-Switch'
                : 'English'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-mono">
            {wordCount} words
          </span>

          {transcript && !isEditing && (
            <button
              onClick={handleStartEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          {isEditing && (
            <button
              onClick={handleSaveEdit}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          )}
        </div>
      </div>

      <div className="min-h-[140px] max-h-[300px] overflow-y-auto p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-sm leading-relaxed text-gray-200">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={5}
            className="w-full h-full bg-transparent text-white focus:outline-none resize-none font-sans"
          />
        ) : transcript || interimTranscript ? (
          <div>
            <span>{transcript}</span>
            {interimTranscript && (
              <span className="text-purple-400 italic animate-pulse ml-1">
                {interimTranscript}
              </span>
            )}
          </div>
        ) : (
          <p className="text-gray-600 italic font-sans text-xs">
            {isListening
              ? 'Listening... Speak naturally in Swahili or English...'
              : 'Press the microphone button and start speaking...'}
          </p>
        )}
      </div>

      {currentText && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ReadAloudButton text={currentText} size="xs" />

            {onSaveToVault && (
              <button
                onClick={() => onSaveToVault(currentText)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all"
              >
                Save to Vault
              </button>
            )}

            {onSaveTask && (
              <button
                onClick={() => onSaveTask(currentText)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
              >
                Save as Task
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TranscriptEditor
