/**
 * Electron Preload Script
 * Exposes a safe, typed API to the renderer process via contextBridge.
 * This is the ONLY way the renderer communicates with the main process.
 * nodeIntegration MUST be false — contextIsolation MUST be true.
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  version: process.env.npm_package_version || '1.0.0',

  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  navigate: (route) => ipcRenderer.send('navigate', route),

  getOnlineStatus: () => ipcRenderer.invoke('get-online-status'),
  onOnlineStatusChanged: (callback) => {
    const handler = (_, status) => callback(status)
    ipcRenderer.on('online-status-changed', handler)
    return () => ipcRenderer.removeListener('online-status-changed', handler)
  },

  onNavigateTo: (callback) => {
    const handler = (_, route) => callback(route)
    ipcRenderer.on('navigate-to', handler)
    return () => ipcRenderer.removeListener('navigate-to', handler)
  },

  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  showNotification: (title, body) =>
    ipcRenderer.send('show-notification', { title, body }),

  setAutoStart: (enabled) =>
    ipcRenderer.invoke('set-auto-start', enabled),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),

  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  setTrayOnlineStatus: (isOnline) =>
    ipcRenderer.send('tray-online-status', isOnline),

  toggleDevTools: () => ipcRenderer.send('toggle-dev-tools'),

  // Screenshot API
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  getWindowSources: () => ipcRenderer.invoke('get-window-sources'),
  captureWindow: (sourceId) => ipcRenderer.invoke('capture-window', sourceId),

  // Clipboard API
  getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
  toggleClipboardMonitor: (enabled) =>
    ipcRenderer.invoke('toggle-clipboard-monitor', enabled),
  onClipboardDetected: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('clipboard-content-detected', handler)
    return () => ipcRenderer.removeListener('clipboard-content-detected', handler)
  },

  // Widget API
  toggleWidget: () => ipcRenderer.invoke('toggle-widget'),
  isWidgetOpen: () => ipcRenderer.invoke('is-widget-open'),

  // Notification Service API
  updateNotificationSettings: (settings) =>
    ipcRenderer.send('update-notification-settings', settings),
  onRequestDailySummary: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('request-daily-summary', handler)
    return () => ipcRenderer.removeListener('request-daily-summary', handler)
  },
  sendDailySummaryResponse: (data) =>
    ipcRenderer.send('daily-summary-response', data),
})

console.log('[Preload] Mwijay Tech preload script loaded with Prompt 17 APIs')