/* global mergiWords, localStorage */

const lang = 'es'
const country = 'mx'

const images = {}
const queries = []
mergiWords.forEach((word) => {
  if (word.lang === lang && word.country === country) {
    queries.push(word.query)
    images[word.query] = word.images
  }
})

const order = (() => {
  const newOrder = () => {
    const result = []
    let score = 0
    for (let i = 0; i < 2; ++i) {
      const reversed = (i === 1)
      queries.forEach((query) => {
        ++score
        result.push({ query, reversed, score })
      })
    }
    return result
  }

  const KEY = 'mergi-order'
  const order = JSON.parse(localStorage.getItem(KEY)) || newOrder()
  const sort = () => {
    order.sort((a, b) => a.score - b.score)
  }
  sort()

  const head = () => order[0]

  const update = (dScore) => {
    order[0].score += dScore
    sort()
    localStorage.setItem(KEY, JSON.stringify(order))
  }

  return { head, update }
})()

const wordEl = document.getElementById('word')
const imagesEl = document.getElementById('images')
const correctEl = document.getElementById('correct')
const wrongEl = document.getElementById('wrong')

const ask = () => {
  const { query, reversed } = order.head()

  correctEl.style.display = 'none'
  wrongEl.style.display = 'none'
  if (reversed) {
    wordEl.classList.add('back')
    imagesEl.classList.add('front')
  } else {
    wordEl.classList.add('front')
    imagesEl.classList.add('back')
  }
  wordEl.innerHTML = query
  while (imagesEl.firstChild) {
    imagesEl.removeChild(imagesEl.firstChild)
  }
  images[query].forEach((image) => {
    const imgEl = document.createElement('img')
    imgEl.src = image.src
    imgEl.width = image.width
    imgEl.height = image.height
    imagesEl.append(imgEl)
  })
}

imagesEl.onclick = () => {
  wordEl.classList.remove('back')
  correctEl.style.display = 'inline'
  wrongEl.style.display = 'inline'
}

wordEl.onclick = () => {
  imagesEl.classList.remove('back')
  correctEl.style.display = 'inline'
  wrongEl.style.display = 'inline'
}

correctEl.onclick = () => {
  order.update(10)
  ask()
}
wrongEl.onclick = () => {
  order.update(2)
  ask()
}

document.body.onload = ask
