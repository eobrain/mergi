// Copyright (c) 2019-2020 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

// See description of Word and Img types in extern.js

/**
 * Extract the display phrase from the Word object.
 * @param {Word} word scraped
 * @return {string} the phrase to display
 */
export const toPhrase = (word) => word.prefix
  ? `(${word.prefix}) ${word.query}`
  : word.query

/** Indexed word and image data for fast lookup. */
export class IndexedWords {
  /**
   * @param {string} lang 2-letter language code
   * @param {string} country -2-letter
   * @param {!Array<Word>} mergiWords scraped images for each word
   */
  constructor (lang, country, mergiWords) {
    /**
   * The text displayed on each flashcard.
   * @type {!Array<string>}
   */
    this.phrases = []

    /**
   * list of images for each phrase
   * @type {!Object<string, !Array<Img> >}
   */
    this.images = {}

    // Initialize phrases and images.
    mergiWords.forEach((word) => {
      if (word.lang === lang && word.country === country) {
        const phrase = toPhrase(word)
        this.phrases.push(phrase)
        this.images[phrase] = word.images
      }
    })
  }

  /**
   * @param {!Card} card one side of a flashcard
   * @return {boolean} whether card has images
   */
  hasImages (card) {
    return !!this.images[card.phrase]
  }

  /** Iterate through all the phrases
   * @param {function(string)} f callback
   * @returns {void}
  */
  forEachPhrase (f) {
    this.phrases.forEach(f)
  }

  /**
   * @param {string} phrase to find images of
   * @returns {!Array[Img]} the images of a phrase
   */
  imagesOf (phrase) {
    return this.images[phrase] || []
  }
}
