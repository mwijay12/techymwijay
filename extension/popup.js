/**
 * Mwijay Tech Extension — Popup Script v1.2.0
 * Handles Auth Session, Passwords Vault, Web Snippets, STT dictation,
 * and Multi-Engine TTS (ElevenLabs, Puter.js, Browser Native).
 */

'use strict'

const WEB_APP_URL = 'https://techymwijay.vercel.app'
const LOCAL_APP_URL = 'http://localhost:3000'
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCMJDUMO1-LJWkNCLJF6i8Di9rG4aZJwFU',
  projectId: 'mwijaytech-b9c98',
}

let vaultItems = []
let activeTab = 'vaultTab'
let activeCategory = 'all'
let activeEngine = 'elevenlabs'
let recognition = null
let isRecording = false
let currentLanguage = 'auto'
let currentTranscript = ''
let activeAudio = null

let currentUser = {
  email: 'davie.mwijay@mwijaytech.com',
  isLoggedIn: true,
}

// DOM Elements
const toast = document.getElementById('toast')
const vaultList = document.getElementById('vaultList')
const clipsList = document.getElementById('clipsList')
const vaultSearch = document.getElementById('vaultSearch')
const toggleAddFormBtn = document.getElementById('toggleAddFormBtn')
const vaultFormModal = document.getElementById('vaultFormModal')
const cancelFormBtn = document.getElementById('cancelFormBtn')
const saveFormBtn = document.getElementById('saveFormBtn')

const formTitle = document.getElementById('formTitle')
const formCategory = document.getElementById('formCategory')
const formValue = document.getElementById('formValue')
const formNotes = document.getElementById('formNotes')

const authText = document.getElementById('authText')
const toggleAuthModalBtn = document.getElementById('toggleAuthModalBtn')
const authModal = document.getElementById('authModal')
const closeAuthBtn = document.getElementById('closeAuthBtn')
const doLoginBtn = document.getElementById('doLoginBtn')
const authEmail = document.getElementById('authEmail')
const authPassword = document.getElementById('authPassword')

const micBtn = document.getElementById('micBtn')
const micStatus = document.getElementById('micStatus')
const transcriptArea = document.getElementById('transcriptArea')
const insertBtn = document.getElementById('insertBtn')
const copyBtn = document.getElementById('copyBtn')
const saveVaultBtn = document.getElementById('saveVaultBtn')

const ttsInput = document.getElementById('ttsInput')
const ttsVoiceSelect = document.getElementById('ttsVoiceSelect')
const ttsSpeedRange = document.getElementById('ttsSpeedRange')
const speedVal = document.getElementById('speedVal')
const speakBtn = document.getElementById('speakBtn')
const stopSpeakBtn = document.getElementById('stopSpeakBtn')
const downloadTtsBtn = document.getElementById('downloadTtsBtn')
const readSelectedBtn = document.getElementById('readSelectedBtn')
const openAppBtn = document.getElementById('openAppBtn')

// Utility Toast
function showToast(message, duration = 2200) {
  if (!toast) return
  toast.textContent = message
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), duration)
}

// ─── AUTH & LOGIN LOGIC ──────────────────────────────────────
async function loadAuthSession() {
  try {
    const data = await chrome.storage.local.get(['mwijay_auth_user'])
    if (data.mwijay_auth_user) {
      currentUser = data.mwijay_auth_user
    }
  } catch (err) {}
  updateAuthUI()
}

function updateAuthUI() {
  if (!authText) return
  if (currentUser && currentUser.isLoggedIn) {
    authText.textContent = `${currentUser.email.split('@')[0]} (Logged In)`
    if (toggleAuthModalBtn) toggleAuthModalBtn.textContent = 'Account'
  } else {
    authText.textContent = 'Not Logged In'
    if (toggleAuthModalBtn) toggleAuthModalBtn.textContent = '🔑 Login'
  }
}

if (toggleAuthModalBtn) {
  toggleAuthModalBtn.addEventListener('click', () => {
    authModal.classList.toggle('active')
  })
}

if (closeAuthBtn) {
  closeAuthBtn.addEventListener('click', () => {
    authModal.classList.remove('active')
  })
}

