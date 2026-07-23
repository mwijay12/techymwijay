'use client'

import { Volume2, Square, Loader2 } from 'lucide-react'
import { useTTS } from '@/hooks/use-tts'
import { cn } from '@/lib/utils'

interface ReadAloudButtonProps {
  text: string
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

export function ReadAloudButton({
  text,
  size = 'sm',
  showLabel = true,
  className,
}: ReadAloudButtonProps) {
  const { isPlaying, isLoading, speak, stop } = useTTS()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPlaying) {
      stop()
    } else {
      speak(text)
    }
  }

  const sizeClasses = {
    xs: 'px-2 py-1 text-[10px] gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2 text-xs gap-2',
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || !text.trim()}
      className={cn(
        'inline-flex items-center rounded-xl font-semibold transition-all duration-200 border',
        isPlaying
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
          : 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 hover:text-white',
        sizeClasses[size],
        (isLoading || !text.trim()) && 'opacity-40 cursor-not-allowed',
        className
      )}
      title={isPlaying ? 'Stop reading' : 'Read aloud'}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPlaying ? (
        <Square className="w-3.5 h-3.5" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      {showLabel && <span>{isPlaying ? 'Stop' : 'Read Aloud'}</span>}
    </button>
  )
}

export default ReadAloudButton
