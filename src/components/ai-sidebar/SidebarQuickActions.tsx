'use client'

import { 
  FileText, Wand2, Hash, Languages, HelpCircle, ListChecks 
} from 'lucide-react'

const QUICK_ACTIONS = [
  { id: 'summarize', label: 'Summarize', icon: FileText },
  { id: 'grammar', label: 'Grammar', icon: Wand2 },
  { id: 'keywords', label: 'Keywords', icon: Hash },
  { id: 'translate', label: 'Translate', icon: Languages },
  { id: 'explain', label: 'Explain', icon: HelpCircle },
  { id: 'action_items', label: 'Actions', icon: ListChecks },
] as const

type Props = {
  onAction: (actionType: string) => void
  disabled?: boolean
  hasContext: boolean
}

export function SidebarQuickActions({ onAction, disabled, hasContext }: Props) {
  if (!hasContext) return null

  return (
    <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide">
      {QUICK_ACTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onAction(id)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/10 text-xs text-white/60 hover:text-white/90 transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed btn-press"
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  )
}