if (doLoginBtn) {
  doLoginBtn.addEventListener('click', async () => {
    const email = authEmail.value.trim()
    const password = authPassword.value.trim()
    if (!email || !password) {
      showToast('⚠️ Please enter email & password')
      return
    }

    currentUser = {
      email,
      isLoggedIn: true,
    }
    await chrome.storage.local.set({ mwijay_auth_user: currentUser })
    updateAuthUI()
    authModal.classList.remove('active')
    showToast(`✅ Welcome back, ${email.split('@')[0]}!`)
  })
}

// ─── TAB NAVIGATION ─────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'))

    btn.classList.add('active')
    const targetTab = document.getElementById(btn.dataset.tab)
    if (targetTab) targetTab.classList.add('active')
    activeTab = btn.dataset.tab
  })
})

// ─── ENGINE SWITCHER ────────────────────────────────────────
document.querySelectorAll('.engine-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.engine-chip').forEach((c) => c.classList.remove('active'))
    chip.classList.add('active')
    activeEngine = chip.dataset.engine

    if (activeEngine === 'elevenlabs') {
      ttsVoiceSelect.value = '21m00Tcm4TlvDq8ikWAM'
      showToast('✨ ElevenLabs HD Engine Selected')
    } else if (activeEngine === 'puter') {
      ttsVoiceSelect.value = 'puter-sw'
      showToast('🌐 Puter.js Unlimited Engine Selected')
    } else {
      showToast('💻 Browser Speech Synthesis Selected')
    }
  })
})

// Speed Slider Range
if (ttsSpeedRange) {
  ttsSpeedRange.addEventListener('input', () => {
    if (speedVal) speedVal.textContent = `${parseFloat(ttsSpeedRange.value).toFixed(1)}x`
  })
}

// ─── CATEGORY FILTER ────────────────────────────────────────
document.querySelectorAll('.filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'))
    chip.classList.add('active')
    activeCategory = chip.dataset.cat
    renderVaultList()
  })
})

if (vaultSearch) {
  vaultSearch.addEventListener('input', renderVaultList)
}

// ─── FORM MODAL LOGIC ───────────────────────────────────────
if (toggleAddFormBtn) {
  toggleAddFormBtn.addEventListener('click', () => {
    vaultFormModal.classList.toggle('active')
    if (vaultFormModal.classList.contains('active')) {
      formTitle.focus()
    }
  })
}

if (cancelFormBtn) {
  cancelFormBtn.addEventListener('click', () => {
    vaultFormModal.classList.remove('active')
  })
}

if (saveFormBtn) {
  saveFormBtn.addEventListener('click', async () => {
    const title = formTitle.value.trim()
    const category = formCategory.value
    const value = formValue.value.trim()
    const notes = formNotes.value.trim()

    if (!title || !value) {
      showToast('⚠️ Title & Secret Value required')
      return
    }

    const newItem = {
      id: 'vault_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      category,
      value,
      notes,
      createdAt: new Date().toISOString(),
      source: 'manual',
    }

    vaultItems.unshift(newItem)
    await saveVaultItemsToStorage()
    syncVaultItemToCloud(newItem)

    // Reset Form
    formTitle.value = ''
    formValue.value = ''
    formNotes.value = ''
    vaultFormModal.classList.remove('active')

    showToast('🔐 Secret saved to Vault!')
    renderVaultList()
  })
}

// ─── STORAGE & CLOUD SYNC ───────────────────────────────────
async function loadVaultItems() {
  try {
    const data = await chrome.storage.local.get(['mwijay_vault_items'])
    if (data.mwijay_vault_items && Array.isArray(data.mwijay_vault_items)) {
      vaultItems = data.mwijay_vault_items
    } else {
      vaultItems = [
        {
          id: 'v_init_1',
          title: 'OpenRouter Multi-Key Pool',
          category: 'api-key',
          value: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          notes: 'Active key for AI voice model',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'v_init_2',
          title: 'Davie Mwijay Account',
          category: 'password',
          value: 'your-secure-password-here',
          notes: 'admin@mwijaytech.app',
          createdAt: new Date().toISOString(),
        },
      ]
      await saveVaultItemsToStorage()
    }
  } catch (err) {
    console.error('Failed to load vault items:', err)
  }

  fetchCloudVaultItems()
  renderVaultList()
}

