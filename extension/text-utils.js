/* Shared pure text helpers for the extension and its Node tests. */
;(function exposeTextUtils(root, factory) {
  const utils = factory()
  if (typeof module === 'object' && module.exports) module.exports = utils
  else root.MwijayTextUtils = utils
})(globalThis, function createTextUtils() {
  const CLOSING_PUNCTUATION = /^[.,!?;:%)\]}…]/
  const SENTENCE_END = /[.!?…]["'’”)\]]*\s*$/
  const NOISE_ONLY = /^\[?(blank_audio|silence|music|inaudible)\]?$/i

  function cleanTranscript(value) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim()
    return NOISE_ONLY.test(text) || /^\((silence|music|inaudible)\)$/i.test(text) ? '' : text
  }

  // Returns the text chunk to insert, maintaining natural spaces and sentence starts.
  function joinUtterance(before, spoken, after = '') {
    const prefix = String(before ?? '')
    const suffix = String(after ?? '')
    let text = cleanTranscript(spoken)
    if (!text) return ''

    const prefixTrimmed = prefix.replace(/[ \t]+$/, '')
    const atBlockStart = !prefixTrimmed || /\n$/.test(prefix)
    if (atBlockStart || SENTENCE_END.test(prefixTrimmed)) {
      text = text.charAt(0).toLocaleUpperCase() + text.slice(1)
    }

    const needsLeadingSpace = Boolean(prefix) && !/\s$/.test(prefix) && !CLOSING_PUNCTUATION.test(text)
    const needsTrailingSpace = Boolean(suffix) && !/^\s/.test(suffix) &&
      !/[([{“‘]$/.test(text) && !CLOSING_PUNCTUATION.test(suffix)
    return `${needsLeadingSpace ? ' ' : ''}${text}${needsTrailingSpace ? ' ' : ''}`
  }

  function insertAtCaret(value, spoken, start, end = start) {
    const original = String(value ?? '')
    const from = Math.max(0, Math.min(original.length, Number.isInteger(start) ? start : original.length))
    const to = Math.max(from, Math.min(original.length, Number.isInteger(end) ? end : from))
    const prefix = original.slice(0, from)
    const suffix = original.slice(to)
    const insertion = joinUtterance(prefix, spoken, suffix)
    return {
      value: `${prefix}${insertion}${suffix}`,
      cursor: from + insertion.length,
      insertedText: insertion,
    }
  }

  return { cleanTranscript, joinUtterance, insertAtCaret }
})
