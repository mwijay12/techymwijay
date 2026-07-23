'use client'

import { useState } from 'react'
import { Download, Copy, Check, ShieldCheck, BookmarkPlus } from 'lucide-react'
import {
  exportMeetingAsText,
  buildFullTranscript,
  type MeetingSession,
} from '@/lib/meeting-service'

interface MeetingExportProps {
  session: MeetingSession | null
  onSaveToVault: () => Promise<string | null>
  className?: string
}

export function MeetingExport({
  session,
  onSaveToVault,
  className,
}: MeetingExportProps) {
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedVaultId, setSavedVaultId] = useState<string | null>(
    session?.vaultItemId ?? null
  )

  if (!session) return null

  const handleCopy = async () => {
    const fullText = buildFullTranscript(session)
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleSaveVault = async () => {
    setIsSaving(true)
    try {
      const id = await onSaveToVault()
      if (id) setSavedVaultId(id)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => exportMeetingAsText(session)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .txt</span>
        </button>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copied ? 'Copied!' : 'Copy Transcript'}</span>
        </button>

        {savedVaultId || session.savedToVault ? (
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Saved to Vault</span>
          </span>
        ) : (
          <button
            onClick={handleSaveVault}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save to Vault'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MeetingExport
