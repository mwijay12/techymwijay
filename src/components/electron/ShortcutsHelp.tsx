'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'

const SHORTCUT_GROUPS = [
  {
    category: 'Navigation',
    icon: '🧭',
    shortcuts: [
      { keys: ['Ctrl', '1'], desc: 'Home' },
      { keys: ['Ctrl', '2'], desc: 'Voice Dictation (STT)' },
      { keys: ['Ctrl', '3'], desc: 'Text to Speech' },
      { keys: ['Ctrl', '4'], desc: 'Developer Vault' },
      { keys: ['Ctrl', '5'], desc: 'Spending Tracker' },
      { keys: ['Ctrl', '6'], desc: 'Todo System' },
      { keys: ['Ctrl', '7'], desc: 'Meeting Recording' },
      { keys: ['Ctrl', '8'], desc: 'AI Memory' },
      { keys: ['Ctrl', ','], desc: 'Settings' },
    ],
  },
  {
    category: 'Voice & Recording',
    icon: '🎙️',
    shortcuts: [
      { keys: ['Space'], desc: 'Start/stop recording' },
      { keys: ['Ctrl', 'Shift', 'M'], desc: 'Quick dictation (Global — anywhere on desktop)' },
      { keys: ['P'], desc: 'Pause/resume recording' },
    ],
  },
  {
    category: 'AI & Chat',
    icon: '🤖',
    shortcuts: [
      { keys: ['Ctrl', 'K'], desc: 'Toggle AI Chat widget' },
      { keys: ['Enter'], desc: 'Send message (in chat)' },
      { keys: ['Shift', 'Enter'], desc: 'New line (in chat)' },
    ],
  },
  {
    category: 'Vault & Tasks',
    icon: '🔐',
    shortcuts: [
      { keys: ['N'], desc: 'Quick add task (on Todos page)' },
      { keys: ['/'], desc: 'Focus search bar' },
      { keys: ['Escape'], desc: 'Close modal / Clear focus' },
    ],
  },
  {
    category: 'Electron Desktop',
    icon: '🖥️',
    shortcuts: [
      { keys: ['Ctrl', 'Shift', 'T'], desc: 'Open Todos' },
      { keys: ['Ctrl', 'Shift', 'V'], desc: 'Open Vault' },
      { keys: ['Ctrl', 'Shift', 'S'], desc: 'Open Spending' },
      { keys: ['Ctrl', 'Shift', 'W'], desc: 'Toggle Desktop Widget' },
      { keys: ['F12'], desc: 'Toggle Developer Tools' },
      { keys: ['?'], desc: 'Show keyboard shortcuts' },
    ],
  },
]

interface ShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-3xl glass-strong rounded-3xl border border-brand-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border/50 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base font-bold text-brand-text">
                    Keyboard Shortcuts
                  </h2>
                  <span className="text-xs text-brand-muted">
                    Press{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-[10px] font-mono">
                      ?
                    </kbd>{' '}
                    anytime
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl glass flex items-center justify-center text-brand-muted hover:text-brand-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SHORTCUT_GROUPS.map((group) => (
                    <div key={group.category}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">{group.icon}</span>
                        <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                          {group.category}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {group.shortcuts.map((shortcut, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {shortcut.keys.map((key, ki) => (
                                <span key={ki}>
                                  {ki > 0 && (
                                    <span className="text-brand-muted/50 text-[10px] mx-0.5">
                                      +
                                    </span>
                                  )}
                                  <kbd className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-surface border border-brand-border text-brand-text shadow-sm">
                                    {key}
                                  </kbd>
                                </span>
                              ))}
                            </div>

                            <p className="text-xs text-brand-muted text-right leading-tight">
                              {shortcut.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border/50">
                  <p className="text-[10px] text-brand-muted text-center">
                    💡 Global shortcuts work from anywhere on your desktop when Mwijay Tech is running
                    <br />
                    🇹🇿 Built for Tanzania · Ctrl shortcuts use Cmd on macOS
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ShortcutsHelp
