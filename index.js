const csv = require('csv-parser')
const fs = require('fs')
const { google } = require('googleapis')

const auth = process.env.API_KEY

if (!auth) {
  console.log('API_KEY environment variable not set. Doing dry run.')
}

const locales = ['es_mx']

const customsearch = google.customsearch({
  version: 'v1',
  auth
})

const recurse = (response) => {
  for (const [key, value] of Object.entries(response)) {
    if (key === 'src' && response.width && response.height) {
      console.log('      {')
      console.log(`        width: ${response.width},`)
      console.log(`        height: ${response.height},`)
      console.log(`        src: "${value}",`)
      console.log('      },')
    }
    if (value && typeof value === 'object') {
      recurse(value)
    }
  }
}

const processCsvLine = (query, lang, country) => {
  if (!auth) {
    console.log(`// ${lang}_${country} [${query}]`)
    return
  }
  customsearch.cse.list({
    q: query,
    // cr: `country${country.toUpperCase()}`,
    gl: country,
    cx: '010638580643288787684:gemilu8kqau',
    hl: lang,
    lr: `lang_${lang}`,
    num: 10
  })
    .then((response) => {
      console.log('  {')
      console.log(`    query: "${query}",`)
      console.log(`    lang: "${lang}",`)
      console.log(`    country: "${country}",`)
      console.log('    images: [')
      recurse(response)
      console.log('    ]')
      console.log('  },')
    },
    (err) => { console.error('Execute error', err) }
    )
}

console.log('mergiWords = [')
fs.createReadStream('data/words.csv')
  .pipe(csv())
  .on('data', (row) => {
    locales.forEach((locale) => {
      const [lang, country] = locale.split('_')
      if (row[lang + '_word']) {
        let query = row[lang + '_word']
        if (row[lang + '_category']) {
          query += ` (${row[lang + '_category']})`
          processCsvLine(query, lang, country)
        }
      }
    })
  })
  .on('end', () => {
  })