async function saveVaultItemsToStorage() {
  await chrome.storage.local.set({ mwijay_vault_items: vaultItems })
}

async function syncVaultItemToCloud(item) {
  try {
    const doc = {
      fields: {
        userId: { stringValue: currentUser.email },
        title: { stringValue: item.title },
        category: { stringValue: item.category },
        content: { stringValue: item.value },
        notes: { stringValue: item.notes || '' },
        tags: { arrayValue: { values: [{ stringValue: 'extension' }] } },
        isPinned: { booleanValue: false },
        createdAt: { stringValue: item.createdAt },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    }

    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/vault_items?key=${FIREBASE_CONFIG.apiKey}`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    })
  } catch (err) {
    console.warn('Cloud sync offline')
  }
}

async function fetchCloudVaultItems() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/vault_items?key=${FIREBASE_CONFIG.apiKey}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (data.documents) {
        let itemsUpdated = false
        for (const doc of data.documents) {
          const fields = doc.fields
          if (!fields) continue
          const title = fields.title?.stringValue || 'Untitled'
          const value = fields.content?.stringValue || ''
          const category = fields.category?.stringValue || 'snippet'

          const exists = vaultItems.some((v) => v.title === title || v.value === value)
          if (!exists && value) {
            vaultItems.push({
              id: doc.name.split('/').pop(),
              title,
              category,
              value,
              notes: fields.notes?.stringValue || '',
              createdAt: fields.createdAt?.stringValue || new Date().toISOString(),
            })
            itemsUpdated = true
          }
        }
        if (itemsUpdated) {
          await saveVaultItemsToStorage()
          renderVaultList()
        }
      }
    }
  } catch (e) {}
}

// ─── VAULT RENDERER ─────────────────────────────────────────
function renderVaultList() {
  if (!vaultList) return

  const query = (vaultSearch?.value || '').toLowerCase()
  const filtered = vaultItems.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory
    const matchesQuery =
      item.title.toLowerCase().includes(query) ||
      (item.notes || '').toLowerCase().includes(query) ||
      (item.value || '').toLowerCase().includes(query)
    return matchesCat && matchesQuery
  })

  if (filtered.length === 0) {
    vaultList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔐</div>
        <p>No matching secret items found.</p>
        <p style="font-size: 9px; margin-top: 4px;">Click <b>+ Add Secret</b> to store passwords & keys!</p>
      </div>`
    return
  }

  vaultList.innerHTML = filtered
    .map((item) => {
      const badgeClass =
        item.category === 'password'
          ? 'badge-password'
          : item.category === 'api-key'
          ? 'badge-api-key'
          : item.category === 'credential'
          ? 'badge-credential'
          : 'badge-snippet'

      const catLabel =
        item.category === 'password'
          ? '🔑 Password'
          : item.category === 'api-key'
          ? '⚡ API Key'
          : item.category === 'credential'
          ? '🔒 Secret'
          : '📄 Snippet'

      const maskedVal = maskSecret(item.value)

      return `
      <div class="vault-card" data-id="${item.id}">
        <div class="vault-card-header">
          <div class="vault-title">
            <span>${escapeHtml(item.title)}</span>
          </div>
          <span class="vault-type-badge ${badgeClass}">${catLabel}</span>
        </div>
        ${item.notes ? `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">${escapeHtml(item.notes)}</div>` : ''}
        <div class="vault-value-row">
          <span class="vault-masked-val" id="val-${item.id}" data-raw="${escapeHtml(item.value)}" data-masked="${escapeHtml(maskedVal)}">${escapeHtml(maskedVal)}</span>
          <div class="vault-card-actions">
            <button class="card-icon-btn toggle-reveal-btn" data-id="${item.id}" title="Show/Hide Secret">👁️</button>
            <button class="card-icon-btn copy-secret-btn" data-val="${escapeHtml(item.value)}" title="Copy to Clipboard">📋</button>
            <button class="card-icon-btn delete-secret-btn" data-id="${item.id}" title="Delete Item">🗑️</button>
          </div>
        </div>
      </div>`
    })
    .join('')

  renderClipsList()

  document.querySelectorAll('.toggle-reveal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id
      const valEl = document.getElementById(`val-${id}`)
      if (valEl) {
        const isRevealed = valEl.textContent === valEl.dataset.raw
        valEl.textContent = isRevealed ? valEl.dataset.masked : valEl.dataset.raw
        btn.textContent = isRevealed ? '👁️' : '🙈'
      }
    })
  })

  document.querySelectorAll('.copy-secret-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const val = btn.dataset.val
      try {
        await navigator.clipboard.writeText(val)
        showToast('📋 Copied secret to clipboard!')
      } catch (err) {
        showToast('⚠️ Copy failed')
      }
    })
  })

  document.querySelectorAll('.delete-secret-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id
      vaultItems = vaultItems.filter((i) => i.id !== id)
      await saveVaultItemsToStorage()
      renderVaultList()
      showToast('🗑️ Secret deleted')
    })
  })
}

function renderClipsList() {
  if (!clipsList) return
  const clips = vaultItems.filter((i) => i.category === 'snippet')

  if (clips.length === 0) {
    clipsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>No web snippets saved yet.</p>
        <p style="font-size: 9px; margin-top: 4px;">Highlight text on any website and right-click "Save Web Snippet"!</p>
      </div>`
    return
  }

  clipsList.innerHTML = clips
    .map(
      (c) => `
    <div class="vault-card">
      <div class="vault-card-header">
        <div class="vault-title">📄 ${escapeHtml(c.title)}</div>
        <span class="vault-type-badge badge-snippet">Snippet</span>
      </div>
      <div style="font-size: 11px; color: #cbd5e1; margin: 4px 0; line-height: 1.4; white-space: pre-wrap;">${escapeHtml(c.value.slice(0, 180))}${c.value.length > 180 ? '...' : ''}</div>
      <div class="vault-card-actions" style="justify-content: flex-end;">
        <button class="action-btn copy-secret-btn" data-val="${escapeHtml(c.value)}">📋 Copy Text</button>
      </div>
    </div>`
    )
    .join('')

  clipsList.querySelectorAll('.copy-secret-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(btn.dataset.val)
      showToast('📋 Copied snippet!')
    })
  })
}

