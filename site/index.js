
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

  const cardEl = document.getElementById('card')
  const wordEl = document.getElementById('word')
  const imagesEl = document.getElementById('images')
  const correctEl = document.getElementById('correct')
  const mehEl = document.getElementById('meh')
  const wrongEl = document.getElementById('wrong')

  const ask = () => {
    const { query, reversed } = order.head()
    cardEl.classList.add('offscreen')

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

  const flip = () => {
    const backs = Array.from(document.getElementsByClassName('back'))
    const fronts = Array.from(document.getElementsByClassName('front'))
    backs.forEach((e) => e.classList.replace('back', 'front'))
    fronts.forEach((e) => e.classList.replace('front', 'back'))
    cardEl.classList.remove('offscreen')
  }

  imagesEl.onclick = () => {
    // cardEl.classList.add('flip')
    flip()
    correctEl.style.display = 'inline'
    mehEl.style.display = 'inline'
    wrongEl.style.display = 'inline'
  }

  wordEl.onclick = () => {
    // cardEl.classList.add('flip')
    flip()
    correctEl.style.display = 'inline'
    mehEl.style.display = 'inline'
    wrongEl.style.display = 'inline'
  }

  correctEl.onclick = () => {
    cardEl.classList.add('offscreen')
    order.update(1.0)
    flip()
    ask()
  }
  mehEl.onclick = () => {
    cardEl.classList.add('offscreen')
    order.update(0.5)
    flip()
    ask()
  }
  wrongEl.onclick = () => {
    cardEl.classList.add('offscreen')
    order.update(0.1)
    flip()
    ask()
  }

  document.body.onload = ask
})()
