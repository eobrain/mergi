// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

/** Key used to store the cards in the browser local storage. */
const KEY = 'mergi-order-v4'

/**
 * Write the cards to local storage.
 * @param {!Array<Card>} cards to write
 * @returns {void}
 */
export const writeCards = cards => {
  window.localStorage.setItem(KEY, JSON.stringify(cards))
}

/**
 * @return {!Array<Card>} cards read from local storage
 */
export const readCards = () =>
  /**  @type {!Array<Card>} */
  (JSON.parse(window.localStorage.getItem(KEY) || '[]'))
