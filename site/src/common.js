// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

/**
 * The text displayed on each flashcard.
 * @type {!Array<string>}
 */
const phrases = []

/**
 * list of images for each phrase
 * @type {!Object<string, !Array<Img> >}
 */
export const images = {}

/**
 * Extract the display phrase from the Word object.
 * @param {Word} word
 * @return {string} the phrase to display
 */
export const toPhrase = (word) => word.prefix
  ? `(${word.prefix}) ${word.query}`
  : word.query

/**
 * @param {string} lang
 * @param {string} country
 * @param {!Array<Word>} mergiWords
 */
export const init = (lang, country, mergiWords) => {
  // Initialize phrases and images.
  mergiWords.forEach((word) => {
    if (word.lang === lang && word.country === country) {
      const phrase = toPhrase(word)
      phrases.push(phrase)
      images[phrase] = word.images
    }
  })
}

/**
 * The string to use as a key for a card.
 * @param {Card} card
 * @return {string} lookup key for card
 */
const key = (card) => `${card.phrase}|${card.reversed}`

/**
 * Merge two arrays of cards
 * @param {!Array<Card>} existing cards
 * @param {!Array<Card>} added cards
 * @return {!Array<Card>} the union of the two lists
 */
export const merge = (existing, added) => {
  const result = []
  const included = {}

  /** Whether a card has images.
   * @param {!Card} card
   * @return {boolean}
  */
  const hasImages = (card) => !!images[card.phrase]
  if (existing) {
    existing.filter(hasImages).forEach((card) => {
      result.push(card)
      included[key(card)] = true
    })
  }
  if (added) {
    added.filter(hasImages).forEach((card) => {
      const k = key(card)
      if (!included[k]) {
        result.push(card)
        included[k] = true
      }
    })
  }
  return result
}

/** @type {number} */
export const SIX_HOURS = 1000.0 * 60 * 60 * 6

/** @type {number} */
const FIVE_MINUTES = 1000.0 * 60 * 5

/**
* https://stackoverflow.com/a/52171480/978525
 *
 * @param {string} s
 * @return {number}
 */
const hashCode = (s) => {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0, ch; i < s.length; i++) {
    ch = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909)
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/**
 * Hash string to number between zero and one.
 * @param {string} s
 * @return {number} string hashed to a value between zero and one
 */
const randomized = (s) => hashCode(s) / ((1 << 31) * 2.0)

/** @type number */
const now = Date.now()

/**
 * Exponential time decay
 * @param {number} t time in the past in epoch milliseconds
 * @param {number} tao time constant in milliseconds
 * @return {number} exp(-dt/tao)
 */
export const decay = (t, tao) => Math.exp((t - now) / tao)

/**
 * Score used to determine the position of the card in the pack, depending
 * on response and current time.
 * @param {Card} card
 * @return {number}
 */
export const score = (card) => {
  const responseCount = card.responses.length
  if (responseCount === 0) {
    return randomized(key(card))
  }
  const tLatest = card.responses[responseCount - 1].t
  return decay(tLatest, FIVE_MINUTES) + card.responses
    .map((response) => (response.correctness - 0.5) * decay(response.t, SIX_HOURS))
    .reduce((sum, x) => sum + x)
}

/** Use phrases list to generate card list.
 * There will be twice as many cards as phrases because there will be
 * both a reversed and non-reversed card for each phrase.
 * All cards start with empty responses list.
 * @return {!Array<Card>} ordered list of cards
 */
export const newCards = () => {
  const cards = []
  for (let i = 0; i < 2; ++i) {
    const reversed = (i === 1)
    phrases.forEach((phrase) => {
      const responses = []
      cards.push({ phrase, reversed, responses })
    })
  }
  return cards
}

/** Key used to store the cards in the browser local storage. */
const KEY = 'mergi-order-v4'

/**
 * Write the cards to local storage.
 * @param {!Array<Card>} cards to write
 */
export const writeCards = (cards) => {
  window.localStorage.setItem(KEY, JSON.stringify(cards))
}

/**
 * Read cards from local storage.
 * @return {!Array<Card>}
 */
export const readCards = () =>
  /**  @type {!Array<Card>} */
  (JSON.parse(window.localStorage.getItem(KEY) || '[]'))
