// const fs = require('fs')
const { google } = require('googleapis')

const auth = process.env.API_KEY

const customsearch = google.customsearch({
  version: 'v1',
  auth
})

const recurse = (response) => {
  for (const [key, value] of Object.entries(response)) {
    if (key === 'src' && response.width && response.height) {
      console.log('{')
      console.log(`  width: ${response.width},`)
      console.log(`  height: ${response.height},`)
      console.log(`  src: ${value},`)
      console.log('}')
    }
    if (value && typeof value === 'object') {
      recurse(value)
    }
  }
}

customsearch.cse.list({
  q: 'gata',
  cr: 'mx',
  cx: '010638580643288787684:gemilu8kqau',
  hl: 'es',
  lr: 'lang_es'
})
  .then((response) => {
    recurse(response)
  },
  (err) => { console.error('Execute error', err) }
  )
