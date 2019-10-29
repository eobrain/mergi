
(() => {
  const { newCards, readCards, writeCards, images, merge, score } = window.common

  const order = (() => {
    const sort = () => {
      cards.sort((a, b) => score(a.responses) - score(b.responses))
    }

    const head = () => cards[0]

    const update = (correctness) => {
      const t = Date.now()
      cards[0].responses.push({ t, correctness })
      sort()
      writeCards(cards)
    }

    const cards = merge(readCards(), newCards())
    sort()

    return { head, update }
  })()

  const wordEl = document.getElementById('word')
  const imagesEl = document.getElementById('images')
  const correctEl = document.getElementById('correct')
  const mehEl = document.getElementById('meh')
  const wrongEl = document.getElementById('wrong')

  const ask = () => {
    const { query, reversed } = order.head()

    correctEl.style.display = 'none'
    mehEl.style.display = 'none'
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
    mehEl.style.display = 'inline'
    wrongEl.style.display = 'inline'
  }

  wordEl.onclick = () => {
    imagesEl.classList.remove('back')
    correctEl.style.display = 'inline'
    mehEl.style.display = 'inline'
    wrongEl.style.display = 'inline'
  }

  correctEl.onclick = () => {
    order.update(1.0)
    ask()
  }
  mehEl.onclick = () => {
    order.update(0.5)
    ask()
  }
  wrongEl.onclick = () => {
    order.update(0.1)
    ask()
  }

  document.body.onload = ask
})()
