'use client'

import { useEffect } from 'react'
import { Minus, Square, Maximize2, X, Monitor, WifiOff } from 'lucide-react'
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
      className="fixed top-0 left-0 right-0 h-9 z-[9999] flex items-center justify-between bg-black/90 backdrop-blur-xl border-b border-white/10 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 pl-4">
        <Monitor className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs text-gray-300 font-semibold">Mwijay Tech</span>
        <span className="text-[10px] text-gray-500 font-mono">v{appVersion}</span>
      </div>

      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {isOnline ? (
          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-400 text-[10px] font-mono">
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}
      </div>

      {!isMac && (
        <div
          className="flex h-full"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={minimize}
            title="Minimize"
            className="px-4 h-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white flex items-center justify-center"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={maximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="px-4 h-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white flex items-center justify-center"
          >
            {isMaximized ? (
              <Square className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={close}
            title="Close"
            className="px-4 h-full hover:bg-red-500 transition-colors text-gray-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ElectronTitleBar