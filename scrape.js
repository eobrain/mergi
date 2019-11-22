import { imageSearchUrl } from './site/searchurl.js'
import htmlparser2 from 'htmlparser2'
import fetch from 'node-fetch'

const QUERIES_PER_MINUTE = 60.0

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Returns promise of list of { width, height, src } objects
export const search = async (query, language, country, ofTotalQueries) => {
  const images = []
  const url = imageSearchUrl(query, language, country)
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
  const spreadOverMinutes = ofTotalQueries / QUERIES_PER_MINUTE
  await sleep(spreadOverMinutes * 60000.0 * Math.random())
  const response = await fetch(url)
  const data = await response.text()
  parser.write(data)
  parser.end()
  return images
}
