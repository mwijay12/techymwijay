'use client'

import { X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/cloudinary-service'

interface ImagePreviewProps {
  file: File | null
  previewUrl: string | null
  onRemove: () => void
  className?: string
}

export function ImagePreview({
  file,
  previewUrl,
  onRemove,
  className,
}: ImagePreviewProps) {
  if (!file) return null

  const isImage = file.type.startsWith('image/')

  return (
    <div
      className={cn(
        'relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden',
        className
      )}
    >
      {isImage && previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-h-48 object-contain bg-black/40"
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 bg-black/40">
          <ImageIcon className="w-8 h-8 text-gray-500" />
        </div>
      )}

      <div className="px-3 py-2 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{file.name}</p>
          <p className="text-[10px] text-gray-400 font-mono">
            {formatFileSize(file.size)} · {file.type.split('/')[1]?.toUpperCase()}
          </p>
        </div>

        <button
          onClick={onRemove}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Remove file"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default ImagePreview
