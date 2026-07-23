/**
 * Mwijay Tech Extension — Service Worker (Background)
 * Context menus, command shortcuts (Alt+M), password & snippet vault captures.
 */

'use strict'

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCMJDUMO1-LJWkNCLJF6i8Di9rG4aZJwFU',
  projectId: 'mwijaytech-b9c98',
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'mwijay-save-secret',
      title: '🔐 Save Password / API Key to Mwijay Vault',
      contexts: ['selection'],
    })

    chrome.contextMenus.create({
      id: 'mwijay-save-snippet',
      title: '📋 Save Web Snippet to Mwijay Vault',
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

  console.log('[Mwijay Tech Extension] Service worker initialized with password & secret context menus')
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

    await saveVaultItemLocalAndCloud(newItem)

    chrome.tabs.sendMessage(tab.id, {
      type: 'VAULT_ITEM_SAVED',
      message: `🔐 ${category === 'api-key' ? 'API Key' : 'Password'} saved to Vault!`,
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

    await saveVaultItemLocalAndCloud(newItem)

    chrome.tabs.sendMessage(tab.id, {
      type: 'VAULT_ITEM_SAVED',
      message: '📋 Web snippet saved to Vault!',
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

async function saveVaultItemLocalAndCloud(item) {
  try {
    const data = await chrome.storage.local.get(['mwijay_vault_items'])
    const existing = data.mwijay_vault_items || []
    existing.unshift(item)
    await chrome.storage.local.set({ mwijay_vault_items: existing })

    // Sync to Firestore Cloud
    const doc = {
      fields: {
        userId: { stringValue: 'davie-mwijay-extension' },
        title: { stringValue: item.title },
        category: { stringValue: item.category },
        content: { stringValue: item.value },
        notes: { stringValue: item.notes || '' },
        tags: { arrayValue: { values: [{ stringValue: 'extension' }, { stringValue: item.category }] } },
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
    console.warn('[Background] Vault save fallback local:', err)
  }
}

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
    chrome.tabs.create({ url: 'request_mic.html' })
    sendResponse({ success: true })
  }
  return true
})
