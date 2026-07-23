/**
 * AES-256-GCM Client-Side Encryption
 * Uses Web Crypto API — zero external dependencies.
 * All encryption/decryption happens in the browser.
 * The master password NEVER leaves the device.
 *
 * Storage format: Base64([salt:16][iv:12][ciphertext:N])
 */

const SALT_LENGTH = 16
const IV_LENGTH = 12
const PBKDF2_ITERATIONS = 310_000
const KEY_LENGTH = 256

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer
}

function bufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer)
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  usage: KeyUsage[]
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    usage
  )
}

export async function encryptSecret(
  plaintext: string,
  password: string,
  userSalt: string = ''
): Promise<string> {
  if (!plaintext) return ''
  if (!password) throw new Error('Master password required for encryption')

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const combinedPassword = `${password}:${userSalt}`

  const key = await deriveKey(combinedPassword, salt, ['encrypt'])

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    stringToBuffer(plaintext)
  )

  const combined = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + ciphertext.byteLength
  )
  combined.set(salt, 0)
  combined.set(iv, SALT_LENGTH)
  combined.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH)

  return arrayBufferToBase64(combined.buffer)
}

export async function decryptSecret(
  encryptedBase64: string,
  password: string,
  userSalt: string = ''
): Promise<string> {
  if (!encryptedBase64) return ''
  if (!password) throw new Error('Master password required for decryption')

  if (!isEncryptedFormat(encryptedBase64)) {
    return encryptedBase64
  }

  try {
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64))
    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH)

    const combinedPassword = `${password}:${userSalt}`
    const key = await deriveKey(combinedPassword, salt, ['decrypt'])

    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )

    return bufferToString(plaintext)
  } catch {
    throw new Error('Decryption failed — incorrect master password or corrupted data')
  }
}

export async function createVerificationHash(
  password: string,
  userSalt: string = ''
): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const verifyString = `MWIJAY_VAULT_VERIFY:${password}:${userSalt}`

  const key = await deriveKey(
    verifyString,
    salt,
    ['encrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const token = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    stringToBuffer('VERIFIED')
  )

  const combined = new Uint8Array(IV_LENGTH + token.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(token), IV_LENGTH)

  return {
    hash: arrayBufferToBase64(combined.buffer),
    salt: arrayBufferToBase64(salt.buffer),
  }
}

export async function verifyMasterPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
  userSalt: string = ''
): Promise<boolean> {
  try {
    const salt = new Uint8Array(base64ToArrayBuffer(storedSalt))
    const combined = new Uint8Array(base64ToArrayBuffer(storedHash))
    const iv = combined.slice(0, IV_LENGTH)
    const ciphertext = combined.slice(IV_LENGTH)

    const verifyString = `MWIJAY_VAULT_VERIFY:${password}:${userSalt}`
    const key = await deriveKey(verifyString, salt, ['decrypt'])

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )

    return bufferToString(decrypted) === 'VERIFIED'
  } catch {
    return false
  }
}

export function isEncryptedFormat(value: string): boolean {
  if (!value || value.length < 40) return false
  try {
    const decoded = atob(value)
    return decoded.length >= SALT_LENGTH + IV_LENGTH + 1
  } catch {
    return false
  }
}

export function maskSecret(
  value: string,
  visibleChars: number = 4
): string {
  if (!value) return '••••••••••••'

  if (isEncryptedFormat(value)) {
    return '🔒 ••••••••••••••••••••'
  }

  if (value.length <= visibleChars) {
    return '••••••••'
  }

  const masked = '•'.repeat(Math.min(16, value.length - visibleChars))
  const visible = value.slice(-visibleChars)
  return `${masked}${visible}`
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
  suggestions: string[]
}

export function assessPasswordStrength(password: string): PasswordStrength {
  let score = 0
  const suggestions: string[] = []

  if (password.length >= 8) score++
  else suggestions.push('Use at least 8 characters')

  if (password.length >= 12) score++
  else if (password.length >= 8) suggestions.push('Use 12+ characters for better security')

  if (/[A-Z]/.test(password)) score++
  else suggestions.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score++
  else suggestions.push('Add numbers')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else suggestions.push('Add special characters (!@#$...)')

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-blue-500',
    'text-green-500',
  ]

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
    suggestions: suggestions.slice(0, 2),
  }
}
