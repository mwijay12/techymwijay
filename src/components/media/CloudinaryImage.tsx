'use client'

import { useState } from 'react'
import { ExternalLink, FileText, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getDisplayUrl,
  getThumbnailUrl,
  isPdfUrl,
  isCloudinaryUrl,
} from '@/lib/cloudinary-service'

interface CloudinaryImageProps {
  url: string
  alt?: string
  width?: number
  height?: number
  className?: string
  thumbnail?: boolean
  showLink?: boolean
  onClick?: () => void
}

export function CloudinaryImage({
  url,
  alt = 'Uploaded image',
  width = 400,
  height = 300,
  className,
  thumbnail = false,
  showLink = true,
  onClick,
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (isPdfUrl(url)) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10',
          className
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">PDF Document</p>
          <p className="text-[10px] text-gray-400 font-mono truncate">{url}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl',
          thumbnail ? 'w-12 h-12' : 'w-full h-32',
          className
        )}
      >
        <ImageOff className="w-5 h-5 text-gray-500" />
        {!thumbnail && (
          <p className="text-[10px] text-gray-500 mt-1 font-mono">Failed to load image</p>
        )}
      </div>
    )
  }

  const optimizedUrl = isCloudinaryUrl(url)
    ? thumbnail
      ? getThumbnailUrl(url, 100)
      : getDisplayUrl(url, width)
    : url

  if (thumbnail) {
    return (
      <div
        className={cn(
          'relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0',
          onClick && 'cursor-pointer hover:ring-2 hover:ring-purple-500/50',
          className
        )}
        onClick={onClick}
      >
        {isLoading && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
        <img
          src={optimizedUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative group', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />
      )}

      <img
        src={optimizedUrl}
        alt={alt}
        className={cn(
          'w-full rounded-xl object-contain max-h-80 transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          onClick && 'cursor-pointer'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        onClick={onClick}
      />

      {showLink && !isLoading && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
          title="Open original"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  )
}

export default CloudinaryImage
