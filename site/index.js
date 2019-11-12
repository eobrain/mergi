// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

import { newCards, readCards, writeCards, images, merge, score } from './common.js'

// TODO(eob) refactor this into someplace shared with other index.js
const MAX_IMAGE_COUNT_PER_QUERY = 15

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
const questionEl = document.getElementById('question')
const correctEl = document.getElementById('correct')
const mehEl = document.getElementById('meh')
const wrongEl = document.getElementById('wrong')

const ask = () => {
  const { phrase, reversed } = order.head()
  cardEl.classList.add('offscreen')

  navIconsActive(true, false)

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
  wordEl.innerHTML = phrase
  while (imagesEl.firstChild) {
    imagesEl.removeChild(imagesEl.firstChild)
  }
  let imageCount = 0
  images[phrase].forEach((image) => {
    ++imageCount
    if (imageCount > MAX_IMAGE_COUNT_PER_QUERY) {
      return
    }
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

const cardReveal = () => {
  flip()
  navIconsActive(false, true)
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
    el.onclick = undefined
  }
}
const navIconsActive = (questionActive, answersActive) => {
  activeIf(questionEl, questionActive, cardReveal)
  activeIf(correctEl, answersActive, correct)
  activeIf(mehEl, answersActive, meh)
  activeIf(wrongEl, answersActive, wrong)
}

document.body.onload = ask
