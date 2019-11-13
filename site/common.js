// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

import { mergiWords } from './words.js'

const lang = 'es'
const country = 'mx'

const phrases = []

export const toPhrase = (word) => word.prefix
  ? `(${word.prefix}) ${word.query}`
  : word.query

export const images = {} // list of images for each phrase
mergiWords.forEach((word) => {
  if (word.lang === lang && word.country === country) {
    const phrase = toPhrase(word)
    phrases.push(phrase)
    images[phrase] = word.images
  }
})

const key = (card) => `${card.phrase}|${card.reversed}`

export const merge = (existing, added) => {
  const result = []
  const included = {}
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

const TAO = 1000.0 * 60 * 60 * 24

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hashCode = (s) =>
  s.split('')
    .reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0)

const randomized = (s) => 0.5 + hashCode(s) / ((1 << 31) * 2.0)

export const score = (card) => {
  if (card.responses.length === 0) {
    return randomized(key(card))
  }
  const now = Date.now()
  const weightedSum = card.responses
    .map((response) => response.correctness * Math.exp((response.t - now) / TAO))
    .reduce((sum, x) => sum + x)
  return weightedSum / card.responses.length
}

// Return ordered list of cards
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

const KEY = 'mergi-order-v4'

export const writeCards = (cards) => {
  window.localStorage.setItem(KEY, JSON.stringify(cards))
}

export const readCards = () => JSON.parse(window.localStorage.getItem(KEY) || '[]')
