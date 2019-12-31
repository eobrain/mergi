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

const LOCALES = ['es_mx']

// const MAX_QUERY_COUNT = 700
const MAX_QUERY_COUNT = 5

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
   * @return {Promise<Array<Img>>} subset of the images
   */
  const filterImage = async (images) => {
    const result = []
    for (let i = 0; i < images.length && result.length < MAX_IMAGE_COUNT_PER_QUERY; ++i) {
      const image = images[i]
      if (!(await ocr.hasText(image.src))) {
        result.push(image)
      }
    }
    return result
  }

  const queryCount = await processCsv(async (a, b, c, d) => {})
  console.log(`// ${new Date()} ${queryCount} queries:`)
  console.log('/** @type {!Array<Word>} */')
  console.log('export const mergiWords = [')
  const startTime = Date.now()

  let j = 0
  const count = await processCsv(async (prefix, query, lang, country) => {
    const images = await search(query, lang, country, Math.min(queryCount, MAX_QUERY_COUNT))
    const filteredImages = await filterImage(images)
    console.error(`Word# ${++j} ${query}`)
    console.log('  {')
    console.log(`    prefix: "${prefix}",`)
    console.log(`    query: "${query}",`)
    console.log(`    lang: "${lang}",`)
    console.log(`    country: "${country}",`)
    console.log(`    images: ${JSON.stringify(filteredImages)}`)
    console.log('  },')
  })
  const dt = Date.now() - startTime
  console.log(`] // ${new Date()} ${count}==${queryCount} ${60 * 1000 * count / dt} requests per minute`)
  ocr.cleanup()
}

main()
