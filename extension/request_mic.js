/**
 * Mwijay Tech Extension — Microphone Permission Request Handler
 */

'use strict'

const grantBtn = document.getElementById('grantBtn')
const statusBadge = document.getElementById('statusBadge')

async function requestMicPermission() {
  try {
    grantBtn.disabled = true
    grantBtn.textContent = '⏳ Requesting Permission...'

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Stop tracks after obtaining permission
    stream.getTracks().forEach((track) => track.stop())

    // Store status
    await chrome.storage.sync.set({ mwijay_mic_granted: true })

    statusBadge.className = 'status-badge success'
    statusBadge.innerHTML = '✅ Microphone permission granted! You can close this tab now and return to the extension.'

    grantBtn.style.display = 'none'

    setTimeout(() => {
      window.close()
    }, 2500)
  } catch (err) {
    console.error('Microphone request failed:', err)
    grantBtn.disabled = false
    grantBtn.textContent = '🎤 Try Allowing Microphone Again'

    statusBadge.className = 'status-badge error'
    statusBadge.innerHTML = `⚠️ Microphone permission failed: ${err.message || 'Blocked by browser settings'}. Please allow microphone in site settings.`
  }
}

grantBtn.addEventListener('click', requestMicPermission)

// Automatically request on load
window.addEventListener('DOMContentLoaded', () => {
  requestMicPermission()
})
