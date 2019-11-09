const htmlparser2 = require('htmlparser2')
const fetch = require('node-fetch')

const SPREAD_OVER_MINUTES = 10
const SPREAD_OVER_MS = 60000 * SPREAD_OVER_MINUTES

// Returns promise of list of { width, height, src } objects
const search = (query, language, country) => {
  const images = []
  const queryEnc = encodeURI(query)
  const url = `https://www.google.com/search?q=${queryEnc}+site:${country}&hl=${language}&tbm=isch`
  const parser = new htmlparser2.Parser(
    {
      onopentag (name, attribs) {
        if (name === 'img') {
          const width = Number(attribs.width)
          const height = Number(attribs.height)
          const src = attribs.src
          images.push({ width, height, src })
        }
      }
    }
  )
  return new Promise((resolve) => {
    setTimeout(() => {
      fetch(url).then((response) => response.text()).then((data) => {
        parser.write(data)
        parser.end()
        resolve(images)
      })
    }, SPREAD_OVER_MS * Math.random())
  })
}

module.exports = { search }
