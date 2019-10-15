/* global mergiWords */

const lang = 'es'
const country = 'mx'

const words = []
mergiWords.forEach(word => {
  if (word.lang === lang && word.country === country) {
    words.push(word)
  }
})
const n = 2 * words.length
let order = []
for (let i = 0; i < n; ++i) {
  order.push(i)
}

const wordEl = document.getElementById('word')
const imagesEl = document.getElementById('images')
const correctEl = document.getElementById('correct')
const wrongEl = document.getElementById('wrong')

const ask = () => {
  const w = order[0]
  const word = words[Math.trunc(w / 2)]
  const showWord = 3 % 2

  correctEl.style.display = 'none'
  wrongEl.style.display = 'none'
  if (showWord) {
    wordEl.classList.add('front')
    imagesEl.classList.add('back')
  } else {
    wordEl.classList.add('back')
    imagesEl.classList.add('front')
  }
  wordEl.innerHTML = word.query
  while (imagesEl.firstChild) {
    imagesEl.removeChild(imagesEl.firstChild)
  }
  word.images.forEach((image) => {
    const imgEl = document.createElement('img')
    imgEl.src = image.src
    imgEl.width = image.width
    imgEl.height = image.height
    imagesEl.append(imgEl)
  })
}

wordEl.onclick = () => {
  imagesEl.classList.remove('back')
  correctEl.style.display = 'inline'
  wrongEl.style.display = 'inline'
}

correctEl.onclick = () => {
  order = [...order.slice(1), order[0]]
  ask()
}

document.body.onload = ask
