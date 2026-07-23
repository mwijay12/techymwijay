/**
 * Mwijay Tech — Electron Main Process
 * Advanced window management, global hotkeys, system tray,
 * IPC handlers, offline detection, auto-start, screenshot service,
 * clipboard monitor, and widget mode.
 *
 * Built by Davie Mwijay — Dar es Salaam, Tanzania 🇹🇿
 */

const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  shell,
  Notification,
  net,
  nativeTheme,
  Menu,
} = require('electron')
const path = require('path')
const { loadWindowState, saveWindowState } = require('./window-state')
const { createTray, destroyTray, showAndNavigate } = require('./tray-menu')
const { buildAppMenu } = require('./app-menu')
const {
  initNotificationService,
  sendDailySummary,
  updateNotificationSettings,
  destroyNotificationService,
} = require('./notification-service')
const {
  startClipboardMonitor,
  stopClipboardMonitor,
  toggleClipboardMonitor,
  getClipboardText,
} = require('./clipboard-monitor')
const {
  captureFullScreen,
  getWindowSources,
  captureWindow,
} = require('./screenshot-service')
const {
  toggleWidget,
  isWidgetOpen,
} = require('./widget-mode')

const isDev = process.env.NODE_ENV === 'development'
const APP_URL = isDev
  ? 'http://localhost:3000'
  : `file://${path.join(__dirname, '../out/index.html')}`

let mainWindow = null
let trayController = null
app.isQuitting = false

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()

      const url = commandLine.find((arg) => arg.startsWith('mwijaytech://'))
      if (url) handleDeepLink(url)
    }
  })
}

function createWindow() {
  const savedState = loadWindowState()

  mainWindow = new BrowserWindow({
    width: savedState.width,
    height: savedState.height,
    x: savedState.x,
    y: savedState.y,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f1a',
    show: false,
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
  })

  mainWindow.loadURL(APP_URL)

  mainWindow.once('ready-to-show', () => {
    if (savedState.isMaximized) {
      mainWindow.maximize()
    }
    mainWindow.show()
    mainWindow.focus()

    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      if (trayController?.tray) {
        e.preventDefault()
        mainWindow.hide()
        return
      }
    }
    saveWindowState(mainWindow)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('resize', () => saveWindowState(mainWindow))
  mainWindow.on('move', () => saveWindowState(mainWindow))

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url)
    if (isDev && parsedUrl.hostname !== 'localhost') {
      event.preventDefault()
      shell.openExternal(url)
    } else if (!isDev && !url.startsWith('file://')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  return mainWindow
}

function registerGlobalShortcuts() {
  // Ctrl+Shift+M / Cmd+Shift+M — Voice Dictation
  globalShortcut.register('CmdOrCtrl+Shift+M', () => {
    if (!mainWindow) return
    showAndNavigate(mainWindow, '/ai-stt')
  })

  // Ctrl+Shift+T / Cmd+Shift+T — Todos
  globalShortcut.register('CmdOrCtrl+Shift+T', () => {
    if (!mainWindow) return
    showAndNavigate(mainWindow, '/todos')
  })

  // Ctrl+Shift+V / Cmd+Shift+V — Vault
  globalShortcut.register('CmdOrCtrl+Shift+V', () => {
    if (!mainWindow) return
    showAndNavigate(mainWindow, '/blog')
  })

  // Ctrl+Shift+S / Cmd+Shift+S — Spending
  globalShortcut.register('CmdOrCtrl+Shift+S', () => {
    if (!mainWindow) return
    showAndNavigate(mainWindow, '/spending')
  })

  // Ctrl+Shift+W / Cmd+Shift+W — Widget
  globalShortcut.register('CmdOrCtrl+Shift+W', () => {
    toggleWidget()
  })

  console.log('[Electron] Global shortcuts registered (Dictation, Todos, Vault, Spending, Widget)')
}

function setupOnlineDetection() {
  let wasOnline = net.isOnline()

  const checkInterval = setInterval(() => {
    const isOnline = net.isOnline()

    if (isOnline !== wasOnline) {
      wasOnline = isOnline

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('online-status-changed', { isOnline })
      }

      trayController?.updateTrayMenu(isOnline)

      if (Notification.isSupported()) {
        new Notification({
          title: 'Mwijay Tech',
          body: isOnline
            ? '🟢 Back online — AI features restored'
            : '🔴 Gone offline — local features still work',
          silent: !isOnline,
        }).show()
      }
    }
  }, 10_000)

  app.on('before-quit', () => clearInterval(checkInterval))
}

