'use client'

import { useState } from 'react'
import { Play, Volume2, ChevronDown, Zap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TTSVoice } from '@/hooks/use-tts'

interface VoiceSelectorProps {
  selectedVoice: TTSVoice
  availableVoices: TTSVoice[]
  onSelect: (voice: TTSVoice) => void
  onPreview: (voice: TTSVoice) => void
  isPlaying: boolean
  className?: string
}

export function VoiceSelector({
  selectedVoice,
  availableVoices,
  onSelect,
  onPreview,
  isPlaying,
  className,
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const elevenLabsVoices = availableVoices.filter(
    v => v.engine === 'elevenlabs'
  )
  const browserVoiceList = availableVoices.filter(
    v => v.engine === 'browser'
  )

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-200 text-left backdrop-blur-xl"
      >
        <div className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
          selectedVoice.engine === 'elevenlabs'
            ? 'bg-purple-500/20 text-purple-300'
            : 'bg-blue-500/20 text-blue-300'
        )}>
          {selectedVoice.engine === 'elevenlabs' ? (
            <Zap className="w-4 h-4" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            {selectedVoice.name}
          </p>
          <p className="text-xs text-gray-400">
            {selectedVoice.engine === 'elevenlabs'
              ? `ElevenLabs · ${selectedVoice.accent ?? 'American'} · ${selectedVoice.gender ?? 'female'}`
              : `Browser · ${selectedVoice.accent ?? 'System voice'}`}
          </p>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
            {browserVoiceList.length > 0 && (
              <div>
                <div className="px-4 py-2 border-b border-white/10 bg-blue-500/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    Puter.js / Free Web Engine (Default — Free & Unlimited)
                  </p>
                </div>
                {browserVoiceList.map(voice => (
                  <VoiceRow
                    key={voice.id}
                    voice={voice}
                    isSelected={selectedVoice.id === voice.id}
                    onSelect={() => {
                      onSelect(voice)
                      setIsOpen(false)
                    }}
                    onPreview={() => onPreview(voice)}
                    isPlaying={isPlaying}
                  />
                ))}
              </div>
            )}

            {elevenLabsVoices.length > 0 && (
              <div>
                <div className="px-4 py-2 border-b border-white/10 bg-purple-500/10 border-t">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    ElevenLabs — Premium HD Multilingual
                  </p>
                </div>
                {elevenLabsVoices.map(voice => (
                  <VoiceRow
                    key={voice.id}
                    voice={voice}
                    isSelected={selectedVoice.id === voice.id}
                    onSelect={() => {
                      onSelect(voice)
                      setIsOpen(false)
                    }}
                    onPreview={() => onPreview(voice)}
                    isPlaying={isPlaying}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function VoiceRow({
  voice,
  isSelected,
  onSelect,
  onPreview,
  isPlaying,
}: {
  voice: TTSVoice
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
  isPlaying: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-150',
        isSelected ? 'bg-purple-500/20' : 'hover:bg-white/5'
      )}
      onClick={onSelect}
    >
      <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0">
        <span className="text-sm">
          {voice.gender === 'female' ? '👩' : '👨'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', isSelected ? 'text-purple-300' : 'text-white')}>
          {voice.name}
        </p>
        <p className="text-[10px] text-gray-400">
          {voice.accent ?? 'System'}
        </p>
      </div>

      {isSelected && <Volume2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPreview()
        }}
        disabled={isPlaying}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-white/10 transition-all disabled:opacity-40 flex-shrink-0"
        title={`Preview ${voice.name}`}
      >
        <Play className="w-3 h-3" />
      </button>
    </div>
  )
}

export default VoiceSelector
