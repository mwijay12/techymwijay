const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

// Configure auto-updater for GitHub Releases
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/icon.svg'),
    backgroundColor: '#000000',
    show: false,
  })

  // In development, load from Next.js dev server
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// IPC Handlers
ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.handle('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized())

ipcMain.handle('app:getVersion', () => app.getVersion())
ipcMain.handle('app:getPath', (_, name) => app.getPath(name))

// Auto-updater
autoUpdater.on('checking-for-update', () => {
  console.log('[AutoUpdater] Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('[AutoUpdater] Update available:', info.version)
  mainWindow?.webContents.send('updater:update-available', info)
})

autoUpdater.on('update-not-available', (info) => {
  console.log('[AutoUpdater] Update not available, current version is latest')
  mainWindow?.webContents.send('updater:update-not-available', info)
})

autoUpdater.on('error', (err) => {
  console.error('[AutoUpdater] Error:', err.message)
  mainWindow?.webContents.send('updater:error', err.message)
})

autoUpdater.on('download-progress', (progressObj) => {
  console.log('[AutoUpdater] Download progress:', progressObj.percent)
  mainWindow?.webContents.send('updater:download-progress', progressObj)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('[AutoUpdater] Update downloaded:', info.version)
  mainWindow?.webContents.send('updater:update-downloaded', info)
})

// Check for updates from GitHub Releases
ipcMain.handle('updater:check', async () => {
  try {
    // Set the feed URL for GitHub Releases
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'mwijay12',
      repo: 'techymwijay'
    })
    const result = await autoUpdater.checkForUpdates()
    return result?.updateInfo || null
  } catch (err) {
    console.error('[AutoUpdater] Check failed:', err)
    return null
  }
})

ipcMain.handle('updater:download', async () => {
  try {
    await autoUpdater.downloadUpdate()
    return true
  } catch (err) {
    console.error('[AutoUpdater] Download failed:', err)
    return false
  }
})

ipcMain.handle('updater:install', () => {
  autoUpdater.quitAndInstall()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})