// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

import { newCards, readCards, writeCards, images, merge, score } from './common.js'
import { imageSearchUrl } from './searchurl.js'

// TODO(eob) refactor this into someplace shared with other index.js
const MAX_IMAGE_COUNT_PER_QUERY = 15

const LANGUAGE = 'es'
const COUNTRY = 'mx'

const order = (() => {
  const cards = merge(readCards(), newCards())
  const sort = () => {
    cards.sort((a, b) => score(a) - score(b))
  }
  sort()

  const head = () => cards[0]

  const update = (correctness) => {
    const t = Date.now()
    cards[0].responses.push({ t, correctness })
    sort()
    writeCards(cards)
  }

  return { head, update }
})()

const cardEl = document.getElementById('card')
const frontEl = document.getElementById('front')
const backEl = document.getElementById('back')
const questionEl = document.getElementById('question')
const correctEl = document.getElementById('correct')
const mehEl = document.getElementById('meh')
const wrongEl = document.getElementById('wrong')

/* global SpeechSynthesisUtterance, gtag */

let revealSay = () => {}

const logScreenView = (screen) => {
  gtag('event', 'screen_view', { screen_name: screen })
}
const logViewItem = (items) => {
  gtag('event', 'view_item', { items })
}
const logResponse = (correctness) => {
  gtag('event', 'response', { correctness })
}

const ask = () => {
  const { phrase, reversed } = order.head()
  cardEl.classList.add('offscreen')

  navIconsActive(true, false)
  const queryText = phrase.split(')').slice(-1)[0].trim()

  let say = () => {}
  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(queryText)
    utterance.lang = `${LANGUAGE}-${COUNTRY}`
    say = () => {
      window.speechSynthesis.speak(utterance)
    }
  }

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
      imgEl.alt = `image search result ${imageCount}`
      imagesEl.append(imgEl)
    })
    imagesEl.onclick = () => {
      window.location = imageSearchUrl(queryText, LANGUAGE, COUNTRY)
    }
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
    revealSay = say
    logScreenView('ask-image')
    logViewItem(`${phrase} [ask-image]`)
  } else {
    say()
    frontEl.innerHTML = phrase
    frontEl.classList.add('word')
    addImages(backEl)
    backEl.classList.add('images')
    revealSay = () => {}
    logScreenView('ask-text')
    logViewItem(`${phrase} [ask-text]`)
  }
}

const flip = () => {
  backEl.classList.add('flipped')
  frontEl.classList.add('flipped')
  backEl.classList.remove('unflipped')
  frontEl.classList.remove('unflipped')
  cardEl.classList.remove('offscreen')
  logScreenView('reveal')
}

const cardReveal = () => {
  revealSay()
  flip()
  navIconsActive(false, true)
}

const answerFn = (correctness) => () => {
  logResponse(correctness)
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
