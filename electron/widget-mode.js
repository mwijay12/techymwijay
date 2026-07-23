/**
 * Desktop Widget Mode
 * A compact always-on-top window showing quick info and actions.
 * Position: bottom-right corner of primary display.
 */

const { BrowserWindow, screen } = require('electron')
const path = require('path')

let widgetWindow = null
const isDev = process.env.NODE_ENV === 'development'

function createWidget() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.show()
    widgetWindow.focus()
    return widgetWindow
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const WIDGET_WIDTH = 320
  const WIDGET_HEIGHT = 480
  const MARGIN = 20

  widgetWindow = new BrowserWindow({
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    x: width - WIDGET_WIDTH - MARGIN,
    y: height - WIDGET_HEIGHT - MARGIN,
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    backgroundColor: '#0f0f1a',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const widgetUrl = isDev
    ? 'http://localhost:3000/todos'
    : `file://${path.join(__dirname, '../out/todos.html')}`

  widgetWindow.loadURL(widgetUrl).catch((err) => {
    console.warn('[Widget] Failed to load URL:', err)
  })

  widgetWindow.once('ready-to-show', () => {
    widgetWindow.show()
  })

  widgetWindow.on('closed', () => {
    widgetWindow = null
  })

  widgetWindow.setAlwaysOnTop(true, 'floating')

  return widgetWindow
}

function toggleWidget() {
  if (!widgetWindow || widgetWindow.isDestroyed()) {
    createWidget()
    return true
  }

  if (widgetWindow.isVisible()) {
    widgetWindow.hide()
    return false
  } else {
    widgetWindow.show()
    widgetWindow.focus()
    return true
  }
}

function closeWidget() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.close()
    widgetWindow = null
  }
}

function isWidgetOpen() {
  return (
    widgetWindow !== null &&
    !widgetWindow.isDestroyed() &&
    widgetWindow.isVisible()
  )
}

module.exports = {
  createWidget,
  toggleWidget,
  closeWidget,
  isWidgetOpen,
}
