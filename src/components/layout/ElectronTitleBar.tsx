'use client'

import { useEffect } from 'react'
import { Minus, Square, Maximize2, X, Zap, WifiOff } from 'lucide-react'
import { useElectron } from '@/hooks/use-electron'

export function ElectronTitleBar() {
  const {
    isElectron,
    platform,
    isOnline,
    isMaximized,
    appVersion,
    minimize,
    maximize,
    close,
  } = useElectron()

  useEffect(() => {
    if (isElectron) {
      document.body.classList.add('electron-mode')
    }
    return () => {
      document.body.classList.remove('electron-mode')
    }
  }, [isElectron])

  if (!isElectron) return null

  const isMac = platform === 'darwin'

  return (
    <div
      className="fixed top-0 left-0 right-0 h-9 z-[99999] flex items-center justify-between bg-[#080812]/95 backdrop-blur-2xl border-b border-white/10 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* App Branding Title */}
      <div className="flex items-center gap-2 pl-3">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs text-gray-200 font-bold tracking-tight">Mwijay Tech Workstation</span>
        <span className="text-[10px] text-violet-400 font-mono font-medium px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
          v{appVersion}
        </span>
      </div>

      {/* Center Status Pill */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {isOnline ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Online • Cloud Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono font-semibold">
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">Offline Mode</span>
          </div>
        )}
      </div>

      {/* Windows / Linux Frame Control Buttons (Top-Right) */}
      {!isMac && (
        <div
          className="flex items-center h-full ml-auto"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Minimize Button */}
          <button
            onClick={minimize}
            title="Minimize"
            className="w-11 h-full hover:bg-white/10 active:bg-white/20 transition-colors text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore Button */}
          <button
            onClick={maximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="w-11 h-full hover:bg-white/10 active:bg-white/20 transition-colors text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            {isMaximized ? (
              <Square className="w-3 h-3 text-gray-300" />
            ) : (
              <Maximize2 className="w-3 h-3 text-gray-300" />
            )}
          </button>

          {/* Close Window Button */}
          <button
            onClick={close}
            title="Close"
            className="w-12 h-full hover:bg-red-600 active:bg-red-700 transition-colors text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ElectronTitleBar