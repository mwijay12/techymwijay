/**
 * Clipboard Monitor
 * Watches clipboard for URLs, code snippets, and text.
 * Offers to save detected content to the vault.
 */

const { clipboard } = require('electron')

let monitorInterval = null
let lastClipboardContent = ''
let mainWindow = null
let isEnabled = false

function detectContentType(text) {
  if (!text || text.trim().length < 3) return null

  try {
    const url = new URL(text.trim())
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return { type: 'url', content: text.trim() }
    }
  } catch {}

  const codePatterns = [
    /^(const|let|var|function|class|import|export|async|await)\s/m,
    /^\s*(def|class|import|from|if|for|while)\s/m,
    /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\s/im,
    /^<[a-zA-Z][^>]*>/m,
    /^\{[\s\S]*\}$/,
    /^#!/,
    /firebase|react|nextjs|typescript|javascript/i,
  ]

  const isCode = codePatterns.some((pattern) => pattern.test(text))
  if (isCode && text.length > 20) {
    return { type: 'code', content: text }
  }

  if (text.length > 100 && text.includes(' ')) {
    return { type: 'text', content: text }
  }

  return null
}

function startClipboardMonitor(win) {
  mainWindow = win
  isEnabled = true
  lastClipboardContent = clipboard.readText()

  monitorInterval = setInterval(() => {
    if (!isEnabled || !mainWindow || mainWindow.isDestroyed()) return

    try {
      const currentContent = clipboard.readText()

      if (
        currentContent &&
        currentContent !== lastClipboardContent &&
        currentContent.trim().length > 0
      ) {
        lastClipboardContent = currentContent
        const detected = detectContentType(currentContent)

        if (detected) {
          mainWindow.webContents.send('clipboard-content-detected', detected)
        }
      }
    } catch {}
  }, 2000)

  console.log('[Clipboard] Monitor started')
}

function stopClipboardMonitor() {
  isEnabled = false
  if (monitorInterval) {
    clearInterval(monitorInterval)
    monitorInterval = null
  }
  console.log('[Clipboard] Monitor stopped')
}

function toggleClipboardMonitor(enabled, win) {
  if (enabled) {
    startClipboardMonitor(win || mainWindow)
  } else {
    stopClipboardMonitor()
  }
  return enabled
}

function getClipboardText() {
  try {
    return clipboard.readText()
  } catch {
    return ''
  }
}

module.exports = {
  startClipboardMonitor,
  stopClipboardMonitor,
  toggleClipboardMonitor,
  getClipboardText,
}
