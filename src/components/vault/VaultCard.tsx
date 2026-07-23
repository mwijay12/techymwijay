'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Pin,
  PinOff,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock,
  Tag,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { CategoryBadge, CATEGORY_CONFIG } from './CategoryBadge'
import { maskSecret, decryptSecret } from '@/lib/encryption'
import { getDaysUntilExpiry, isItemExpired } from '@/lib/vault-service'
import type { VaultItem } from '@/types/vault'
import { ReadAloudButton } from '@/components/tts/ReadAloudButton'
import { CloudinaryImage } from '@/components/media/CloudinaryImage'

interface VaultCardProps {
  item: VaultItem
  masterPassword?: string | null
  onEdit: (item: VaultItem) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
}

function ActionButton({
  onClick,
  title,
  icon,
  variant = 'default',
}: {
  onClick: () => void
  title: string
  icon: React.ReactNode
  variant?: 'default' | 'danger'
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-6 h-6 rounded-lg flex items-center justify-center',
        'transition-all duration-150',
        variant === 'danger'
          ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
          : 'text-gray-400 hover:text-white hover:bg-white/10'
      )}
    >
      {icon}
    </button>
  )
}

export function VaultCard({
  item,
  masterPassword,
  onEdit,
  onDelete,
  onPin,
}: VaultCardProps) {
  const [showSecret, setShowSecret] = useState(false)
  const [decryptedText, setDecryptedText] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.notes
  const daysUntilExpiry = getDaysUntilExpiry(item)
  const expired = isItemExpired(item)

  const toggleSecretReveal = async () => {
    if (showSecret) {
      setShowSecret(false)
      return
    }

    if (!item.secretContent) return

    if (item.secretContentEncrypted && masterPassword) {
      setIsDecrypting(true)
      try {
        const plain = await decryptSecret(item.secretContent, masterPassword, item.userId || 'guest-user')
        setDecryptedText(plain)
        setShowSecret(true)
      } catch (err) {
        console.warn('Decryption failed:', err)
      } finally {
        setIsDecrypting(false)
      }
    } else {
      setDecryptedText(item.secretContent)
      setShowSecret(true)
    }
  }

  const handleCopySecret = async () => {
    let textToCopy = decryptedText || item.secretContent
    if (!textToCopy) return

    if (item.secretContentEncrypted && item.secretContent && !decryptedText && masterPassword) {
      try {
        textToCopy = await decryptSecret(item.secretContent, masterPassword, item.userId || 'guest-user')
      } catch {
        return
      }
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.warn('Copy failed')
    }
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(item.id)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const isCode = item.category === 'code'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative bg-white/5 backdrop-blur-xl rounded-2xl border overflow-hidden',
        'transition-all duration-300 hover:border-white/20',
        expired
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-white/10 hover:border-purple-500/30',
        item.isPinned && 'ring-1 ring-purple-500/30'
      )}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: expired ? '#ef4444' : config.color,
      }}
    >
      {item.isPinned && (
        <div className="absolute top-3 right-3 z-10">
          <Pin className="w-3 h-3 text-purple-400 fill-purple-400" />
        </div>
      )}

      {expired && (
        <div className="px-4 py-1.5 bg-red-500/10 border-b border-red-500/20 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-xs text-red-400 font-medium">Expired</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <CategoryBadge category={item.category} size="sm" />
            <h3 className="text-sm font-semibold text-white mt-1.5 truncate pr-6 group-hover:text-purple-300 transition-colors duration-200">
              {item.title}
            </h3>
          </div>
        </div>

        {item.content && (
          <p className="text-xs text-gray-300 mb-3 line-clamp-2 leading-relaxed">
            {item.content}
          </p>
        )}

        {item.imageUrl && (
          <div className="mb-3">
            <CloudinaryImage url={item.imageUrl} alt={item.title} />
          </div>
        )}

        {item.secretContent && (
          <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/40">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                {item.category === 'code'
                  ? 'Code'
                  : item.category === 'passwords'
                  ? 'Password'
                  : 'Key'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopySecret}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  onClick={toggleSecretReveal}
                  disabled={isDecrypting}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
                  title={showSecret ? 'Hide' : 'Reveal'}
                >
                  {isDecrypting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : showSecret ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div
              className={cn(
                'px-3 py-2 text-xs font-mono break-all',
                isCode && showSecret
                  ? 'bg-black/60 text-emerald-300 whitespace-pre-wrap'
                  : 'bg-black/20 text-gray-300'
              )}
            >
              {showSecret
                ? decryptedText || item.secretContent
                : maskSecret(item.secretContent || '')}
            </div>
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="text-[10px] text-gray-500 self-center">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {daysUntilExpiry !== null && !expired && daysUntilExpiry <= 7 && (
          <div className="flex items-center gap-1.5 mb-3 text-[10px] text-yellow-400">
            <Clock className="w-3 h-3" />
            <span>Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] text-gray-500">
            {formatDistanceToNow(new Date(item.updatedAt || item.createdAt), { addSuffix: true })}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ReadAloudButton text={`${item.title}. ${item.content || ''}`} size="xs" showLabel={false} />
            <ActionButton
              onClick={() => onPin(item.id)}
              title={item.isPinned ? 'Unpin' : 'Pin to top'}
              icon={item.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            />
            <ActionButton
              onClick={() => onEdit(item)}
              title="Edit"
              icon={<Edit3 className="w-3.5 h-3.5" />}
            />
            <ActionButton
              onClick={handleDelete}
              title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              variant={showDeleteConfirm ? 'danger' : 'default'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VaultCard
