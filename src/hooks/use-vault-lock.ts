'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import {
  getVaultLockStatus,
  verifyAndUnlock,
  setupMasterPassword,
  lockVault,
  updateLastActive,
  shouldAutoLock,
  type VaultLockStatus,
} from '@/lib/vault-lock'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAppSettings } from '@/hooks/use-app-settings'

interface UseVaultLockReturn {
  lockStatus: VaultLockStatus
  isUnlocked: boolean
  isLocked: boolean
  needsSetup: boolean
  isLoading: boolean

  unlock: (password: string) => Promise<boolean>
  setup: (password: string) => Promise<void>
  lock: () => void

  masterPassword: string | null
}

export function useVaultLock(): UseVaultLockReturn {
  const { user } = useAuth()
  const { settings } = useAppSettings()
  const [lockStatus, setLockStatus] = useState<VaultLockStatus>('loading')
  const [masterPassword, setMasterPassword] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const targetUid = user?.uid || 'guest-user'
    const status = getVaultLockStatus(targetUid)
    setLockStatus(status)

    if (status !== 'unlocked') {
      setMasterPassword(null)
    }
  }, [user?.uid])

  useEffect(() => {
    const targetUid = user?.uid || 'guest-user'
    if (lockStatus !== 'unlocked') return
    const autoLockMinutes = settings.vault?.autoLockMinutes ?? 15

    if (autoLockTimerRef.current) {
      clearInterval(autoLockTimerRef.current)
    }

    if (autoLockMinutes === 0) return

    autoLockTimerRef.current = setInterval(() => {
      if (shouldAutoLock(targetUid, autoLockMinutes)) {
        handleLock()
      }
    }, 30_000)

    const handleActivity = () => updateLastActive(targetUid)
    window.addEventListener('click', handleActivity, { passive: true })
    window.addEventListener('keydown', handleActivity, { passive: true })

    return () => {
      if (autoLockTimerRef.current) {
        clearInterval(autoLockTimerRef.current)
      }
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [user?.uid, lockStatus, settings.vault?.autoLockMinutes])

  const unlock = useCallback(
    async (password: string): Promise<boolean> => {
      const targetUid = user?.uid || 'guest-user'

      setIsLoading(true)
      try {
        const success = await verifyAndUnlock(targetUid, password)

        if (success) {
          setMasterPassword(password)
          setLockStatus('unlocked')
        }

        return success
      } finally {
        setIsLoading(false)
      }
    },
    [user?.uid]
  )

  const setup = useCallback(
    async (password: string): Promise<void> => {
      const targetUid = user?.uid || 'guest-user'

      setIsLoading(true)
      try {
        await setupMasterPassword(targetUid, password)
        setMasterPassword(password)
        setLockStatus('unlocked')
      } finally {
        setIsLoading(false)
      }
    },
    [user?.uid]
  )

  const handleLock = useCallback(() => {
    const targetUid = user?.uid || 'guest-user'
    lockVault(targetUid)
    setMasterPassword(null)
    setLockStatus('locked')
  }, [user?.uid])

  return {
    lockStatus,
    isUnlocked: lockStatus === 'unlocked',
    isLocked: lockStatus === 'locked',
    needsSetup: lockStatus === 'no_password',
    isLoading,
    unlock,
    setup,
    lock: handleLock,
    masterPassword,
  }
}
