/**
 * Mwijay Tech Extension — Content Script
 * Injected into webpages; mounts isolated UI and handles dictation and quick actions.
 */

'use strict'

let uiRoot = null
let activeMicBtn = null
let activeInput = null
let activeSelection = null
let dictationTarget = null
let dictationSelection = null
let pendingInsert = false
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

function ensureUIRoot() {
  if (uiRoot?.host?.isConnected) return uiRoot
  const host = document.createElement('div')
  host.id = 'mwijay-extension-ui'
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;'
  uiRoot = host.attachShadow({ mode: 'open' })
  const stylesheet = document.createElement('link')
  stylesheet.rel = 'stylesheet'
  stylesheet.href = chrome.runtime.getURL('styles.css')
  uiRoot.appendChild(stylesheet)
  document.documentElement.appendChild(host)
  return uiRoot
}

function deepActiveElement() {
  let el = document.activeElement
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el
}

function isTextInput(el) {
  if (!el || typeof el.getAttribute !== 'function') return false
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

function getEditableTarget(el) {
  if (!isTextInput(el)) return null
  if (!el.isContentEditable) return el
  let root = el
  while (root.parentElement?.isContentEditable) root = root.parentElement
  return root
}

function captureSelection(el) {
  if (!el || !isTextInput(el)) return null
  if (!el.isContentEditable) {
    return {
      kind: 'input',
      start: Number.isInteger(el.selectionStart) ? el.selectionStart : el.value.length,
      end: Number.isInteger(el.selectionEnd) ? el.selectionEnd : el.value.length,
    }
  }

  const selection = window.getSelection()
  if (!selection?.rangeCount) return null
  const range = selection.getRangeAt(0)
  if (!el.contains(range.startContainer) || !el.contains(range.endContainer)) return null
  return { kind: 'range', range: range.cloneRange() }
}

function getEditableTextAroundRange(el, range) {
  const beforeRange = document.createRange()
  beforeRange.selectNodeContents(el)
  beforeRange.setEnd(range.startContainer, range.startOffset)
  const afterRange = document.createRange()
  afterRange.selectNodeContents(el)
  afterRange.setStart(range.endContainer, range.endOffset)
  return { before: beforeRange.toString(), after: afterRange.toString() }
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

  btn.addEventListener('mousedown', (e) => e.preventDefault())
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

  ensureUIRoot().appendChild(btn)
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

  ensureUIRoot().appendChild(overlay)
  overlayEl = overlay

  overlay.querySelector('#mwijayOverlayClose')?.addEventListener('click', () => {
    finalTranscript = ''
    pendingInsert = false
    dictationTarget = null
    dictationSelection = null
    stopDictation()
    removeOverlay()
  })

  overlay.querySelector('#mwijayOverlayDiscard')?.addEventListener('click', () => {
    finalTranscript = ''
    pendingInsert = false
    dictationTarget = null
    dictationSelection = null
    stopDictation()
    removeOverlay()
  })

  overlay.querySelector('#mwijayOverlayInsert')?.addEventListener('click', () => {
    if (isRecording) {
      pendingInsert = true
      stopDictation()
      return
    }
    insertDictationResult()
  })

  return overlay
}

function insertDictationResult() {
  pendingInsert = false
  insertTextIntoActiveInput(finalTranscript, dictationTarget, dictationSelection)
  dictationTarget = null
  dictationSelection = null
  removeOverlay()
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
  dictationTarget = getEditableTarget(inputEl)
  dictationSelection = captureSelection(dictationTarget)
  if (!dictationTarget) {
    showToast('⚠️ Focus an editable text field before dictating')
    return
  }
  pendingInsert = false
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
      finalTranscript += MwijayTextUtils.joinUtterance(finalTranscript, localFinal)
    }

    const textEl = uiRoot?.querySelector('#mwijayTranscriptText')
    if (textEl) {
      const display = finalTranscript + (interim ? MwijayTextUtils.joinUtterance(finalTranscript, interim) : '')
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
      return
    }
    // SpeechRecognition may emit one final result after stop() was requested.
    if (pendingInsert) insertDictationResult()
  }

  try {
    isRecording = true
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

function insertTextIntoActiveInput(text, target = activeInput, savedSelection = activeSelection) {
  const el = target || document.activeElement
  if (!text || !el || !isTextInput(el)) return false

  if (el.isContentEditable) {
    let range = savedSelection?.kind === 'range' ? savedSelection.range.cloneRange() : null
    if (!range || !el.contains(range.startContainer) || !el.contains(range.endContainer)) {
      const current = window.getSelection()
      if (current?.rangeCount && el.contains(current.anchorNode)) {
        range = current.getRangeAt(0).cloneRange()
      } else {
        range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
      }
    }

    const { before, after } = getEditableTextAroundRange(el, range)
    const insertion = MwijayTextUtils.joinUtterance(before, text, after)
    if (!insertion) return false

    el.focus()
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    // Use the browser editing pipeline first so rich editors receive a native edit.
    if (!document.execCommand('insertText', false, insertion)) {
      range.deleteContents()
      const textNode = document.createTextNode(insertion)
      range.insertNode(textNode)
      range.setStartAfter(textNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: insertion }))
    }
    activeInput = el
    activeSelection = captureSelection(el)
    return true
  }

  const currentSelection = savedSelection?.kind === 'input' ? savedSelection : captureSelection(el)
  const start = currentSelection?.start ?? el.value.length
  const end = currentSelection?.end ?? start
  const result = MwijayTextUtils.insertAtCaret(el.value, text, start, end)
  if (!result.insertedText) return false

  const prototype = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  if (setter) setter.call(el, result.value)
  else el.value = result.value
  try { el.setSelectionRange(result.cursor, result.cursor) } catch {}
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: result.insertedText }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
  activeInput = el
  activeSelection = captureSelection(el)
  return true
}

