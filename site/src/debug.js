// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

import { newCards, readCards, images, merge, score } from './common.js'

document.body.onload = () => {
  const tableEl = document.getElementById('table')

  const sort = () => {
    cards.sort((a, b) => score(a) - score(b))
  }

  const cards = merge(readCards(), newCards())
  sort()

  cards.forEach((card) => {
    let imgHtml = ''
    const imagesOfPhrase = images[card.phrase]
    if (imagesOfPhrase) {
      imagesOfPhrase.forEach((image) => {
        imgHtml += `<img src="${image.src}" width="${image.width}" height="${image.height}"/>`
      })
    } else {
      imgHtml = '(No images)'
    }

    const phrase = card.reversed ? card.phrase : `<strong>${card.phrase}</strong>`
    const responsesString = JSON.stringify(card.responses.map((r) => `${r.correctness}`))
    tableEl.insertAdjacentHTML('beforeend',
        `<tr><td>${score(card)}</td><td>${responsesString}</td><td>${phrase}</td><td>${imgHtml}</td></tr>`
    )
  })
}
