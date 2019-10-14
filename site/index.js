/* global mergiWords */

const lang = 'es'
const country = 'mx'

const words = []
mergiWords.forEach(word => {
  if (word.lang === lang && word.country === country) {
    words.push(word)
  }
})

document.body.onload = () => {
  const wordEl = document.getElementById('word')
  const imagesEl = document.getElementById('images')
  wordEl.innerHTML = words[0].query
  words[0].images.forEach((image) => {
    const imgEl = document.createElement('img')
    imgEl.src = image.src
    imgEl.width = image.width
    imgEl.height = image.height
    imagesEl.append(imgEl)
  })
}
