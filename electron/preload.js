const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  
  // File system for local storage backup
  saveFile: async (filename, data) => {
    const userDataPath = await ipcRenderer.invoke('app:getPath', 'userData')
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(userDataPath, filename)
    fs.writeFileSync(filePath, data, 'utf-8')
    return filePath
  },
  
  readFile: async (filename) => {
    const userDataPath = await ipcRenderer.invoke('app:getPath', 'userData')
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(userDataPath, filename)
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch {
      return null
    }
  },
  
  // Updater
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  downloadUpdate: () => ipcRenderer.invoke('updater:download'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  
  // Listen for updater events
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('updater:update-available', (_, info) => callback(info))
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('updater:update-not-available', (_, info) => callback(info))
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('updater:error', (_, err) => callback(err))
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('updater:download-progress', (_, progress) => callback(progress))
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('updater:update-downloaded', (_, info) => callback(info))
  },
  
  // Listen for maximize changes
  onMaximizeChange: (callback) => {
    ipcRenderer.on('window:maximized', () => callback(true))
    ipcRenderer.on('window:unmaximized', () => callback(false))
  },
  
  isElectron: true,
})