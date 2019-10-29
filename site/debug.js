/* global localStorage */

(() => {
  const { newCards, readCards, images, merge, score } = window.common

  document.body.onload = () => {
    const tableEl = document.getElementById('table')

    const sort = () => {
      cards.sort((a, b) => a.score - b.score)
    }

    const cards = merge(readCards(), newCards())
    sort()

    cards.forEach((card) => {
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
      const responsesString = JSON.stringify(card.responses.map((r) => `${r.correctness}`))
      tableEl.insertAdjacentHTML('beforeend',
            `<tr><td>${score(card.responses)}</td><td>${responsesString}</td><td>${query}</td><td>${imgHtml}</td></tr>`
      )
    })
  }
})()
