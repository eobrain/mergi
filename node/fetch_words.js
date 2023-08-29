// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

// @ts-check

import csv from 'csv-parser'
import fs from 'fs'
import search from './scrape.js'
import hasText from './ocr.js'
import { MAX_IMAGE_COUNT_PER_QUERY } from '../src/js/shared.js'
import { DATA } from './config.js'
import { pp } from 'passprint'

// On momre powerful machines, use promises to get more concurrency
const USE_CONCURRENCY = false
const USE_OKR = false
const MIN_WIDTH = 50
const MIN_HEIGHT = 50

const LOCALES = [
  // 'es_mx',
  // 'es_es',
  // 'en_ie',
  // 'en_us',
  'fr_fr'
]
const SRC = 'src/js'

const MAX_QUERY_COUNT = 700 * 5
// const MAX_QUERY_COUNT = 5 * 5

/**
 * Process the CSV files.
 * @param {function(string,string,string,string):Promise<void>} processCsvLine callback on each line
 * @return {Promise<number>} number of queries made
 */
const processCsv = processCsvLine => new Promise(resolve => {
  const promises = []
  fs.createReadStream(DATA)
    .pipe(csv())
    .on('data', async row => {
      console.info(Object.keys(row).map(k => row[k]).join('|'))
      for (const locale of LOCALES) {
        pp(locale)
        if (promises.length > MAX_QUERY_COUNT) {
          console.info(`Bailing out. We have reached our max of ${MAX_QUERY_COUNT} queries`)
          return
        }
        const [lang, country] = locale.split('_')
        if (row[lang + '_word']) {
          const prefix = row[lang + '_prefix']
          const query = row[lang + '_word']
          const promise = processCsvLine(prefix, query, lang, country)
          promises.push(promise)
          if (!USE_CONCURRENCY) {
            await promise
          }
        }
      }
    })
    .on('end', () => {
      Promise.all(promises).then(() => resolve(promises.length))
    })
})

const main = async () => {
  /**
   * Filter out images with text, and limit the number of images.
   * @param {!Array<Img>} images candidate images
   * @param {string} lang 2-letter language code
   * @return {Promise<Array<Img>>} subset of the images with no text
   */
  const filterImage = async (images, lang) => {
    const result = []
    for (let i = 0; i < images.length && result.length < MAX_IMAGE_COUNT_PER_QUERY; ++i) {
      const image = images[i]
      if (image.width < MIN_WIDTH || image.height < MIN_HEIGHT) {
        continue
      }
      if (USE_OKR && (await hasText(`https:${image.src}`, lang))) {
        continue
      }
      result.push(image)
    }
    return result
  }

  const queryCount = pp(await processCsv(async (a, b, c, d) => {}))

  // Create an output fuile for each locale
  const outs = {}
  LOCALES.forEach(locale => {
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
  LOCALES.forEach(locale => {
    const out = outs[locale]
    out.write(']\n')
  })
}

main()
  .catch(e => { console.error(e) })
