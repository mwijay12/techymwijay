/**
 * Mwijay Tech Extension — Service Worker (Background)
 * Context menus, command shortcuts (Alt+M), password & snippet vault captures.
 */

'use strict'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'mwijay-save-secret',
      title: '🔐 Save selection to local Mwijay Vault',
      contexts: ['selection'],
    })

    chrome.contextMenus.create({
      id: 'mwijay-save-snippet',
      title: '📋 Save selection as local web clip',
      contexts: ['selection'],
    })

    chrome.contextMenus.create({
      id: 'mwijay-read-aloud',
      title: '🔊 Read aloud with Mwijay Voice',
      contexts: ['selection'],
    })

    chrome.contextMenus.create({
      id: 'mwijay-dictate',
      title: '🎙️ Dictate here with Mwijay Voice (Alt+M)',
      contexts: ['editable'],
    })
  })

  console.log('[Mwijay Tech Extension] Service worker initialized with local vault context menus')
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return

  const selectedText = (info.selectionText || '').trim()

  if (info.menuItemId === 'mwijay-save-secret') {
    if (!selectedText) return
    const isApiKey = selectedText.startsWith('sk-') || selectedText.startsWith('gsk_') || selectedText.startsWith('hf_') || selectedText.length > 24
    const category = isApiKey ? 'api-key' : 'password'

    const newItem = {
      id: 'vault_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: `${tab.title ? tab.title.slice(0, 30) : 'Saved Secret'}`,
      category,
      value: selectedText,
      notes: `Captured from ${tab.url || 'Web page'}`,
      createdAt: new Date().toISOString(),
    }

    const saved = await saveVaultItemLocally(newItem)

    chrome.tabs.sendMessage(tab.id, {
      type: 'VAULT_ITEM_SAVED',
      message: saved ? `🔒 ${category === 'api-key' ? 'API Key' : 'Password'} saved on this device.` : '⚠️ Could not save item. Local storage may be full.',
    })

  } else if (info.menuItemId === 'mwijay-save-snippet') {
    if (!selectedText) return
    const newItem = {
      id: 'vault_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: `${tab.title ? tab.title.slice(0, 30) : 'Web Snippet'}`,
      category: 'snippet',
      value: selectedText,
      notes: `Source: ${tab.url || 'Web page'}`,
      createdAt: new Date().toISOString(),
    }

    const saved = await saveVaultItemLocally(newItem)

    chrome.tabs.sendMessage(tab.id, {
      type: 'VAULT_ITEM_SAVED',
      message: saved ? '📋 Web clip saved on this device.' : '⚠️ Could not save clip. Local storage may be full.',
    })

  } else if (info.menuItemId === 'mwijay-read-aloud') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'READ_ALOUD',
      text: selectedText,
    })
  } else if (info.menuItemId === 'mwijay-dictate') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'START_DICTATION',
    })
  }
})

async function saveVaultItemLocally(item) {
  try {
    const data = await chrome.storage.local.get(['mwijay_vault_items'])
    const existing = data.mwijay_vault_items || []
    existing.unshift(item)
    await chrome.storage.local.set({ mwijay_vault_items: existing.slice(0, 500) })
    return true
  } catch (err) {
    console.warn('[Background] Local vault save failed:', err)
    return false
  }
}

/* Cloud sync intentionally disabled: vault values must never be sent to an
 * unauthenticated, shared Firestore collection. */

chrome.commands.onCommand.addListener((command) => {
  if (command === 'trigger-dictation') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'START_DICTATION' })
      }
    })
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_MIC_PERMISSION') {
    chrome.tabs.create({ url: chrome.runtime.getURL('request_mic.html') })
    sendResponse({ success: true })
  }
  return true
})
