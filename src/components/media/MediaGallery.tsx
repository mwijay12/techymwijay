'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDisplayUrl } from '@/lib/cloudinary-service'
import type { VaultItem } from '@/types/vault'
import { CATEGORY_CONFIG } from '@/components/vault/CategoryBadge'

interface MediaGalleryProps {
  items: VaultItem[]
  onItemClick?: (item: VaultItem) => void
  className?: string
}

interface LightboxState {
  item: VaultItem
  index: number
}

export function MediaGallery({
  items,
  onItemClick,
  className,
}: MediaGalleryProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  const mediaItems = items.filter(i => i.imageUrl)

  if (mediaItems.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 text-center bg-white/5 rounded-3xl border border-white/10 p-8', className)}>
        <p className="text-4xl mb-3">🖼️</p>
        <p className="text-sm font-bold text-white mb-1">
          No media attachments
        </p>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Vault entries with images will appear here. Attach images when creating or editing entries.
        </p>
      </div>
    )
  }

  const openLightbox = (item: VaultItem, index: number) => {
    setLightbox({ item, index })
  }

  const closeLightbox = () => setLightbox(null)

  const goNext = () => {
    if (!lightbox) return
    const nextIndex = (lightbox.index + 1) % mediaItems.length
    setLightbox({ item: mediaItems[nextIndex], index: nextIndex })
  }

  const goPrev = () => {
    if (!lightbox) return
    const prevIndex =
      (lightbox.index - 1 + mediaItems.length) % mediaItems.length
    setLightbox({ item: mediaItems[prevIndex], index: prevIndex })
  }

  return (
    <>
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3', className)}>
        {mediaItems.map((item, index) => {
          const catConfig = CATEGORY_CONFIG[item.category]
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => openLightbox(item, index)}
            >
              <div className="aspect-square overflow-hidden bg-black/40">
                <img
                  src={
                    item.imageUrl
                      ? getDisplayUrl(item.imageUrl, 300)
                      : item.imageUrl ?? ''
                  }
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-[11px] font-semibold text-white truncate">
                    {item.title}
                  </p>
                </div>
              </div>

              <div className="absolute top-2 left-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white border border-white/10 flex items-center gap-1">
                  <catConfig.icon className="w-3 h-3 inline" /> {catConfig.label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md"
              onClick={closeLightbox}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[151] flex flex-col items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full max-w-4xl mb-4">
                <div>
                  <p className="text-sm font-bold text-white">
                    {lightbox.item.title}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {lightbox.index + 1} / {mediaItems.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={lightbox.item.imageUrl ?? ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                  <button
                    onClick={closeLightbox}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
                <img
                  src={lightbox.item.imageUrl ?? ''}
                  alt={lightbox.item.title}
                  className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-2xl"
                />

                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all border border-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all border border-white/10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MediaGallery
