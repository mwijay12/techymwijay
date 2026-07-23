'use client'

import { useState, useCallback, useRef } from 'react'
import {
  uploadToCloudinary,
  validateFile,
  type CloudinaryUploadResult,
} from '@/lib/cloudinary-service'

export type UploadState =
  | 'idle'
  | 'validating'
  | 'uploading'
  | 'success'
  | 'error'
  | 'cancelled'

export interface UseCloudinaryUploadReturn {
  uploadState: UploadState
  progress: number
  result: CloudinaryUploadResult | null
  error: string | null
  previewUrl: string | null
  selectedFile: File | null

  selectFile: (file: File) => void
  startUpload: (folder?: string) => Promise<CloudinaryUploadResult | null>
  cancelUpload: () => void
  clearUpload: () => void
  reset: () => void
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<CloudinaryUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const cancelRef = useRef<(() => void) | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const selectFile = useCallback((file: File) => {
    setError(null)
    setResult(null)
    setProgress(0)
    setUploadState('validating')

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid file')
      setUploadState('error')
      return
    }

    setSelectedFile(file)

    if (file.type.startsWith('image/')) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
      const url = URL.createObjectURL(file)
      previewUrlRef.current = url
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }

    setUploadState('idle')
  }, [])

  const startUpload = useCallback(
    async (folder = 'mwijaytech'): Promise<CloudinaryUploadResult | null> => {
      if (!selectedFile) {
        setError('No file selected')
        return null
      }

      setUploadState('uploading')
      setProgress(0)
      setError(null)

      const { promise, cancel } = uploadToCloudinary(selectedFile, {
        folder,
        onProgress: (percent) => setProgress(percent),
        onCancel: () => {
          setUploadState('cancelled')
          setProgress(0)
        },
      })

      cancelRef.current = cancel

      try {
        const uploadResult = await promise
        setResult(uploadResult)
        setUploadState('success')
        setProgress(100)
        return uploadResult
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed'
        if (message !== 'Upload cancelled') {
          setError(message)
          setUploadState('error')
        }
        return null
      } finally {
        cancelRef.current = null
      }
    },
    [selectedFile]
  )

  const cancelUpload = useCallback(() => {
    cancelRef.current?.()
  }, [])

  const clearUpload = useCallback(() => {
    setResult(null)
    setProgress(0)
    setUploadState('idle')
    setError(null)
  }, [])

  const reset = useCallback(() => {
    cancelRef.current?.()
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setUploadState('idle')
    setProgress(0)
    setResult(null)
    setError(null)
    setPreviewUrl(null)
    setSelectedFile(null)
  }, [])

  return {
    uploadState,
    progress,
    result,
    error,
    previewUrl,
    selectedFile,
    selectFile,
    startUpload,
    cancelUpload,
    clearUpload,
    reset,
  }
}
