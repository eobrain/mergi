
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
  const lookEl = document.getElementById('look')
  const questionEl = document.getElementById('question')
  const correctEl = document.getElementById('correct')
  const mehEl = document.getElementById('meh')
  const wrongEl = document.getElementById('wrong')

  const ask = () => {
    const { query, reversed } = order.head()
    cardEl.classList.add('offscreen')

    navIconsActive(true, false, false)
    setTimeout(() => {
      navIconsActive(false, true, false)
    }, 5000)

    if (reversed) {
      wordEl.classList.add('initial-back')
      wordEl.classList.add('back')
      imagesEl.classList.add('initial-front')
      imagesEl.classList.add('front')
    } else {
      wordEl.classList.add('initial-front')
      wordEl.classList.add('front')
      imagesEl.classList.add('initial-back')
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

  const think = () => {
    navIconsActive(false, true, false)
  }

  const cardReveal = () => {
    flip()
    navIconsActive(false, false, true)
  }

  const answerFn = (correctness) => () => {
    cardEl.classList.add('offscreen')
    order.update(correctness)
    flip()
    ask()
  }

  const correct = answerFn(1.0)
  const meh = answerFn(0.5)
  const wrong = answerFn(0.1)

  const activeIf = (el, active, onclick) => {
    if (active) {
      el.classList.add('active')
      el.onclick = onclick
    } else {
      el.classList.remove('active')
    }
  }
  const navIconsActive = (lookActive, questionActive, answersActive) => {
    activeIf(lookEl, lookActive, think)
    activeIf(questionEl, questionActive, cardReveal)
    activeIf(correctEl, answersActive, correct)
    activeIf(mehEl, answersActive, meh)
    activeIf(wrongEl, answersActive, wrong)
  }

  document.body.onload = ask
})()
