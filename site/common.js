/* global mergiWords, localStorage */

window.common = (() => {
  const lang = 'es'
  const country = 'mx'

  const queries = [] // the phrases
  const images = {} // list of images for each phrase
  mergiWords.forEach((word) => {
    if (word.lang === lang && word.country === country) {
      queries.push(word.query)
      images[word.query] = word.images
    }
  })

  const merge = (existing, added) => {
    const key = (card) => `${card.query}|${card.reversed}`
    const result = []
    const included = {}
    const hasImages = (card) => !!images[card.query]
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

  const score = (responses) => {
    if (responses.length === 0) {
      return -1
    }
    const now = Date.now()
    const weightedSum = responses
      .map((response) => response.correctness * Math.exp((response.t - now) / TAO))
      .reduce((sum, x) => sum + x)
    return weightedSum / responses.length
  }

  // Return ordered list of cards
  const newCards = () => {
    const cards = []
    for (let i = 0; i < 2; ++i) {
      const reversed = (i === 1)
      queries.forEach((query) => {
        const responses = []
        cards.push({ query, reversed, responses })
      })
    }
    return cards
  }

  const KEY = 'mergi-order-v3'

  const writeCards = (cards) => {
    localStorage.setItem(KEY, JSON.stringify(cards))
  }

  const readCards = () => JSON.parse(localStorage.getItem(KEY))

  return { newCards, readCards, writeCards, images, merge, score }
})()
