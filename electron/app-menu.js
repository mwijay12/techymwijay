/**
 * Application Menu Builder
 * Creates the native app menu bar for macOS and Windows/Linux.
 */

const { Menu, shell, app } = require('electron')

function buildAppMenu(mainWindow) {
  const isMac = process.platform === 'darwin'

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { label: 'About Mwijay Tech', role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),

    {
      label: 'File',
      submenu: [
        {
          label: 'New Meeting Recording',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('navigate-to', '/meeting'),
        },
        {
          label: 'Open Voice Studio',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => mainWindow.webContents.send('navigate-to', '/ai-stt'),
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow.webContents.send('navigate-to', '/settings'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },

    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow.webContents.isDevToolsOpened()) {
              mainWindow.webContents.closeDevTools()
            } else {
              mainWindow.webContents.openDevTools({ mode: 'detach' })
            }
          },
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    {
      label: 'Navigate',
      submenu: [
        {
          label: '🏠 Home',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow.webContents.send('navigate-to', '/'),
        },
        {
          label: '🎙️ Voice Dictation (STT)',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow.webContents.send('navigate-to', '/ai-stt'),
        },
        {
          label: '🔊 Text to Speech',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow.webContents.send('navigate-to', '/ai-tts'),
        },
        {
          label: '🔐 Developer Vault',
          accelerator: 'CmdOrCtrl+4',
          click: () => mainWindow.webContents.send('navigate-to', '/blog'),
        },
        {
          label: '💰 Spending Tracker',
          accelerator: 'CmdOrCtrl+5',
          click: () => mainWindow.webContents.send('navigate-to', '/spending'),
        },
        {
          label: '✅ Todos',
          accelerator: 'CmdOrCtrl+6',
          click: () => mainWindow.webContents.send('navigate-to', '/todos'),
        },
        {
          label: '🎙️ Meeting Recording',
          accelerator: 'CmdOrCtrl+7',
          click: () => mainWindow.webContents.send('navigate-to', '/meeting'),
        },
        {
          label: '🧠 AI Memory',
          accelerator: 'CmdOrCtrl+8',
          click: () => mainWindow.webContents.send('navigate-to', '/memory'),
        },
      ],
    },

    {
      label: 'Help',
      submenu: [
        {
          label: 'View on GitHub',
          click: () =>
            shell.openExternal('https://github.com/mwijay12/techymwijay'),
        },
        {
          label: 'Report an Issue',
          click: () =>
            shell.openExternal(
              'https://github.com/mwijay12/techymwijay/issues'
            ),
        },
        { type: 'separator' },
        {
          label: `About Mwijay Tech v${app.getVersion()}`,
          click: () => {
            const { dialog } = require('electron')
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Mwijay Tech',
              message: 'Mwijay Tech',
              detail: [
                `Version: ${app.getVersion()}`,
                `Electron: ${process.versions.electron}`,
                `Node.js: ${process.versions.node}`,
                `Platform: ${process.platform}`,
                '',
                'Built by Davie Mwijay',
                'Dar es Salaam, Tanzania 🇹🇿',
                '',
                '© 2026 Mwijay Tech',
              ].join('\n'),
              buttons: ['OK'],
            })
          },
        },
      ],
    },
  ]

  return Menu.buildFromTemplate(template)
}

module.exports = { buildAppMenu }