function maskSecret(val) {
  if (!val) return ''
  if (val.startsWith('sk-') || val.startsWith('gsk_') || val.startsWith('hf_')) {
    return val.substring(0, 7) + '••••••••' + val.substring(val.length - 4)
  }
  return '••••••••••••'
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── VOICE DICTATION (STT) ──────────────────────────────────
function setupRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    if (micStatus) micStatus.textContent = 'Speech recognition not supported'
    if (micBtn) micBtn.disabled = true
    return null
  }

  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = currentLanguage === 'auto' || currentLanguage === 'sw-KE' ? 'sw-KE' : currentLanguage

  recognition.onstart = () => {
    isRecording = true
    micBtn.classList.add('recording')
    micBtn.textContent = '⏹'
    micStatus.textContent = 'Recording...'
  }

  recognition.onresult = (event) => {
    let interim = ''
    let final = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) final += result[0].transcript
      else interim += result[0].transcript
    }

    if (final) {
      currentTranscript += (currentTranscript ? ' ' : '') + final
      transcriptArea.value = currentTranscript
    } else if (interim) {
      transcriptArea.value = currentTranscript + (currentTranscript ? ' ' : '') + interim
    }

    const hasText = transcriptArea.value.trim().length > 0
    insertBtn.disabled = !hasText
    copyBtn.disabled = !hasText
    saveVaultBtn.disabled = !hasText

    autoSaveDraft(transcriptArea.value)
  }

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      showToast('⚠️ Mic permission required!')
      chrome.tabs.create({ url: 'request_mic.html' })
    }
    stopRecording()
  }

  recognition.onend = () => {
    if (isRecording) {
      try { recognition.start() } catch { stopRecording() }
    }
  }

  return recognition
}

// ─── DRAFT AUTO-SAVE & RESTORE ───────────────────────────────
async function autoSaveDraft(text) {
  try {
    await chrome.storage.local.set({ mwijay_unsaved_dictation_draft: text })
  } catch (err) {}
}

