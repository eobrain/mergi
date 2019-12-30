
/**
 * @fileoverview Declarations for the closure compiler. Not part of the production code.
 * @externs
 */

/** Represents a flashcard presented to the user and the history of
 * user interactions with it. A card has two sides, one showing a phrase
 * the other a series of images.  A "reversed" card is one where the
 * image-side is shown first, otherwise the phrase-side is shown.
 * The history of user interaction is stored as an array of responses,
 * each of which is a timestamp of the interaction and a degree of correctness
 * of the response.
@typedef {{
   phrase: string,
   reversed: boolean,
   responses: !Array<{
     t: number,
     correctness: number,
   }>,
}} */
let Card

/** Attributes of an image to be displayed on one side of the flashcard.
@typedef {{
   width: number,
   height: number,
   src: string,
}} */
let Img

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
let Word

/** Google Analytics call. */
let gtag