'use client'

import { useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ImagePlus, Link2, X, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload'
import { isCloudinaryConfigured } from '@/lib/cloudinary-service'
import { ImagePreview } from './ImagePreview'
import { UploadProgress } from './UploadProgress'
import { CloudinaryImage } from './CloudinaryImage'

interface CloudinaryUploadProps {
  currentImageUrl?: string
  onUploadComplete: (url: string, publicId: string) => void
  onRemove?: () => void
  folder?: string
  className?: string
  label?: string
  compact?: boolean
}

export function CloudinaryUpload({
  currentImageUrl,
  onUploadComplete,
  onRemove,
  folder = 'mwijaytech',
  className,
  label = 'Attach Image',
  compact = false,
}: CloudinaryUploadProps) {
  const upload = useCloudinaryUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')

  const isConfigured = isCloudinaryConfigured()

  const handleFileSelect = useCallback(
    (file: File) => {
      upload.selectFile(file)
    },
    [upload]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleUpload = async () => {
    const result = await upload.startUpload(folder)
    if (result) {
      onUploadComplete(result.secureUrl, result.publicId)
    }
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a URL')
      return
    }
    try {
      new URL(urlInput)
      setUrlError('')
      onUploadComplete(urlInput.trim(), '')
      setUrlInput('')
      setUrlMode(false)
    } catch {
      setUrlError('Please enter a valid URL')
    }
  }

  if (currentImageUrl && upload.uploadState !== 'uploading') {
    return (
      <div className={cn('space-y-2', className)}>
        <CloudinaryImage
          url={currentImageUrl}
          alt="Attached image"
          className="rounded-xl"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              upload.reset()
              fileInputRef.current?.click()
            }}
            className="text-xs text-gray-400 hover:text-purple-400 flex items-center gap-1 transition-colors"
          >
            <ImagePlus className="w-3 h-3" />
            Replace image
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUrlMode(false)}
          className={cn(
            'text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-150',
            !urlMode
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              : 'bg-white/5 border-white/10 text-gray-400'
          )}
        >
          <Upload className="w-2.5 h-2.5 inline mr-1" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setUrlMode(true)}
          className={cn(
            'text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-150',
            urlMode
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              : 'bg-white/5 border-white/10 text-gray-400'
          )}
        >
          <Link2 className="w-2.5 h-2.5 inline mr-1" />
          Paste URL
        </button>
      </div>

      <AnimatePresence mode="wait">
        {urlMode ? (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => {
                  setUrlInput(e.target.value)
                  setUrlError('')
                }}
                placeholder="https://res.cloudinary.com/... or any image URL"
                className={cn(
                  'flex-1 px-3 py-2 rounded-xl text-xs bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all',
                  urlError ? 'border-red-500/50' : 'border-white/10'
                )}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleUrlSubmit()
                }}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 transition-all"
              >
                <Check className="w-3 h-3" />
                Use
              </button>
            </div>
            {urlError && (
              <p className="text-xs text-red-400">{urlError}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            {!upload.selectedFile && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center gap-2',
                  compact ? 'py-4' : 'py-6',
                  'rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
                  isDragging
                    ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                    : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200',
                  isDragging ? 'bg-purple-500/20' : 'bg-white/5'
                )}>
                  <ImagePlus className={cn(
                    'w-4 h-4',
                    isDragging ? 'text-purple-400' : 'text-gray-400'
                  )} />
                </div>

                <div className="text-center">
                  <p className="text-xs font-medium text-white">
                    {isDragging
                      ? 'Drop to upload!'
                      : compact
                      ? label
                      : 'Drag & drop or click to browse'}
                  </p>
                  {!compact && (
                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                      JPG, PNG, WebP, GIF, PDF · Max 10MB
                    </p>
                  )}
                </div>
              </div>
            )}

            {upload.selectedFile && (
              <ImagePreview
                file={upload.selectedFile}
                previewUrl={upload.previewUrl}
                onRemove={upload.reset}
              />
            )}

            <UploadProgress
              state={upload.uploadState}
              progress={upload.progress}
              fileName={upload.selectedFile?.name}
              onCancel={upload.cancelUpload}
            />

            {upload.error && upload.uploadState === 'error' && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {upload.error}
              </div>
            )}

            {upload.selectedFile && upload.uploadState !== 'uploading' && (
              <button
                type="button"
                onClick={handleUpload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-200 shadow-md shadow-purple-500/20"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload to Cloudinary
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}

export default CloudinaryUpload