function handleDeepLink(url) {
  try {
    const parsed = new URL(url)
    const route = parsed.pathname || '/'
    if (mainWindow) {
      showAndNavigate(mainWindow, route)
    }
  } catch {
    console.warn('[Electron] Invalid deep link:', url)
  }
}

function setupIPC() {
  // Window controls
  ipcMain.on('window-minimize', () => mainWindow?.minimize())

  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    if (trayController?.tray) {
      mainWindow?.hide()
    } else {
      saveWindowState(mainWindow)
      mainWindow?.close()
    }
  })

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow?.isMaximized() ?? false
  })

  ipcMain.on('navigate', (_, route) => {
    if (mainWindow) {
      mainWindow.webContents.send('navigate-to', route)
    }
  })

  ipcMain.handle('get-online-status', () => {
    return { isOnline: net.isOnline() }
  })

  ipcMain.handle('open-external', async (_, url) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch {
      return { success: false }
    }
  })

  ipcMain.on('show-notification', (_, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  ipcMain.handle('get-auto-start', () => {
    const settings = app.getLoginItemSettings()
    return { enabled: settings.openAtLogin }
  })

  ipcMain.handle('set-auto-start', (_, enabled) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe'),
    })
    return { success: true, enabled }
  })

  ipcMain.handle('get-app-version', () => app.getVersion())
  ipcMain.handle('get-app-path', () => app.getAppPath())
  ipcMain.handle('get-platform', () => process.platform)

  ipcMain.on('tray-online-status', (_, isOnline) => {
    trayController?.updateTrayMenu(isOnline)
  })

  ipcMain.on('toggle-dev-tools', () => {
    if (mainWindow?.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools()
    } else {
      mainWindow?.webContents.openDevTools({ mode: 'detach' })
    }
  })

  // Prompt 17 IPC handlers
  ipcMain.handle('capture-screenshot', () => captureFullScreen())
  ipcMain.handle('get-window-sources', () => getWindowSources())
  ipcMain.handle('capture-window', (_, sourceId) => captureWindow(sourceId))

  ipcMain.handle('get-clipboard-text', () => getClipboardText())
  ipcMain.handle('toggle-clipboard-monitor', (_, enabled) =>
    toggleClipboardMonitor(enabled, mainWindow)
  )

  ipcMain.handle('toggle-widget', () => toggleWidget())
  ipcMain.handle('is-widget-open', () => isWidgetOpen())

  ipcMain.on('update-notification-settings', (_, settings) =>
    updateNotificationSettings(settings)
  )
  ipcMain.on('daily-summary-response', (_, data) => sendDailySummary(data))
}

function setupWindowsJumpList() {
  if (process.platform !== 'win32') return

  app.setUserTasks([
    {
      program: process.execPath,
      arguments: '--route /ai-stt',
      iconPath: path.join(__dirname, 'icons', 'icon.ico'),
      iconIndex: 0,
      title: '🎙️ Voice Dictation',
      description: 'Open STT voice dictation',
    },
    {
      program: process.execPath,
      arguments: '--route /blog',
      iconPath: path.join(__dirname, 'icons', 'icon.ico'),
      iconIndex: 0,
      title: '🔐 Developer Vault',
      description: 'Open Developer Vault',
    },
    {
      program: process.execPath,
      arguments: '--route /meeting',
      iconPath: path.join(__dirname, 'icons', 'icon.ico'),
      iconIndex: 0,
      title: '🎙️ Meeting Recording',
      description: 'Start meeting transcription',
    },
  ])
}

function setupProtocol() {
  if (!app.isDefaultProtocolClient('mwijaytech')) {
    app.setAsDefaultProtocolClient('mwijaytech')
  }

  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleDeepLink(url)
  })
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark'

  createWindow()

  const appMenu = buildAppMenu(mainWindow)
  Menu.setApplicationMenu(appMenu)

  trayController = createTray(mainWindow)
  registerGlobalShortcuts()
  setupIPC()
  setupOnlineDetection()
  setupWindowsJumpList()
  setupProtocol()

  // Initialize notification service & clipboard monitor
  initNotificationService(mainWindow)
  startClipboardMonitor(mainWindow)

  console.log(`[Electron] Mwijay Tech v${app.getVersion()} started`)
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
  globalShortcut.unregisterAll()
  destroyTray()
  destroyNotificationService()
  stopClipboardMonitor()
  if (mainWindow) saveWindowState(mainWindow)
})