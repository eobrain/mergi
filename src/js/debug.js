// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

import {newCards, merge, score} from './card.js';
import {readCards} from './storage.js';
import {init, forEachImageOf} from './word.js';
import imageSearchUrl from './search_url.js';

/**
 * @param {string} lang 2-letter language code
 * @param {string} country 2-letter country code
 * @param {!Array<Word>} mergiWords scraped words and images
 * @return {void}
 */
export default (lang, country, mergiWords) => {
  init(lang, country, mergiWords);

  document.body.onload = () => {
    const tableEl = document.getElementById('table');

    const sort = () => {
      cards.sort((a, b) => score(a) - score(b));
    };

    const cards = merge(readCards(), newCards());
    sort();

    cards.forEach((card) => {
      if (card.reversed) {
        return;
      }
      let imgHtml = '';

      forEachImageOf(card.phrase, (image) => {
        imgHtml +=
          `<img
              src="${image.src}"
              width="${image.width}"
              height="${image.height}"/>`;
      });
      imgHtml = imgHtml || '(No images)';

      const queryText = card.phrase.split(')').slice(-1)[0].trim();
      const phraseLink =
        `<a href="${imageSearchUrl(queryText, lang, country)}">
           ${card.phrase}
         </a>`;
      const responsesString = JSON.stringify(
          card.responses.map((r) => `${r.correctness}`));
      tableEl.insertAdjacentHTML('beforeend',
          `<tr>
             <td>${score(card)}</td>
             <td>${responsesString}</td>
             <td>${phraseLink}</td>
             <td>${imgHtml}</td>
            </tr>`
      );
    });
  };
};
