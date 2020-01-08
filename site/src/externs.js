/**
 * @fileoverview Declarations for the closure compiler. Not part of the production code.
 * @externs
 */

// @ts-check

/** Represents a flashcard presented to the user and the history of
 * user interactions with it. A card has two sides, one showing a phrase
 * the other a series of images.  A "reversed" card is one where the
 * image-side is shown first, otherwise the phrase-side is shown.
 * The history of user interaction is stored as an array of responses,
 * each of which is a timestamp of the interaction and a degree of correctness
 * of the response. Also contains the locale to be used as part of
 * the local storage key.
@typedef {{
   phrase: string,
   reversed: boolean,
   responses: !Array<{
     t: number,
     correctness: number,
   }>,
}} */
let Card // eslint-disable-line no-unused-vars

/** Attributes of an image to be displayed on one side of the flashcard.
@typedef {{
   width: number,
   height: number,
   src: string,
}} */
let Img // eslint-disable-line no-unused-vars

/** Data for one flashcard, scraped from the response to an image search query.
 * It includes the locale (language code and country code), the search query,
 * a prefix (for example an article) to be added to the query to form the phrase
 * on one side of the flashcard, and a list of images to be displayed on the
 * other side of the card.
@typedef {{
   lang: string,
   country: string,
   query: string,
   prefix: string,
   images: !Array<Img>,
}} */
let Word // eslint-disable-line no-unused-vars

/** Google Analytics call. */
let gtag // eslint-disable-line no-unused-vars
