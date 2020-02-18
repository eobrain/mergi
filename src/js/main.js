// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

import { newCards, merge, score } from './card.js'
import { readCards, writeCards } from './storage.js'
import { IndexedWords } from './word.js'
import { MAX_IMAGE_COUNT_PER_QUERY } from './shared.js'
import imageSearchUrl from './search_url.js'

/**
 * @param {string} lang 2-letter language code
 * @param {string} country 2-letter country code
 * @param {!Array<Word>} mergiWords scraped words and images
 * @returns {void}
 */
export default (lang, country, mergiWords) => {
  const words = new IndexedWords(lang, country, mergiWords)

  /**
   * An ordered list of cards.
   * @type {{
   * head: function(): Card,
   * updateHeadAndSort: function(number),
   * handleUrlHash: function(string)
   * }}
   */
  const order = (() => {
    const cards = merge(words, readCards(), newCards(words))
    const sort = () => {
      cards.sort((a, b) => score(a) - score(b))
    }
    sort()

    const head = () => cards[0]

    const updateHeadAndSort = (correctness) => {
      const t = Date.now()
      cards[0].responses.push({ t, correctness })
      sort()
      writeCards(cards)
    }

    const moveToBeginning = (xs, i) => {
      const x = xs[i]
      xs.splice(i, 1)
      xs.unshift(x)
    }

    const pluck = (side, phrase) => {
      const reversed = (side === 'images')
      const n = cards.length
      for (let i = 0; i < n; ++i) {
        if (cards[i].reversed === reversed && cards[i].phrase === phrase) {
          moveToBeginning(cards, i)
          console.info(`Plucking ${side} side of card "${phrase}"`)
          return
        }
      }
      console.warn(`${side} side of card "${phrase}" not found`)
    }

    const handleUrlHash = () => {
      if (document.location.hash) {
        const [side, phraseEncoded] = document.location.hash.substring(1).split(',')
        pluck(side, decodeURIComponent(phraseEncoded))
      }
    }
    handleUrlHash()

    return { head, updateHeadAndSort, handleUrlHash }
  })()

  /**
   * Return element with given ID or throw error if it does not exist.
   * @param {string} id attribute
   * @return {!Element} DOM element with given ID
   */
  const getElement = (id) => {
    const element = document.getElementById(id)
    if (!element) {
      throw new Error(`Bad page. No element with id="${id}"`)
    }
    return element
  }

  /**
   * Return firts element with given class or throw error if it does not exist.
   * @param {!Element} el DOM element
   * @param {string} classname CSS class
   * @return {!Element} DOM element with given class
   */
  const getChild = (el, classname) => {
    const element = el.getElementsByClassName(classname).item(0)
    if (!element) {
      throw new Error(`Bad page. No element with class="${classname}" in element`)
    }
    return element
  }

  const cardEl = getElement('card')
  const frontEl = getElement('front')
  const backEl = getElement('back')
  const correctEl = getElement('correct')
  const mehEl = getElement('meh')
  const wrongEl = getElement('wrong')
  const frontContainerEl = getChild(frontEl, 'content-container')
  const backContainerEl = getChild(backEl, 'content-container')

  /* global SpeechSynthesisUtterance, gtag */

  let revealSay = () => { }
  let unflipSay = () => { }

  /**
   * Log that user has viewed this screen
   * @param {string} screen name of screen
   * @returns {void}
   */
  const logScreenView = (screen) => {
    gtag('event', 'screen_view', { screen_name: screen })
  }
  /**
   * Log that user has viewed these items.
   * @param {string} items name of items
   * @returns {void}
   */
  const logViewItem = (items) => {
    gtag('event', 'view_item', { items })
  }
  /**
   * Log that user has responded with this correctness.
   * @param {number} correctness what fraction correct
   * @returns {void}
   */
  const logResponse = (correctness) => {
    gtag('event', 'response', { correctness })
  }

  /** Present the front of the card to the user.
   * @returns {void}
   */
  const ask = () => {
    const { phrase, reversed } = order.head()
    cardEl.classList.add('offscreen')

    navIconsActive(false)
    const queryText = phrase.split(')').slice(-1)[0].trim()

    let say = () => { }
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(queryText)
      utterance.lang = `${lang}-${country}`
      say = () => {
        window.speechSynthesis.speak(utterance)
      }
    }

    /**
     * Remove all current children from a DOM elements.
     * @param {!Element} element parent DOM element
     * @returns {void}
     */
    const removeContent = (element) => {
      while (element.firstElementChild) {
        element.firstElementChild.remove()
      }
    }

    /**
     * Add the images to one side of the card.
     * @param {!Element} imagesEl parent DOM element for the images
     * @returns {void}
     */
    const addImages = (imagesEl) => {
      let imageCount = 0
      words.forEachImageOf(phrase, (image) => {
        ++imageCount
        if (imageCount > MAX_IMAGE_COUNT_PER_QUERY) {
          return
        }
        const imgEl = document.createElement('img')
        imgEl.src = image.src
        imgEl.width = image.width
        imgEl.height = image.height
        imgEl.alt = `image search result ${imageCount}`
        const aspectRatio = image.width / image.height
        if (aspectRatio > 1.66666) {
          imgEl.className += ' landscape'
        } else if (aspectRatio < 0.6) {
          imgEl.className += ' portrait'
        } else {
          imgEl.className += ' square'
        }
        imagesEl.append(imgEl)
      })
    }

    /**
     * Add the phrase to the other side of the card.
     * @param {!Element} textCardEl DOM element in which to add phrase
     * @returns {void}
     */
    const addPhrase = (textCardEl) => {
      const pEl = document.createElement('p')
      pEl.innerHTML = phrase
      textCardEl.append(pEl)

      const searchEl = document.createElement('a')
      searchEl.href = imageSearchUrl(queryText, lang, country)
      searchEl.innerHTML = 'Serĉi'
      textCardEl.append(searchEl)
    }

    removeContent(frontContainerEl)
    removeContent(backContainerEl)
    backEl.className = 'unflipped'
    backEl.onclick = unflip
    frontEl.className = 'unflipped'
    frontEl.onclick = cardReveal
    if (reversed) {
      addImages(frontContainerEl)
      frontEl.classList.add('images')
      addPhrase(backContainerEl)
      backEl.classList.add('word')
      revealSay = say
      unflipSay = () => { }
      logScreenView('ask-image')
      logViewItem(`${phrase} [ask-image]`)
      document.location.hash = `images,${encodeURIComponent(phrase)}`
    } else {
      addPhrase(frontContainerEl)
      frontEl.classList.add('word')
      addImages(backContainerEl)
      backEl.classList.add('images')
      revealSay = () => { }
      unflipSay = say
      logScreenView('ask-text')
      logViewItem(`${phrase} [ask-text]`)
      document.location.hash = `phrase,${encodeURIComponent(phrase)}`
    }
    const internalHash = document.location.hash
    window.onhashchange = (event) => {
      if (document.location.hash !== internalHash) {
        order.handleUrlHash()
        ask()
      }
    }
  }

  /** Set the CSS classes that will trigger an animation to flip the card to show the answer side.
   * @returns {void}
  */
  const flip = () => {
    backEl.classList.add('flipped')
    frontEl.classList.add('flipped')
    backEl.classList.remove('unflipped')
    frontEl.classList.remove('unflipped')
    cardEl.classList.remove('offscreen')
    logScreenView('reveal')
  }

  /** Set the CSS classes that will trigger an animation to unflip the card to show the question side.
   * @returns {void}
  */
  const unflip = () => {
    unflipSay()
    backEl.classList.add('unflipped')
    frontEl.classList.add('unflipped')
    backEl.classList.remove('flipped')
    frontEl.classList.remove('flipped')
    logScreenView('unflip')
  }

  /** Reveal the answer.
   * @returns {void}
  */
  const cardReveal = () => {
    revealSay()
    flip()
    navIconsActive(true)
  }

  /**
   * @param {number} correctness to what degree was the user correct
   * @return {function()}  a function that updates the card deck with the user response
   */
  const answerFn = (correctness) => () => {
    logResponse(correctness)
    cardEl.classList.add('offscreen')
    order.updateHeadAndSort(correctness)
    flip()
    ask()
  }

  /** @type {function()} */
  const correct = answerFn(1.0)

  /** @type {function()} */
  const meh = answerFn(0.5)

  /** @type {function()} */
  const wrong = answerFn(0.1)

  /**
   * Change element to be active or not.
   * @param {!Element} el DOM element to be possibly made active
   * @param {boolean} active whether to make active
   * @param {function()} onclick applied if active
   * @returns {void}
   */
  const activeIf = (el, active, onclick) => {
    if (active) {
      el.classList.add('active')
      el.onclick = onclick
    } else {
      el.classList.remove('active')
      el.onclick = null
    }
  }

  /**
   * Update active (or not) status of the controls.
   * @param {boolean} answersActive whether answer icons are active
   * @returns {void}
   */
  const navIconsActive = (answersActive) => {
    activeIf(correctEl, answersActive, correct)
    activeIf(mehEl, answersActive, meh)
    activeIf(wrongEl, answersActive, wrong)
  }

  // Should be same as animation-duration in .offscreen CSS
  const OFFSCREEN_TIME_MS = 2000

  document.body.onload = () => {
    ask()

    // Hack to prevent animation on first card shown.
    // TODO(eob) see if this can be dine in pure CSS without JS
    setTimeout(() => {
      cardEl.classList.remove('initial')
    }, OFFSCREEN_TIME_MS)
  }
}
