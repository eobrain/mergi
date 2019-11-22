// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

import csv from 'csv-parser'
import fs from 'fs'
import { search } from './scrape.js'

// TODO(eob) refactor this into someplace shared with other index.js
const MAX_IMAGE_COUNT_PER_QUERY = 6

const LOCALES = ['es_mx']

const MAX_QUERY_COUNT = 700
// const MAX_QUERY_COUNT = 20

// Return promise of number of queries made
const processCsv = (processCsvLine) => new Promise((resolve, reject) => {
  const promises = []
  fs.createReadStream('data/words.csv')
    .pipe(csv())
    .on('data', (row) => {
      LOCALES.forEach((locale) => {
        if (promises.length > MAX_QUERY_COUNT) {
          return
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
  const filterImage = async (images) => {
    const result = []
    for (let i = 0; i < images.length && result.length < MAX_IMAGE_COUNT_PER_QUERY; ++i) {
      result.push(images[i])
    }
    return result
  }

  const queryCount = await processCsv(() => {})
  console.log(`// ${new Date()} ${queryCount} queries:`)
  console.log('export const mergiWords = [')
  const startTime = Date.now()

  const count = await processCsv(async (prefix, query, lang, country) => {
    const images = await search(query, lang, country, queryCount, MAX_QUERY_COUNT)
    const filteredImages = await filterImage(images)
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
}

main()
