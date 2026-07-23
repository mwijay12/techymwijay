/**
 * Cloudinary Service
 * Handles direct browser uploads to Cloudinary using unsigned presets.
 * No server-side signing required — safe for personal use with unsigned preset.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'kgwfenp9'
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'mwijaytech'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
])

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Allowed: JPG, PNG, WebP, GIF, PDF',
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File too large (${sizeMB}MB). Maximum size is 10MB`,
    }
  }

  return { valid: true }
}

export interface CloudinaryUploadResult {
  secureUrl: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
  resourceType: string
}

export interface UploadOptions {
  folder?: string
  onProgress?: (percent: number) => void
  onCancel?: () => void
}

export function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): {
  promise: Promise<CloudinaryUploadResult>
  cancel: () => void
} {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return {
      promise: Promise.reject(
        new Error(
          'Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local'
        )
      ),
      cancel: () => {},
    }
  }

  const xhr = new XMLHttpRequest()
  let cancelled = false

  const promise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options.onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100)
        options.onProgress(percent)
      }
    })

    xhr.addEventListener('load', () => {
      if (cancelled) return

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve({
            secureUrl: data.secure_url,
            publicId: data.public_id,
            width: data.width ?? 0,
            height: data.height ?? 0,
            format: data.format ?? 'unknown',
            bytes: data.bytes ?? 0,
            resourceType: data.resource_type ?? 'image',
          })
        } catch {
          reject(new Error('Invalid response from Cloudinary'))
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText)
          reject(
            new Error(
              errData.error?.message ?? `Upload failed: HTTP ${xhr.status}`
            )
          )
        } catch {
          reject(new Error(`Upload failed: HTTP ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error', () => {
      if (!cancelled) {
        reject(new Error('Network error during upload. Check your connection.'))
      }
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'))
    })

    xhr.open('POST', UPLOAD_URL)
    xhr.send(formData)
  })

  const cancel = () => {
    cancelled = true
    xhr.abort()
    options.onCancel?.()
  }

  return { promise, cancel }
}

export function getOptimizedUrl(
  secureUrl: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'fill' | 'limit' | 'scale' | 'fit'
  } = {}
): string {
  if (!secureUrl || !secureUrl.includes('cloudinary.com')) {
    return secureUrl
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options

  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (width || height) transformations.push(`c_${crop}`)
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  const transformation = transformations.join(',')

  return secureUrl.replace('/upload/', `/upload/${transformation}/`)
}

export function getThumbnailUrl(
  secureUrl: string,
  size: number = 100
): string {
  return getOptimizedUrl(secureUrl, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  })
}

export function getDisplayUrl(
  secureUrl: string,
  maxWidth: number = 800
): string {
  return getOptimizedUrl(secureUrl, {
    width: maxWidth,
    quality: 'auto',
    format: 'auto',
    crop: 'limit',
  })
}

export function isCloudinaryUrl(url: string): boolean {
  return url?.includes('res.cloudinary.com') ?? false
}

export function isPdfUrl(url: string): boolean {
  return (
    url?.toLowerCase().includes('.pdf') ||
    url?.includes('/raw/') ||
    false
  )
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET)
}
