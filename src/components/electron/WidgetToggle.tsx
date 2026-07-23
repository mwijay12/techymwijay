'use client'

import { useState } from 'react'
import { Layout, Monitor } from 'lucide-react'
import { useElectron } from '@/hooks/use-electron'

export function WidgetToggle() {
  const { isElectron, toggleWidget } = useElectron()
  const [isOpen, setIsOpen] = useState(false)

  if (!isElectron) return null

  const handleToggle = async () => {
    const nextState = await toggleWidget()
    setIsOpen(nextState)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
      title="Toggle Always-on-top Desktop Widget (Ctrl+Shift+W)"
    >
      <Layout className="w-3.5 h-3.5 text-purple-400" />
      <span>{isOpen ? 'Close Widget' : 'Desktop Widget'}</span>
    </button>
  )
}

export default WidgetToggle
