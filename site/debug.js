/* global mergiWords, localStorage */

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
  existing.filter(hasImages).forEach((card) => {
    result.push(card)
    included[key(card)] = true
  })
  added.filter(hasImages).forEach((card) => {
    const k = key(card)
    if (!included[k]) {
      result.push(card)
      included[k] = true
    }
  })
  return result
}

document.body.onload = () => {
  const tableEl = document.getElementById('table')

  // Return ordered list of cards
  const newOrder = () => {
    const cards = []
    let score = 0
    for (let i = 0; i < 2; ++i) {
      const reversed = (i === 1)
      queries.forEach((query) => {
        ++score
        cards.push({ query, reversed, score })
      })
    }
    return cards
  }

  const sort = () => {
    order.sort((a, b) => a.score - b.score)
  }

  const KEY = 'mergi-order'
  const order = merge(JSON.parse(localStorage.getItem(KEY)), newOrder())
  sort()

  order.forEach((card) => {
    let imgHtml = ''
    const imagesOfQuery = images[card.query]
    if (imagesOfQuery) {
      imagesOfQuery.forEach((image) => {
        imgHtml += `<img src="${image.src}" width="${image.width}" height="${image.height}"/>`
      })
    } else {
      imgHtml = '(No images)'
    }

    const query = card.reversed ? card.query : `<strong>${card.query}</strong>`
    tableEl.insertAdjacentHTML('beforeend',
            `<tr><td>${card.score}</td><td>${query}</td><td>${imgHtml}</td></tr>`
    )
  })
}