async function loadDraft() {
  try {
    const data = await chrome.storage.local.get(['mwijay_unsaved_dictation_draft'])
    if (data.mwijay_unsaved_dictation_draft && transcriptArea) {
      transcriptArea.value = data.mwijay_unsaved_dictation_draft
      currentTranscript = data.mwijay_unsaved_dictation_draft
      const hasText = transcriptArea.value.trim().length > 0
      if (insertBtn) insertBtn.disabled = !hasText
      if (copyBtn) copyBtn.disabled = !hasText
      if (saveVaultBtn) saveVaultBtn.disabled = !hasText
      if (micStatus) micStatus.textContent = '💾 Draft auto-restored'
    }
  } catch (err) {}
}

if (transcriptArea) {
  transcriptArea.addEventListener('input', () => {
    currentTranscript = transcriptArea.value
    const hasText = transcriptArea.value.trim().length > 0
    if (insertBtn) insertBtn.disabled = !hasText
    if (copyBtn) copyBtn.disabled = !hasText
    if (saveVaultBtn) saveVaultBtn.disabled = !hasText
    autoSaveDraft(transcriptArea.value)
  })
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(t => t.stop())
  } catch (err) {
    showToast('⚠️ Microphone permission required!')
    chrome.tabs.create({ url: 'request_mic.html' })
    return
  }

  if (!recognition) recognition = setupRecognition()
  if (!recognition) return
  try {
    recognition.lang = currentLanguage === 'auto' ? 'sw-KE' : currentLanguage
    recognition.start()
  } catch (err) {}
}

function stopRecording() {
  isRecording = false
  if (recognition) recognition.stop()
  if (micBtn) {
    micBtn.classList.remove('recording')
    micBtn.textContent = '🎤'
  }
  if (micStatus) micStatus.textContent = currentTranscript ? `✅ Captured (Auto-Saved)` : 'Click mic or press Alt+M'
}

if (micBtn) {
  micBtn.addEventListener('click', () => {
    if (isRecording) stopRecording()
    else {
      currentTranscript = transcriptArea.value.trim()
      startRecording()
    }
  })
}

if (insertBtn) {
  insertBtn.addEventListener('click', async () => {
    const text = transcriptArea.value.trim()
    if (!text) return
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (val) => {
          const active = document.activeElement
          if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            active.value += val
            active.dispatchEvent(new Event('input', { bubbles: true }))
            return true
          }
          return false
        },
        args: [text],
      })
      showToast('✅ Inserted!')
    } catch {
      showToast('⚠️ Click input field on page')
    }
  })
}

if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const text = transcriptArea.value.trim()
    if (!text) return
    await navigator.clipboard.writeText(text)
    showToast('📋 Copied!')
  })
}

if (saveVaultBtn) {
  saveVaultBtn.addEventListener('click', async () => {
    const text = transcriptArea.value.trim()
    if (!text) return

    const newItem = {
      id: 'v_' + Date.now(),
      title: `Voice Note — ${new Date().toLocaleTimeString()}`,
      category: 'snippet',
      value: text,
      createdAt: new Date().toISOString(),
    }

    vaultItems.unshift(newItem)
    await saveVaultItemsToStorage()
    syncVaultItemToCloud(newItem)

    showToast('🔐 Saved to Vault!')
    transcriptArea.value = ''
    currentTranscript = ''
    autoSaveDraft('')
    insertBtn.disabled = true
    copyBtn.disabled = true
    saveVaultBtn.disabled = true
    renderVaultList()
  })
}

