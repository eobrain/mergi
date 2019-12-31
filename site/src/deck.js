// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

import { newCards, readCards, merge, score, decay, SIX_HOURS } from './common.js'

document.body.onload = () => {
  const deckEl = document.getElementById('deck')

  const sort = () => {
    cards.sort((a, b) => score(a) - score(b))
  }

  const cards = merge(readCards(), newCards())
  sort()

  cards.forEach((card) => {
    const cardEl = document.createElement('li')
    if (card.reversed) {
      cardEl.className = 'reversed'
    }
    card.responses.forEach((r) => {
      const rEl = document.createElement('div')
      const color = `hsl(${120 * r.correctness}, ${100 * decay(r.t, SIX_HOURS)}%, 50%)`
      rEl.style.background = color
      cardEl.append(rEl)
    })
    cardEl.title = score(card)
    deckEl.append(cardEl)
  })
}
