const test = require('node:test')
const assert = require('node:assert/strict')
const { cleanTranscript, joinUtterance, insertAtCaret } = require('../text-utils.js')

test('cleans whitespace and drops speech-recognition noise markers', () => {
  assert.equal(cleanTranscript('  hello\n   there  '), 'hello there')
  assert.equal(cleanTranscript('[BLANK_AUDIO]'), '')
  assert.equal(cleanTranscript('(inaudible)'), '')
})

test('capitalizes a new phrase and sentences while preserving mid-sentence case', () => {
  assert.equal(joinUtterance('', 'hello there'), 'Hello there')
  assert.equal(joinUtterance('First sentence. ', 'next one'), 'Next one')
  assert.equal(joinUtterance('I visited', 'Dar es Salaam'), ' Dar es Salaam')
})

test('joins words without extra spaces and keeps punctuation at the caret', () => {
  assert.equal(joinUtterance('hello', 'world'), ' world')
  assert.equal(joinUtterance('Wait', '...'), '...')
  assert.equal(joinUtterance('hello', ',', ' world'), ',')
  assert.equal(joinUtterance('hello', 'world', '!'), ' world')
})

test('inserts at a collapsed caret and separates existing words', () => {
  assert.deepEqual(insertAtCaret('helloWorld', 'again', 5), {
    value: 'hello again World',
    cursor: 12,
    insertedText: ' again ',
  })
})

test('replaces selected text at the caret and keeps the remainder', () => {
  assert.deepEqual(insertAtCaret('I typed wrong text', 'the right words', 8, 18), {
    value: 'I typed the right words',
    cursor: 23,
    insertedText: 'the right words',
  })
})

test('does not add spaces around punctuation or at whitespace boundaries', () => {
  assert.deepEqual(insertAtCaret('Done. next', 'Really?', 6), {
    value: 'Done. Really? next',
    cursor: 14,
    insertedText: 'Really? ',
  })
})
