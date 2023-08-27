// @ts-check

import imageSearchUrl from '../src/js/search_url.js'
import * as htmlparser2 from 'htmlparser2'
import fetch from 'node-fetch'
import sleep from './sleep.js'
// import { pp } from 'passprint'

const QUERIES_PER_MINUTE = 60.0

/**
 * @param {string} query what to search for
 * @param {string} language 2-letter language code
 * @param {string} country 2-letter country code
 * @param {number} ofTotalQueries total number of queries that this is one of
 * @return {Promise<!Array<Img> >} promise of a list of images
 */
export default async (query, language, country, ofTotalQueries) => {
  const images = []
  const url = imageSearchUrl(query, language, country)
  const parser = new htmlparser2.Parser(
    {
      onopentag (name, attribs) {
        if (name === 'img') {
          const imageUrl = attribs['data-src']
          if (imageUrl && imageUrl.startsWith('http')) {
            const src = imageUrl.replace(/^https?:/, '')
            const width = Number(attribs.width)
            const height = Number(attribs.height)
            if (Number.isInteger(width) && Number.isInteger(height)) {
              images.push({ width, height, src })
            }
          }
        }
      }
    }
  )
  const spreadOverMinutes = ofTotalQueries / QUERIES_PER_MINUTE
  await sleep(spreadOverMinutes * 60000.0 * Math.random())
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36'
    }
  })
  const data = await response.text()
  parser.write(data)
  parser.end()
  return images
}
