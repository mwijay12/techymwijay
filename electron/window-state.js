/**
 * Window State Persistence
 * Saves and restores window size + position across restarts.
 * Uses a simple JSON file in the app data directory.
 */

const { app, screen } = require('electron')
const fs = require('fs')
const path = require('path')

const STATE_FILE = path.join(
  app.getPath('userData'),
  'window-state.json'
)

const DEFAULT_STATE = {
  width: 1280,
  height: 800,
  x: undefined,
  y: undefined,
  isMaximized: false,
}

function loadWindowState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
      const displays = screen.getAllDisplays()
      const validPosition = displays.some(display => {
        const bounds = display.bounds
        return (
          data.x >= bounds.x &&
          data.y >= bounds.y &&
          data.x + data.width <= bounds.x + bounds.width &&
          data.y + data.height <= bounds.y + bounds.height
        )
      })

      if (validPosition || data.x === undefined) {
        return { ...DEFAULT_STATE, ...data }
      }
    }
  } catch {
    // Ignore errors — use defaults
  }
  return { ...DEFAULT_STATE }
}

function saveWindowState(win) {
  if (!win || win.isDestroyed()) return
  try {
    const isMaximized = win.isMaximized()
    const bounds = win.getBounds()

    const state = {
      width: isMaximized ? DEFAULT_STATE.width : bounds.width,
      height: isMaximized ? DEFAULT_STATE.height : bounds.height,
      x: isMaximized ? undefined : bounds.x,
      y: isMaximized ? undefined : bounds.y,
      isMaximized,
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  } catch {
    // Ignore errors
  }
}

module.exports = { loadWindowState, saveWindowState }