function showToast(message) {
  const root = ensureUIRoot()
  const existing = root.querySelector('.mwijay-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = 'mwijay-toast'
  toast.textContent = message
  root.appendChild(toast)

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

function rememberEditableSelection(event) {
  const path = event?.composedPath?.() || [event?.target]
  const eventTarget = path.find((node) => isTextInput(node))
  const target = eventTarget ? getEditableTarget(eventTarget) : activeInput
  if (target && (target === activeInput || target === deepActiveElement() || target.isContentEditable)) {
    activeInput = target
    activeSelection = captureSelection(target) || activeSelection
  }
}

document.addEventListener('focusin', (e) => {
  const path = e.composedPath?.() || [e.target]
  const target = getEditableTarget(path.find((node) => isTextInput(node)))
  if (target) {
    activeInput = target
    activeSelection = captureSelection(target)
    createMicButton(target)
  }
})

document.addEventListener('selectionchange', () => {
  if (activeInput?.isContentEditable) rememberEditableSelection()
  else if (activeInput && deepActiveElement() === activeInput) rememberEditableSelection()
})
for (const eventName of ['keyup', 'click', 'input']) {
  document.addEventListener(eventName, (event) => {
    if (isTextInput(event.target)) rememberEditableSelection(event)
  }, true)
}

document.addEventListener('focusout', (event) => {
  const path = event.composedPath?.() || [event.target]
  const blurred = getEditableTarget(path.find((node) => isTextInput(node)))
  if (blurred && blurred === activeInput) {
    activeSelection = captureSelection(blurred) || activeSelection
  }
  setTimeout(() => {
    if (!deepActiveElement() || !isTextInput(deepActiveElement())) {
      if (!isRecording) {
        removeMicButton()
      }
    }
  }, 200)
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_DICTATION') {
    const focused = getEditableTarget(deepActiveElement())
    activeInput = focused
    activeSelection = captureSelection(focused)
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

console.log('[Mwijay Tech Extension] Content script active with reviewed dictation and local tools')
