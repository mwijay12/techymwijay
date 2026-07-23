/**
 * Vault Lock Manager
 * Handles master password setup, verification, session management,
 * and auto-lock logic.
 */

import {
  createVerificationHash,
  verifyMasterPassword,
} from '@/lib/encryption'

const getVerifyKey = (userId: string) => `mwijay_vault_verify_${userId}`
const getSessionKey = (userId: string) => `mwijay_vault_session_${userId}`
const getLastActiveKey = (userId: string) => `mwijay_vault_active_${userId}`

export interface VaultVerifyData {
  verifyHash: string
  verifySalt: string
  setupAt: string
  version: '1'
}

export type VaultLockStatus =
  | 'no_password'
  | 'locked'
  | 'unlocked'
  | 'loading'

export function hasVaultPassword(userId: string): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(getVerifyKey(userId))
}

export function getVaultLockStatus(userId: string): VaultLockStatus {
  if (typeof window === 'undefined') return 'loading'

  if (!hasVaultPassword(userId)) return 'no_password'

  const session = sessionStorage.getItem(getSessionKey(userId))
  if (session === 'unlocked') return 'unlocked'

  return 'locked'
}

export async function setupMasterPassword(
  userId: string,
  password: string
): Promise<void> {
  const { hash, salt } = await createVerificationHash(password, userId)

  const verifyData: VaultVerifyData = {
    verifyHash: hash,
    verifySalt: salt,
    setupAt: new Date().toISOString(),
    version: '1',
  }

  localStorage.setItem(getVerifyKey(userId), JSON.stringify(verifyData))
  unlockVault(userId)
}

export async function verifyAndUnlock(
  userId: string,
  password: string
): Promise<boolean> {
  const stored = localStorage.getItem(getVerifyKey(userId))
  if (!stored) return false

  const verifyData: VaultVerifyData = JSON.parse(stored)

  const isValid = await verifyMasterPassword(
    password,
    verifyData.verifyHash,
    verifyData.verifySalt,
    userId
  )

  if (isValid) {
    unlockVault(userId)
  }

  return isValid
}

export function unlockVault(userId: string): void {
  sessionStorage.setItem(getSessionKey(userId), 'unlocked')
  updateLastActive(userId)
}

export function lockVault(userId: string): void {
  sessionStorage.removeItem(getSessionKey(userId))
  sessionStorage.removeItem(getLastActiveKey(userId))
}

export function updateLastActive(userId: string): void {
  sessionStorage.setItem(getLastActiveKey(userId), Date.now().toString())
}

export function shouldAutoLock(
  userId: string,
  autoLockMinutes: number
): boolean {
  if (autoLockMinutes === 0) return false

  const lastActive = sessionStorage.getItem(getLastActiveKey(userId))
  if (!lastActive) return false

  const elapsed = Date.now() - parseInt(lastActive, 10)
  const limitMs = autoLockMinutes * 60 * 1000

  return elapsed > limitMs
}

export async function changeMasterPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const { hash, salt } = await createVerificationHash(newPassword, userId)

  const verifyData: VaultVerifyData = {
    verifyHash: hash,
    verifySalt: salt,
    setupAt: new Date().toISOString(),
    version: '1',
  }

  localStorage.setItem(getVerifyKey(userId), JSON.stringify(verifyData))
  unlockVault(userId)
}

export function removeVaultPassword(userId: string): void {
  localStorage.removeItem(getVerifyKey(userId))
  lockVault(userId)
}
