// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

import csv from 'csv-parser'
import fs from 'fs'
import search from './scrape.js'
import { Ocr } from './ocr.js'
import { MAX_IMAGE_COUNT_PER_QUERY } from '../site/src/shared.js'

const LOCALES = [
  // 'es_mx',
  // 'es_es',
  // 'en_ie',
  // 'en_us',
  'fr_fr'
]
const SRC = 'site/src'

// const MAX_QUERY_COUNT = 700 * 5
const MAX_QUERY_COUNT = 5 * 5

/**
 * Process the CSV files.
 * @param {function(string,string,string,string):Promise<void>} processCsvLine callback on each line
 * @return {Promise<number>} number of queries made
 */
const processCsv = (processCsvLine) => new Promise((resolve) => {
  const promises = []
  fs.createReadStream('data/words.csv')
    .pipe(csv())
    .on('data', (row) => {
      LOCALES.forEach((locale) => {
        if (promises.length > MAX_QUERY_COUNT) {
          return // bail out if we have exceeded the maximum
        }
        const [lang, country] = locale.split('_')
        if (row[lang + '_word']) {
        // const query = `${row[lang + '_category']}: ${row[lang + '_word']}`
          const prefix = row[lang + '_prefix']
          const query = row[lang + '_word']
          promises.push(processCsvLine(prefix, query, lang, country))
        }
      })
    })
    .on('end', () => {
      Promise.all(promises).then(() => resolve(promises.length))
    })
})

const main = async () => {
  const ocr = await Ocr()

  /**
   * Filter out images with text, and limit the number of images.
   * @param {!Array<Img>} images
   * @param {string} lang
   * @return {Promise<Array<Img>>} subset of the images
   */
  const filterImage = async (images, lang) => {
    const result = []
    for (let i = 0; i < images.length && result.length < MAX_IMAGE_COUNT_PER_QUERY; ++i) {
      const image = images[i]
      if (!(await ocr.hasText(`https:${image.src}`, lang))) {
        result.push(image)
      }
    }
    return result
  }

  const queryCount = await processCsv(async (a, b, c, d) => {})

  // Create an output fuile for each locale
  const outs = {}
  LOCALES.forEach((locale) => {
    const out = fs.createWriteStream(`${SRC}/words_${locale}.js`) // TODO(eob) add error handling
    out.write('/** @type {!Array<Word>} */\n')
    out.write('export const mergiWords = [\n')
    outs[locale] = out
  })

  let j = 0
  await processCsv(async (prefix, query, lang, country) => {
    const images = await search(query, lang, country, Math.min(queryCount, MAX_QUERY_COUNT))
    const filteredImages = await filterImage(images, lang)
    console.error(`Word# ${++j} ${query}`)

    const locale = `${lang}_${country}`
    const out = outs[locale]
    out.write('  {\n')
    if (prefix) {
      out.write(`    prefix: "${prefix}",\n`)
    }
    out.write(`    query: "${query}",\n`)
    out.write(`    lang: "${lang}",\n`)
    out.write(`    country: "${country}",\n`)
    out.write(`    images: ${JSON.stringify(filteredImages)}\n`)
    out.write('  },\n')
  })
  LOCALES.forEach((locale) => {
    const out = outs[locale]
    out.write(']\n')
  })
  ocr.cleanup()
}

main()
  .catch((e) => { console.error(e) })
