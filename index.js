// Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html

const csv = require('csv-parser')
const fs = require('fs')
const { search } = require('./scrape.js')

const locales = ['es_mx']

const MAX = 107
// const MAX = 3

const processCsvLine = (query, lang, country) =>
  search(query, lang, country, MAX)
    .then((images) => {
      console.log('  {')
      console.log(`    query: "${query}",`)
      console.log(`    lang: "${lang}",`)
      console.log(`    country: "${country}",`)
      console.log(`    images: ${JSON.stringify(images)}`)
      console.log('  },')
    },
    (err) => { console.error('Execute error', err) }
    )

console.log('export const mergiWords = [')
const promises = []
const startTime = Date.now()
fs.createReadStream('data/words.csv')
  .pipe(csv())
  .on('data', (row) => {
    locales.forEach((locale) => {
      if (promises.length > MAX) {
        return
      }
      const [lang, country] = locale.split('_')
      if (row[lang + '_word']) {
        // const query = `${row[lang + '_category']}: ${row[lang + '_word']}`
        const query = row[lang + '_word']
        promises.push(processCsvLine(query, lang, country))
      }
    })
  })
  .on('end', () => {
    Promise.all(promises).then(() => {
      const dt = Date.now() - startTime
      console.log(`] // ${60 * 1000 * promises.length / dt} requests per minute`)
    })
  })
