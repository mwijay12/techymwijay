'use client'

import { motion } from 'framer-motion'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MeetingSummaryProps {
  summary: string | null
  isSummarizing: boolean
  onGenerate: () => void
  className?: string
}

export function MeetingSummary({
  summary,
  isSummarizing,
  onGenerate,
  className,
}: MeetingSummaryProps) {
  if (!summary && !isSummarizing) {
    return (
      <div className={cn('bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-center', className)}>
        <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
        <h4 className="text-xs font-bold text-white mb-1">
          AI Meeting Summary
        </h4>
        <p className="text-[11px] text-gray-400 mb-3 max-w-md mx-auto">
          Generate key takeaways, action items, and overview from your Swahili-English transcript using AI.
        </p>
        <button
          onClick={onGenerate}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all shadow-md shadow-purple-500/20 inline-flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate AI Summary
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-purple-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-5 space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">
            AI Meeting Summary
          </h3>
        </div>

        <button
          onClick={onGenerate}
          disabled={isSummarizing}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
          title="Regenerate Summary"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isSummarizing && 'animate-spin')} />
        </button>
      </div>

      {isSummarizing ? (
        <div className="flex items-center gap-2 text-xs text-purple-300 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Analyzing transcript and generating key takeaways...</span>
        </div>
      ) : (
        <div className="text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
          {summary}
        </div>
      )}
    </motion.div>
  )
}

export default MeetingSummary
