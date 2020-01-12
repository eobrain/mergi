// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

// See description of Word and Img types in extern.js

/**
 * The text displayed on each flashcard.
 * @type {!Array<string>}
 */
const phrases = []

/**
 * list of images for each phrase
 * @type {!Object<string, !Array<Img> >}
 */
const images = {}

/**
 * Extract the display phrase from the Word object.
 * @param {Word} word
 * @return {string} the phrase to display
 */
export const toPhrase = (word) => word.prefix
  ? `(${word.prefix}) ${word.query}`
  : word.query

/**
 * @param {string} lang
 * @param {string} country
 * @param {!Array<Word>} mergiWords
 */
export const init = (lang, country, mergiWords) => {
  // Initialize phrases and images.
  mergiWords.forEach((word) => {
    if (word.lang === lang && word.country === country) {
      const phrase = toPhrase(word)
      phrases.push(phrase)
      images[phrase] = word.images
    }
  })
}

/** Whether a card has images.
 * @param {!Card} card
 * @return {boolean}
 */
export const hasImages = (card) => !!images[card.phrase]

/** Iterate through all the phrases
 * @param {function(string)} f
*/
export const forEachPhrase = (f) => { phrases.forEach(f) }

/** Iterate through all the images of a phrase
 * @param {function(Img)} f
*/
export const forEachImageOf = (phrase, f) => {
  const imagesOfPhrase = images[phrase]
  if (imagesOfPhrase) {
    imagesOfPhrase.forEach(f)
  }
}
