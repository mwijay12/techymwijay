/**
 * Mwijay Tech Extension — Content Script
 * Injected into every webpage.
 * Provides voice dictation mic button, selection quick-save, and toast notifications.
 */

'use strict'

let activeMicBtn = null
let activeInput = null
let overlayEl = null
let recognition = null
let isRecording = false
let finalTranscript = ''
let currentLanguage = 'sw-KE'

chrome.storage.sync.get('mwijay_lang', ({ mwijay_lang }) => {
  if (mwijay_lang && mwijay_lang !== 'auto') {
    currentLanguage = mwijay_lang
  }
})

const MIC_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="white">
  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
</svg>`

function isTextInput(el) {
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  const type = el.type?.toLowerCase()

  if (tag === 'textarea') return true
  if (tag === 'input') {
    const allowedTypes = ['text', 'search', 'email', 'url', 'tel', 'password', '', undefined]
    return allowedTypes.includes(type)
  }
  if (el.contentEditable === 'true') return true
  return false
}

function getInputPosition(el) {
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  }
}

function createMicButton(inputEl) {
  removeMicButton()

  const pos = getInputPosition(inputEl)
  if (pos.width < 80 || pos.height < 20) return

  const btn = document.createElement('button')
  btn.className = 'mwijay-mic-btn'
  btn.innerHTML = MIC_SVG
  btn.title = 'Mwijay Tech: Click to dictate (Alt+M)'
  btn.setAttribute('aria-label', 'Start voice dictation')

  btn.style.top = `${pos.top + pos.height / 2 - 14}px`
  btn.style.left = `${pos.right - 34}px`

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isRecording) {
      stopDictation()
    } else {
      activeInput = inputEl
      startDictation(inputEl)
    }
  })

  document.body.appendChild(btn)
  activeMicBtn = btn

  return btn
}

function removeMicButton() {
  if (activeMicBtn) {
    activeMicBtn.remove()
    activeMicBtn = null
  }
}

function createOverlay() {
  removeOverlay()

  const overlay = document.createElement('div')
  overlay.className = 'mwijay-overlay'
  overlay.innerHTML = `
    <div class="mwijay-overlay-header">
      <div class="mwijay-overlay-title">
        <div class="mwijay-recording-dot"></div>
        🎙️ Mwijay Tech — Dictating
        <span class="mwijay-lang-badge">🌍 SW-EN</span>
      </div>
      <button class="mwijay-overlay-close" id="mwijayOverlayClose">✕</button>
    </div>
    <div class="mwijay-transcript" id="mwijayTranscriptText">
      Listening... Speak in Swahili or English
    </div>
    <div class="mwijay-overlay-actions">
      <button class="mwijay-btn mwijay-btn-secondary" id="mwijayOverlayDiscard">Discard</button>
      <button class="mwijay-btn mwijay-btn-primary" id="mwijayOverlayInsert">Insert Text ✓</button>
    </div>
  `

  document.body.appendChild(overlay)
  overlayEl = overlay

  document.getElementById('mwijayOverlayClose')?.addEventListener('click', () => {
    stopDictation()
    removeOverlay()
  })

  document.getElementById('mwijayOverlayDiscard')?.addEventListener('click', () => {
    finalTranscript = ''
    stopDictation()
    removeOverlay()
  })

  document.getElementById('mwijayOverlayInsert')?.addEventListener('click', () => {
    stopDictation()
    insertTextIntoActiveInput(finalTranscript)
    removeOverlay()
  })

  return overlay
}

function removeOverlay() {
  if (overlayEl) {
    overlayEl.remove()
    overlayEl = null
  }
}

function startDictation(inputEl) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    showToast('⚠️ Speech recognition not supported')
    return
  }

  finalTranscript = ''
  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = currentLanguage

  createOverlay()

  if (activeMicBtn) {
    activeMicBtn.classList.add('recording')
  }

  recognition.onstart = () => {
    isRecording = true
  }

  recognition.onresult = (event) => {
    let interim = ''
    let localFinal = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        localFinal += result[0].transcript
      } else {
        interim += result[0].transcript
      }
    }

    if (localFinal) {
      finalTranscript += (finalTranscript ? ' ' : '') + localFinal
    }

    const textEl = document.getElementById('mwijayTranscriptText')
    if (textEl) {
      const display = finalTranscript + (interim ? ` <span class="mwijay-interim">${interim}</span>` : '')
      textEl.innerHTML = display || 'Listening...'
    }

    if (inputEl && isTextInput(inputEl)) {
      insertTextIntoActiveInput(finalTranscript + (interim ? ' ' + interim : ''))
    }
  }

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      showToast('⚠️ Microphone permission required! Please allow mic access.')
      chrome.runtime.sendMessage({ type: 'OPEN_MIC_PERMISSION' })
    } else if (event.error !== 'aborted') {
      showToast(`⚠️ Dictation error: ${event.error}`)
    }
    stopDictation()
  }

  recognition.onend = () => {
    if (isRecording) {
      try {
        recognition.start()
      } catch {
        stopDictation()
      }
    }
  }

  try {
    recognition.start()
  } catch (err) {
    console.error('[Mwijay Extension] Start error:', err)
  }
}

function stopDictation() {
  isRecording = false
  if (recognition) {
    recognition.stop()
    recognition = null
  }

  if (activeMicBtn) {
    activeMicBtn.classList.remove('recording')
  }
}

function insertTextIntoActiveInput(text) {
  const el = activeInput || document.activeElement
  if (!el || !isTextInput(el)) return

  if (el.isContentEditable) {
    el.innerText = text
  } else {
    el.value = text
  }

  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

function showToast(message) {
  const existing = document.querySelector('.mwijay-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = 'mwijay-toast'
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 2500)
}

document.addEventListener('focusin', (e) => {
  if (isTextInput(e.target)) {
    activeInput = e.target
    createMicButton(e.target)
  }
})

document.addEventListener('focusout', () => {
  setTimeout(() => {
    if (!document.activeElement || !isTextInput(document.activeElement)) {
      if (!isRecording) {
        removeMicButton()
      }
    }
  }, 200)
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_DICTATION') {
    const focused = document.activeElement
    activeInput = isTextInput(focused) ? focused : null
    startDictation(activeInput)
    sendResponse({ success: true })
  } else if (message.type === 'READ_ALOUD') {
    const text = message.text || window.getSelection()?.toString()
    if (text) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'sw-KE'
      u.rate = 0.95
      window.speechSynthesis.speak(u)
      showToast('🔊 Reading text aloud...')
    } else {
      showToast('⚠️ Select text to read aloud')
    }
    sendResponse({ success: true })
  } else if (message.type === 'VAULT_ITEM_SAVED') {
    showToast(message.message || '🔐 Item saved to Mwijay Vault!')
    sendResponse({ success: true })
  }
  return true
})

console.log('[Mwijay Tech Extension] Content script active with password & vault tools')