// ─── MULTI-ENGINE TEXT-TO-SPEECH (TTS) ──────────────────────
async function speakText(text) {
  if (!text.trim()) return showToast('⚠️ Enter text first')

  stopAudio()
  showToast('🔄 Synthesizing speech...')

  const voiceId = ttsVoiceSelect ? ttsVoiceSelect.value : '21m00Tcm4TlvDq8ikWAM'
  const rate = ttsSpeedRange ? parseFloat(ttsSpeedRange.value) : 1.0

  if (activeEngine === 'elevenlabs' && voiceId !== 'puter-sw') {
    try {
      const response = await fetch(`${WEB_APP_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId,
          speed: rate,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        activeAudio = new Audio(audioUrl)
        activeAudio.playbackRate = rate
        activeAudio.play()
        showToast('▶ Playing ElevenLabs HD Speech!')
        return
      }
    } catch (err) {
      console.warn('ElevenLabs API request failed, falling back to Puter/Browser TTS')
    }
  }

  // Enhanced Fallback to Natural Browser Speech (filter robotic voices)
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  
  const voices = window.speechSynthesis.getVoices()
  const swahiliVoice = voices.find((v) => v.lang.startsWith('sw'))
  const naturalEnglishVoice = voices.find((v) =>
    (v.lang.startsWith('en') || v.lang.startsWith('en-')) &&
    (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online'))
  )
  const fallbackEnglishVoice = voices.find((v) => v.lang.startsWith('en'))

  utterance.voice = swahiliVoice || naturalEnglishVoice || fallbackEnglishVoice || null
  utterance.lang = utterance.voice ? utterance.voice.lang : 'sw-KE'

  window.speechSynthesis.speak(utterance)
  showToast(`▶ Playing Speech (${utterance.voice ? utterance.voice.name.slice(0, 20) : 'Native'})`)
}

function stopAudio() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio = null
  }
  window.speechSynthesis.cancel()
  showToast('⏹ Stopped')
}

if (speakBtn) {
  speakBtn.addEventListener('click', () => {
    const text = ttsInput.value.trim()
    speakText(text)
  })
}

if (stopSpeakBtn) {
  stopSpeakBtn.addEventListener('click', stopAudio)
}

if (downloadTtsBtn) {
  downloadTtsBtn.addEventListener('click', async () => {
    const text = ttsInput.value.trim()
    if (!text) return showToast('⚠️ Enter text first')

    showToast('💾 Preparing MP3 download...')
    const voiceId = ttsVoiceSelect ? ttsVoiceSelect.value : '21m00Tcm4TlvDq8ikWAM'
    const rate = ttsSpeedRange ? parseFloat(ttsSpeedRange.value) : 1.0

    try {
      const response = await fetch(`${WEB_APP_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, speed: rate }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mwijay-speech-${Date.now()}.mp3`
        a.click()
        URL.revokeObjectURL(url)
        showToast('✅ MP3 Downloaded!')
        return
      }
    } catch (e) {}

    showToast('⚠️ Could not download MP3 file')
  })
}

if (readSelectedBtn) {
  readSelectedBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || '',
      })
      const text = res[0]?.result || ''
      if (text) {
        ttsInput.value = text
        speakText(text)
      } else showToast('⚠️ Highlight text first')
    } catch {
      showToast('⚠️ Could not read selection')
    }
  })
}

const openSidePanelBtn = document.getElementById('openSidePanelBtn')

if (openSidePanelBtn) {
  openSidePanelBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (chrome.sidePanel && tab) {
        await chrome.sidePanel.open({ windowId: tab.windowId })
        showToast('📌 Chrome Sidebar Opened!')
      }
    } catch (e) {
      showToast('📌 Right-click extension icon & select Open side panel')
    }
  })
}

const toggleExtMiniBtn = document.getElementById('toggleExtMiniBtn')
if (toggleExtMiniBtn) {
  toggleExtMiniBtn.addEventListener('click', () => {
    document.body.classList.toggle('ext-mini-mode')
    const isMini = document.body.classList.contains('ext-mini-mode')
    toggleExtMiniBtn.textContent = isMini ? 'Full 🗖' : 'MVS 🗗'
    showToast(isMini ? '🗗 MVS Compact View' : '🗖 Full Studio View')
  })
}

const toggleTtsCollapseBtn = document.getElementById('toggleTtsCollapseBtn')
const ttsCollapsibleSection = document.getElementById('ttsCollapsibleSection')
if (toggleTtsCollapseBtn && ttsCollapsibleSection) {
  toggleTtsCollapseBtn.addEventListener('click', () => {
    const isHidden = ttsCollapsibleSection.style.display === 'none'
    ttsCollapsibleSection.style.display = isHidden ? 'block' : 'none'
    toggleTtsCollapseBtn.textContent = isHidden ? '🔊 TTS (On)' : '🔊 TTS'
  })
}

if (openAppBtn) {
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: WEB_APP_URL })
  })
}


// INITIALIZE
loadAuthSession()
loadVaultItems()
loadDraft()
setupRecognition()

