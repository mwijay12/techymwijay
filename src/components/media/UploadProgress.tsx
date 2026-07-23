'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadState } from '@/hooks/use-cloudinary-upload'

interface UploadProgressProps {
  state: UploadState
  progress: number
  fileName?: string
  onCancel?: () => void
  className?: string
}

export function UploadProgress({
  state,
  progress,
  fileName,
  onCancel,
  className,
}: UploadProgressProps) {
  if (state === 'idle' || state === 'validating') return null

  const isUploading = state === 'uploading'
  const isSuccess = state === 'success'
  const isError = state === 'error'
  const isCancelled = state === 'cancelled'

  const barColor = isSuccess
    ? 'bg-emerald-400'
    : isError || isCancelled
    ? 'bg-red-400'
    : 'bg-purple-500'

  const statusText = isUploading
    ? `Uploading... ${progress}%`
    : isSuccess
    ? 'Upload complete!'
    : isError
    ? 'Upload failed'
    : 'Cancelled'

  return (
    <div className={cn('bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3 space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isUploading && (
            <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
          )}
          {isSuccess && (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          )}
          {(isError || isCancelled) && (
            <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          )}

          <div className="min-w-0">
            {fileName && (
              <p className="text-xs text-white truncate font-medium">
                {fileName}
              </p>
            )}
            <p className={cn(
              'text-[10px] font-mono',
              isSuccess ? 'text-emerald-400' : 'text-gray-400'
            )}>
              {statusText}
            </p>
          </div>
        </div>

        {isUploading && onCancel && (
          <button
            onClick={onCancel}
            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
            title="Cancel upload"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${isSuccess ? 100 : progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  )
}

export default UploadProgress
