/**
 * System Tray Menu Builder
 * Creates the system tray icon and right-click context menu.
 */

const { Tray, Menu, nativeImage, app } = require('electron')
const path = require('path')

let tray = null

function createTray(mainWindow) {
  const iconPath = path.join(__dirname, 'icons', 'icon.png')
  let trayIcon

  try {
    const rawIcon = nativeImage.createFromPath(iconPath)
    trayIcon = rawIcon.resize({ width: 22, height: 22 })
  } catch {
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('Mwijay Tech — AI Productivity OS')

  const buildContextMenu = (isOnline) => {
    return Menu.buildFromTemplate([
      {
        label: 'Mwijay Tech',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '🎙️ Voice Dictation',
        accelerator: 'CmdOrCtrl+Shift+M',
        click: () => {
          showAndNavigate(mainWindow, '/ai-stt')
        },
      },
      {
        label: '🔊 Text to Speech',
        click: () => showAndNavigate(mainWindow, '/ai-tts'),
      },
      {
        label: '🔐 Developer Vault',
        click: () => showAndNavigate(mainWindow, '/blog'),
      },
      {
        label: '💰 Spending Tracker',
        click: () => showAndNavigate(mainWindow, '/spending'),
      },
      {
        label: '✅ Todos',
        click: () => showAndNavigate(mainWindow, '/todos'),
      },
      {
        label: '🎙️ Meeting Transcription',
        click: () => showAndNavigate(mainWindow, '/meeting'),
      },
      {
        label: '🧠 AI Memory',
        click: () => showAndNavigate(mainWindow, '/memory'),
      },
      { type: 'separator' },
      {
        label: isOnline
          ? '🟢 Online — AI Ready'
          : '🔴 Offline — Limited Mode',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '⚙️ Settings',
        click: () => showAndNavigate(mainWindow, '/settings'),
      },
      {
        label: 'Show / Hide Window',
        click: () => {
          if (!mainWindow || mainWindow.isDestroyed()) return
          if (mainWindow.isVisible()) {
            mainWindow.hide()
          } else {
            mainWindow.show()
            mainWindow.focus()
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit Mwijay Tech',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.isQuitting = true
          app.quit()
        },
      },
    ])
  }

  tray.setContextMenu(buildContextMenu(true))

  tray.on('double-click', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    if (mainWindow.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  function updateTrayMenu(isOnline) {
    if (tray && !tray.isDestroyed()) {
      tray.setContextMenu(buildContextMenu(isOnline))
      tray.setToolTip(
        isOnline ? 'Mwijay Tech — Online' : 'Mwijay Tech — Offline Mode'
      )
    }
  }

  return { tray, updateTrayMenu }
}

function showAndNavigate(mainWindow, route) {
  if (!mainWindow || mainWindow.isDestroyed()) return

  if (!mainWindow.isVisible()) {
    mainWindow.show()
  }
  mainWindow.focus()

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.webContents.send('navigate-to', route)
}

function destroyTray() {
  if (tray && !tray.isDestroyed()) {
    tray.destroy()
    tray = null
  }
}

module.exports = { createTray, destroyTray, showAndNavigate }
