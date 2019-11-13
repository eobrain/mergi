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
const frontEl = document.getElementById('front')
const backEl = document.getElementById('back')
const questionEl = document.getElementById('question')
const correctEl = document.getElementById('correct')
const mehEl = document.getElementById('meh')
const wrongEl = document.getElementById('wrong')

const ask = () => {
  const { phrase, reversed } = order.head()
  cardEl.classList.add('offscreen')

  navIconsActive(true, false)

  const makeEmpty = (el) => {
    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }
  }

  const addImages = (imagesEl) => {
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
  makeEmpty(frontEl)
  makeEmpty(backEl)
  backEl.className = 'unflipped'
  frontEl.className = 'unflipped'
  if (reversed) {
    addImages(frontEl)
    frontEl.classList.add('images')
    backEl.innerHTML = phrase
    backEl.classList.add('word')
  } else {
    frontEl.innerHTML = phrase
    frontEl.classList.add('word')
    addImages(backEl)
    backEl.classList.add('images')
  }
}

const flip = () => {
  backEl.classList.add('flipped')
  frontEl.classList.add('flipped')
  backEl.classList.remove('unflipped')
  frontEl.classList.remove('unflipped')
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
