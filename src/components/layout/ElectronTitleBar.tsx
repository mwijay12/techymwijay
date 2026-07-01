'use client'

import { useState, useEffect } from 'react'
import { Minus, Maximize2, X, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      onMaximizeChange: (callback: (isMax: boolean) => void) => void
      isElectron: boolean
      getVersion: () => Promise<string>
    }
  }
}

export default function ElectronTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [version, setVersion] = useState('')
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron

  useEffect(() => {
    if (!isElectron) return
    
    window.electronAPI?.isMaximized().then(setIsMaximized)
    window.electronAPI?.onMaximizeChange(setIsMaximized)
    window.electronAPI?.getVersion().then(setVersion)
  }, [isElectron])

  if (!isElectron) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-10 z-[9999] flex items-center justify-between bg-black/90 backdrop-blur-xl border-b border-white/10 select-none"
      style={{ ['-webkit-app-region' as string]: 'drag' }}
    >
      {/* App title - draggable */}
      <div className="flex items-center gap-2 pl-4">
        <Monitor className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs text-gray-400 font-medium">Mwijay Tech</span>
        {version && <span className="text-[10px] text-gray-600">v{version}</span>}
      </div>

      {/* Window controls - no drag */}
      <div className="flex h-full" style={{ ['-webkit-app-region' as string]: 'no-drag' }}>
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="px-4 h-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="px-4 h-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="px-4 h-full hover:bg-red-500 transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}