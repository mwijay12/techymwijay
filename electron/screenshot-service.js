/**
 * Screenshot Service
 * Captures screen or window screenshots using desktopCapturer.
 * Returns base64 PNG that can be uploaded to Cloudinary or attached to vault.
 */

const { desktopCapturer, screen } = require('electron')

async function captureFullScreen() {
  try {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height },
    })

    if (sources.length === 0) {
      throw new Error('No screen sources available')
    }

    const primaryScreen = sources[0]
    const thumbnail = primaryScreen.thumbnail
    const dataUrl = thumbnail.toDataURL()

    return {
      success: true,
      dataUrl,
      width: thumbnail.getSize().width,
      height: thumbnail.getSize().height,
      sourceName: primaryScreen.name,
    }
  } catch (err) {
    console.warn('[Screenshot] Capture failed:', err.message)
    return {
      success: false,
      error: err.message,
    }
  }
}

async function getWindowSources() {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 300, height: 200 },
    })

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
    }))
  } catch (err) {
    console.warn('[Screenshot] Failed to get window sources:', err.message)
    return []
  }
}

async function captureWindow(sourceId) {
  try {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width, height },
    })

    const target = sources.find((s) => s.id === sourceId)
    if (!target) {
      throw new Error(`Window source ${sourceId} not found`)
    }

    const dataUrl = target.thumbnail.toDataURL()

    return {
      success: true,
      dataUrl,
      sourceName: target.name,
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

module.exports = {
  captureFullScreen,
  getWindowSources,
  captureWindow,
}
