// @ts-check

import imageSearchUrl from '../site/src/search_url.js'
import htmlparser2 from 'htmlparser2'
import fetch from 'node-fetch'
import sleep from './sleep.js'

const QUERIES_PER_MINUTE = 60.0

//
/**
 *  Returns promise of list of { width, height, src } objects
 * @param {string} query
 * @param {string} language
 * @param {string} country
 * @param {number} ofTotalQueries
 * @return {Promise<!Array<Img> >}
 */
export default async (query, language, country, ofTotalQueries) => {
  const images = []
  const url = imageSearchUrl(query, language, country)
  const parser = new htmlparser2.Parser(
    {
      onopentag (name, attribs) {
        if (name === 'img') {
          const src = attribs.src
          if (src && src.startsWith('http')) {
            const width = Number(attribs.width)
            const height = Number(attribs.height)
            images.push({ width, height, src })
          }
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
