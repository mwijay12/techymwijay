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
let currentLanguage = 'sw-TZ'

chrome.storage.sync.get('mwijay_lang', ({ mwijay_lang }) => {
  if (mwijay_lang && mwijay_lang !== 'auto') {
    currentLanguage = mwijay_lang.startsWith('en') ? 'en-US' : 'sw-TZ'
  }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.mwijay_lang) {
    const language = changes.mwijay_lang.newValue
    currentLanguage = language && language.startsWith('en') ? 'en-US' : 'sw-TZ'
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

  if (el.disabled || el.readOnly || el.getAttribute('aria-hidden') === 'true') return false
  if (tag === 'textarea') return true
  if (tag === 'input') {
    const allowedTypes = ['text', 'search', 'email', 'url', 'tel', '', undefined]
    return allowedTypes.includes(type)
  }
  if (el.isContentEditable && el.getAttribute('contenteditable') !== 'false') return true
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

  btn.style.top = `${inputEl.getBoundingClientRect().top + inputEl.getBoundingClientRect().height / 2 - 14}px`
  btn.style.left = `${inputEl.getBoundingClientRect().right - 34}px`

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
    finalTranscript = ''
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
  const languageBadge = overlayEl?.querySelector('.mwijay-lang-badge')
  if (languageBadge) languageBadge.textContent = currentLanguage === 'en-US' ? '🇺🇸 EN' : '🇹🇿 SW'

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
      const display = finalTranscript + (interim ? ` ${interim}` : '')
      textEl.textContent = display || 'Listening...'
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
    isRecording = false
    if (activeMicBtn) activeMicBtn.classList.remove('recording')
    removeOverlay()
    showToast('⚠️ Could not start dictation. Check microphone access and try again.')
    console.error('[Mwijay Extension] Start error:', err)
  }
}

function stopDictation() {
  isRecording = false
  if (recognition) {
    try { recognition.stop() } catch {}
    recognition = null
  }

  if (activeMicBtn) {
    activeMicBtn.classList.remove('recording')
  }
}

function insertTextIntoActiveInput(text) {
  const el = activeInput || document.activeElement
  if (!text || !el || !isTextInput(el)) return false

  if (el.isContentEditable) {
    el.focus()
    const inserted = document.execCommand('insertText', false, text)
    if (!inserted) el.append(document.createTextNode(text))
  } else {
    const start = Number.isInteger(el.selectionStart) ? el.selectionStart : el.value.length
    const end = Number.isInteger(el.selectionEnd) ? el.selectionEnd : start
    const nextValue = `${el.value.slice(0, start)}${text}${el.value.slice(end)}`
    const prototype = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
    if (setter) setter.call(el, nextValue)
    else el.value = nextValue
    const caret = start + text.length
    try { el.setSelectionRange(caret, caret) } catch {}
  }

  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
  return true
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

function repositionMicButton() {
  if (!activeMicBtn || !activeInput?.isConnected) return
  const rect = activeInput.getBoundingClientRect()
  activeMicBtn.style.top = `${rect.top + rect.height / 2 - 14}px`
  activeMicBtn.style.left = `${rect.right - 34}px`
}

window.addEventListener('scroll', repositionMicButton, true)
window.addEventListener('resize', repositionMicButton)

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
  } else if (message.type === 'INSERT_TEXT') {
    const success = insertTextIntoActiveInput(message.text || '');
    sendResponse({ success });
  } else if (message.type === 'READ_ALOUD') {
    const text = message.text || window.getSelection()?.toString()
    if (text) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = currentLanguage
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
